from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
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
            RetentionAction.organization_id == organization_id,
            RetentionAction.status == "pending",
        )
        .order_by(RetentionAction.created_at.desc())
        .all()
    )

    return {
        "total_actions": len(actions),
        "actions": [
            {
                "id": str(action.id),
                "customer_id": str(action.customer_id),
                "action_type": action.action_type,
                "status": action.status,
                "recommendation": action.recommendation,
            }
            for action in actions
        ],
    }
