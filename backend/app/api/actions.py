from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.action_outcome import ActionOutcome
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


@router.post("/{action_id}/execute")
def execute_action(
    action_id: UUID,
    db: Session = Depends(get_db),
):
    action = (
        db.query(RetentionAction)
        .filter(RetentionAction.id == action_id)
        .first()
    )

    if not action:
        raise HTTPException(
            status_code=404,
            detail="Retention action not found.",
        )

    if action.status == "completed":
        return {
            "id": str(action.id),
            "customer_id": str(action.customer_id),
            "action_type": action.action_type,
            "status": action.status,
            "message": "Action was already executed.",
        }

    action.status = "completed"

    outcome = ActionOutcome(
        organization_id=action.organization_id,
        action_id=action.id,
        customer_id=action.customer_id,
        outcome="executed",
        revenue_saved=None,
    )

    db.add(outcome)
    db.commit()
    db.refresh(action)

    return {
        "id": str(action.id),
        "customer_id": str(action.customer_id),
        "action_type": action.action_type,
        "status": action.status,
        "message": "Retention action executed and outcome recorded.",
    }
