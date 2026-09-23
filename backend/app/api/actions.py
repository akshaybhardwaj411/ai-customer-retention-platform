from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.campaign_customer import CampaignCustomer
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
    action_type = data.action_type.strip()

    if not action_type:
        raise HTTPException(
            status_code=400,
            detail="Action type is required.",
        )

    action = RetentionAction(
        organization_id=data.organization_id,
        customer_id=data.customer_id,
        action_type=action_type,
        status="pending",
        recommendation=data.recommendation,
    )

    db.add(action)
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
    }


@router.post(
    "/{action_id}/execute"
)
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
            "message": (
                "Action has already "
                "been executed."
            ),
        }

    action.status = "completed"

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

    campaign_customer = (
        db.query(CampaignCustomer)
        .filter(
            CampaignCustomer.organization_id
            == organization_id,
            CampaignCustomer.retention_action_id
            == action.id,
        )
        .first()
    )

    if campaign_customer:
        campaign_customer.status = (
            "executed"
        )

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
        "message": (
            "Retention action "
            "executed successfully. "
            "Record the customer outcome "
            "separately."
        ),
    }
