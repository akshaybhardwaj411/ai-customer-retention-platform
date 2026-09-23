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


@router.get("/{customer_id}")
def get_next_best_action(
    customer_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    recommendation = (
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

    if recommendation:
        return {
            "customer_id": str(customer_id),
            "action": recommendation.action_type,
            "reason": recommendation.reason,
            "expected_value": None,
            "status": recommendation.status,
            "source": "stored_recommendation",
        }

    prediction = (
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

    if not prediction:
        return {
            "customer_id": str(customer_id),
            "action": None,
            "reason": None,
            "expected_value": None,
            "status": "not_available",
            "source": "no_prediction",
        }

    model = load_model()
    feature_columns = load_feature_columns()

    if model is None or feature_columns is None:
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

    # Customer 360 prediction fields are currently
    # the supported explanation inputs.
    customer_data = {}

    try:
        risk_factors = explain_customer_churn(
            model=model,
            customer_data=customer_data,
        )
    except Exception:
        risk_factors = []

    recommendation_data = (
        generate_recommendation(
            risk_factors
        )
    )

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
