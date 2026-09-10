from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.action_outcome import ActionOutcome


router = APIRouter(
    prefix="/outcomes",
    tags=["Action Outcomes"],
)


class OutcomeCreate(BaseModel):
    organization_id: UUID
    action_id: UUID
    customer_id: UUID
    outcome: str
    revenue_saved: float | None = None


@router.post("/")
def create_outcome(
    data: OutcomeCreate,
    db: Session = Depends(get_db),
):
    outcome = ActionOutcome(
        organization_id=data.organization_id,
        action_id=data.action_id,
        customer_id=data.customer_id,
        outcome=data.outcome,
        revenue_saved=data.revenue_saved,
    )

    db.add(outcome)
    db.commit()
    db.refresh(outcome)

    return {
        "id": str(outcome.id),
        "action_id": str(outcome.action_id),
        "customer_id": str(outcome.customer_id),
        "outcome": outcome.outcome,
        "revenue_saved": outcome.revenue_saved,
    }
