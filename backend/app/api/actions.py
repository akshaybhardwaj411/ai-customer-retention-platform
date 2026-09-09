from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.retention_action import RetentionAction


router = APIRouter(
    prefix="/actions",
    tags=["Retention Actions"],
)


class ActionCreate(BaseModel):
    organization_id: UUID
    customer_id: UUID
    action_type: str
    recommendation: str | None = None


@router.post("/")
def create_action(
    data: ActionCreate,
    db: Session = Depends(get_db),
):
    action = RetentionAction(
        organization_id=data.organization_id,
        customer_id=data.customer_id,
        action_type=data.action_type,
        recommendation=data.recommendation,
        status="pending",
    )

    db.add(action)
    db.commit()
    db.refresh(action)

    return {
        "id": str(action.id),
        "customer_id": str(action.customer_id),
        "action_type": action.action_type,
        "status": action.status,
        "recommendation": action.recommendation,
    }
