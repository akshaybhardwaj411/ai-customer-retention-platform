from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.recommendation import Recommendation
from app.models.retention_action import RetentionAction


router = APIRouter(
    prefix="/action-center",
    tags=["Action Center"],
)


@router.get("/")
def get_action_center(
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    actions = (
        db.query(RetentionAction)
        .filter(
            RetentionAction.organization_id
            == organization_id,
            RetentionAction.status
            == "pending",
        )
        .order_by(
            RetentionAction.created_at.desc()
        )
        .all()
    )

    recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.organization_id
            == organization_id,
            Recommendation.status
            == "pending",
        )
        .order_by(
            Recommendation.created_at.desc()
        )
        .all()
    )

    action_items = [
        {
            "id": str(action.id),
            "customer_id": str(
                action.customer_id
            ),
            "action_type": action.action_type,
            "status": action.status,
            "recommendation": (
                action.recommendation
            ),
            "source": "retention_action",
        }
        for action in actions
    ]

    recommendation_items = [
        {
            "id": str(
                recommendation.id
            ),
            "customer_id": str(
                recommendation.customer_id
            ),
            "action_type": (
                recommendation.action_type
            ),
            "status": recommendation.status,
            "recommendation": (
                recommendation.reason
            ),
            "source": "ai_recommendation",
        }
        for recommendation in recommendations
    ]

    combined = (
        action_items +
        recommendation_items
    )

    return {
        "total_actions": len(combined),
        "actions": combined,
    }
