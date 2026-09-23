from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.action_outcome import ActionOutcome
from app.models.customer import Customer
from app.models.recommendation import Recommendation
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
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == data.customer_id,
            Customer.organization_id
            == data.organization_id,
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found.",
        )

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
        "customer_id": str(
            action.customer_id
        ),
        "action_type": action.action_type,
        "status": action.status,
        "recommendation":
            action.recommendation,
    }


@router.post("/{action_id}/execute")
def execute_action(
    action_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    action = (
        db.query(RetentionAction)
        .filter(
            RetentionAction.id == action_id,
            RetentionAction.organization_id
            == organization_id,
        )
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
            "customer_id": str(
                action.customer_id
            ),
            "action_type":
                action.action_type,
            "status": action.status,
            "recommendation":
                action.recommendation,
            "message":
                "Action was already executed.",
        }

    action.status = "completed"

    # --------------------------------------------------
    # Mark matching pending recommendation as completed
    # --------------------------------------------------

    recommendation = (
        db.query(Recommendation)
        .filter(
            Recommendation.organization_id
            == organization_id,
            Recommendation.customer_id
            == action.customer_id,
            Recommendation.action_type
            == action.action_type,
            Recommendation.status
            == "pending",
        )
        .order_by(
            Recommendation.created_at.desc()
        )
        .first()
    )

    if recommendation:
        recommendation.status = "completed"

    # --------------------------------------------------
    # Record execution outcome
    # --------------------------------------------------

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
        "customer_id": str(
            action.customer_id
        ),
        "action_type":
            action.action_type,
        "status": action.status,
        "recommendation":
            action.recommendation,
        "message":
            "Retention action executed and recommendation updated.",
    }
