from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.services.ml_service import (
    explain_customer_churn,
    load_feature_columns,
    load_model,
)
from app.services.recommendation_service import (
    generate_recommendation,
)

router = APIRouter(
    prefix="/next-best-action",
    tags=["Next Best Action"],
)


def _get_latest_prediction(
    customer_id: UUID,
    organization_id: UUID,
    db: Session,
):
    return (
        db.query(Prediction)
        .filter(
            Prediction.customer_id == customer_id,
            Prediction.organization_id == organization_id,
        )
        .order_by(
            Prediction.created_at.desc()
        )
        .first()
    )


def _get_pending_recommendation(
    customer_id: UUID,
    organization_id: UUID,
    db: Session,
):
    return (
        db.query(Recommendation)
        .filter(
            Recommendation.customer_id == customer_id,
            Recommendation.organization_id == organization_id,
            Recommendation.status == "pending",
        )
        .order_by(
            Recommendation.created_at.desc()
        )
        .first()
    )


@router.get("/{customer_id}")
def get_next_best_action(
    customer_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------
    # 1. Return an existing pending recommendation
    # --------------------------------------------------

    existing_recommendation = (
        _get_pending_recommendation(
            customer_id=customer_id,
            organization_id=organization_id,
            db=db,
        )
    )

    if existing_recommendation:
        return {
            "customer_id": str(customer_id),
            "action": existing_recommendation.action_type,
            "reason": existing_recommendation.reason,
            "expected_value": None,
            "status": existing_recommendation.status,
            "source": "stored_recommendation",
        }

    # --------------------------------------------------
    # 2. Check whether a churn prediction exists
    # --------------------------------------------------

    prediction = _get_latest_prediction(
        customer_id=customer_id,
        organization_id=organization_id,
        db=db,
    )

    if not prediction:
        return {
            "customer_id": str(customer_id),
            "action": None,
            "reason": None,
            "expected_value": None,
            "status": "not_available",
            "source": "no_prediction",
        }

    # --------------------------------------------------
    # 3. Check ML readiness
    # --------------------------------------------------

    model = load_model()
    feature_columns = load_feature_columns()

    if (
        model is None
        or feature_columns is None
    ):
        return {
            "customer_id": str(customer_id),
            "action": "review_customer",
            "reason": (
                "Review the customer for available "
                "retention opportunities."
            ),
            "expected_value": None,
            "status": "available",
            "source": "fallback",
        }

    # --------------------------------------------------
    # 4. Generate recommendation
    #
    # NOTE:
    # The prediction endpoint currently receives and
    # stores customer prediction data but does not yet
    # persist that raw feature payload.
    #
    # Therefore this endpoint uses a safe fallback
    # until customer feature persistence is added.
    # --------------------------------------------------

    risk_factors = []

    try:
        risk_factors = explain_customer_churn(
            model=model,
            customer_data={},
        )
    except Exception:
        risk_factors = []

    recommendation_data = (
        generate_recommendation(
            risk_factors=risk_factors,
        )
    )

    # --------------------------------------------------
    # 5. Persist recommendation
    # --------------------------------------------------

    recommendation = Recommendation(
        organization_id=organization_id,
        customer_id=customer_id,
        action_type=recommendation_data[
            "action_type"
        ],
        reason=recommendation_data[
            "reason"
        ],
        status="pending",
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return {
        "customer_id": str(customer_id),
        "action": recommendation.action_type,
        "reason": recommendation.reason,
        "expected_value": None,
        "status": recommendation.status,
        "source": "risk_based_recommendation",
    }
