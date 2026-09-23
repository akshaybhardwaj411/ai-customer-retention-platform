from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.models.retention_action import RetentionAction


router = APIRouter(
    prefix="/action-center",
    tags=["Action Center"],
)


def _priority_value(
    risk_level: str | None,
) -> int:
    values = {
        "critical": 4,
        "high": 3,
        "medium": 2,
        "low": 1,
    }

    return values.get(
        risk_level or "low",
        0,
    )


@router.get("/")
def get_action_center(
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------
    # Pending retention actions
    # --------------------------------------------------

    actions = (
        db.query(RetentionAction)
        .filter(
            RetentionAction.organization_id
            == organization_id,
            RetentionAction.status
            == "pending",
        )
        .all()
    )

    # --------------------------------------------------
    # Pending AI recommendations
    # --------------------------------------------------

    recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.organization_id
            == organization_id,
            Recommendation.status
            == "pending",
        )
        .all()
    )

    # --------------------------------------------------
    # Latest prediction per customer
    # --------------------------------------------------

    predictions = (
        db.query(Prediction)
        .filter(
            Prediction.organization_id
            == organization_id
        )
        .all()
    )

    prediction_map = {}

    for prediction in predictions:
        customer_id = str(
            prediction.customer_id
        )

        existing = prediction_map.get(
            customer_id
        )

        if (
            existing is None
            or prediction.created_at
            > existing.created_at
        ):
            prediction_map[
                customer_id
            ] = prediction

    # --------------------------------------------------
    # Retention action items
    # --------------------------------------------------

    action_items = []

    for action in actions:
        prediction = prediction_map.get(
            str(action.customer_id)
        )

        risk_level = (
            prediction.risk_level
            if prediction
            else "unknown"
        )

        action_items.append(
            {
                "id": str(action.id),
                "customer_id": str(
                    action.customer_id
                ),
                "action_type": action.action_type,
                "status": action.status,
                "recommendation":
                    action.recommendation,
                "risk_level": risk_level,
                "priority":
                    _priority_value(
                        risk_level
                    ),
                "source":
                    "retention_action",
            }
        )

    # --------------------------------------------------
    # AI recommendation items
    # --------------------------------------------------

    recommendation_items = []

    for recommendation in recommendations:
        prediction = prediction_map.get(
            str(
                recommendation.customer_id
            )
        )

        risk_level = (
            prediction.risk_level
            if prediction
            else "unknown"
        )

        recommendation_items.append(
            {
                "id": str(
                    recommendation.id
                ),
                "customer_id": str(
                    recommendation.customer_id
                ),
                "action_type":
                    recommendation.action_type,
                "status":
                    recommendation.status,
                "recommendation":
                    recommendation.reason,
                "risk_level":
                    risk_level,
                "priority":
                    _priority_value(
                        risk_level
                    ),
                "source":
                    "ai_recommendation",
            }
        )

    # --------------------------------------------------
    # Combine and prioritize
    # --------------------------------------------------

    combined = (
        action_items
        + recommendation_items
    )

    combined.sort(
        key=lambda item: (
            item["priority"],
            item["action_type"],
        ),
        reverse=True,
    )

    # --------------------------------------------------
    # Summary
    # --------------------------------------------------

    critical = sum(
        1
        for item in combined
        if item["risk_level"]
        == "critical"
    )

    high = sum(
        1
        for item in combined
        if item["risk_level"]
        == "high"
    )

    medium = sum(
        1
        for item in combined
        if item["risk_level"]
        == "medium"
    )

    low = sum(
        1
        for item in combined
        if item["risk_level"]
        == "low"
    )

    return {
        "total_actions": len(combined),
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
        "actions": combined,
    }
