from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.action_outcome import ActionOutcome
from app.models.campaign_customer import CampaignCustomer
from app.models.retention_action import RetentionAction


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


ALLOWED_OUTCOMES = {
    "saved",
    "not_saved",
    "no_response",
    "unknown",
}


@router.post("/")
def create_outcome(
    data: OutcomeCreate,
    db: Session = Depends(get_db),
):
    outcome_value = (
        data.outcome.strip().lower()
    )

    if outcome_value not in ALLOWED_OUTCOMES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid outcome. "
                "Allowed values are: "
                "saved, not_saved, "
                "no_response, unknown."
            ),
        )

    action = (
        db.query(RetentionAction)
        .filter(
            RetentionAction.id
            == data.action_id,
            RetentionAction.organization_id
            == data.organization_id,
            RetentionAction.customer_id
            == data.customer_id,
        )
        .first()
    )

    if not action:
        raise HTTPException(
            status_code=404,
            detail="Retention action not found.",
        )

    if action.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=(
                "The retention action must be "
                "executed before recording an outcome."
            ),
        )

    existing_outcome = (
        db.query(ActionOutcome)
        .filter(
            ActionOutcome.action_id
            == data.action_id,
            ActionOutcome.organization_id
            == data.organization_id,
            ActionOutcome.customer_id
            == data.customer_id,
        )
        .first()
    )

    if existing_outcome:
        raise HTTPException(
            status_code=409,
            detail=(
                "An outcome has already been "
                "recorded for this action."
            ),
        )

    if (
        outcome_value != "saved"
        and data.revenue_saved is not None
        and data.revenue_saved != 0
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Revenue saved can only be recorded "
                "when the outcome is 'saved'."
            ),
        )

    if (
        data.revenue_saved is not None
        and data.revenue_saved < 0
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Revenue saved cannot be negative."
            ),
        )

    outcome = ActionOutcome(
        organization_id=data.organization_id,
        action_id=data.action_id,
        customer_id=data.customer_id,
        outcome=outcome_value,
        revenue_saved=(
            data.revenue_saved
            if outcome_value == "saved"
            else None
        ),
    )

    db.add(outcome)

    campaign_customer = (
        db.query(CampaignCustomer)
        .filter(
            CampaignCustomer.organization_id
            == data.organization_id,
            CampaignCustomer.retention_action_id
            == data.action_id,
            CampaignCustomer.customer_id
            == data.customer_id,
        )
        .first()
    )

    if campaign_customer:
        campaign_customer.outcome = (
            outcome_value
        )

        campaign_customer.status = (
            "outcome_recorded"
        )

    db.commit()
    db.refresh(outcome)

    return {
        "id": str(outcome.id),
        "action_id": str(
            outcome.action_id
        ),
        "customer_id": str(
            outcome.customer_id
        ),
        "outcome": outcome.outcome,
        "revenue_saved": (
            float(outcome.revenue_saved)
            if outcome.revenue_saved
            is not None
            else None
        ),
    }
