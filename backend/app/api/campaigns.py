from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.campaign import Campaign


router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"],
)


class CampaignCreate(BaseModel):
    organization_id: UUID
    name: str = Field(
        min_length=2,
        max_length=255,
    )
    description: str | None = None
    action_type: str = Field(
        min_length=2,
        max_length=100,
    )
    target_segment: str | None = Field(
        default=None,
        max_length=100,
    )
    start_date: datetime | None = None
    end_date: datetime | None = None


class CampaignStatusUpdate(BaseModel):
    organization_id: UUID
    status: str = Field(
        min_length=2,
        max_length=50,
    )


ALLOWED_STATUSES = {
    "draft",
    "scheduled",
    "active",
    "paused",
    "completed",
}


def _serialize_campaign(
    campaign: Campaign,
):
    return {
        "id": str(campaign.id),
        "organization_id": str(
            campaign.organization_id
        ),
        "name": campaign.name,
        "description": campaign.description,
        "action_type": campaign.action_type,
        "target_segment":
            campaign.target_segment,
        "status": campaign.status,
        "start_date": campaign.start_date,
        "end_date": campaign.end_date,
        "created_at": campaign.created_at,
    }


@router.post("/")
def create_campaign(
    data: CampaignCreate,
    db: Session = Depends(get_db),
):
    name = data.name.strip()
    action_type = data.action_type.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Campaign name is required.",
        )

    if not action_type:
        raise HTTPException(
            status_code=400,
            detail="Action type is required.",
        )

    if (
        data.start_date
        and data.end_date
        and data.end_date
        < data.start_date
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "End date cannot be earlier "
                "than start date."
            ),
        )

    campaign = Campaign(
        organization_id=data.organization_id,
        name=name,
        description=data.description,
        action_type=action_type,
        target_segment=data.target_segment,
        status="draft",
        start_date=data.start_date,
        end_date=data.end_date,
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return _serialize_campaign(
        campaign
    )


@router.get("/")
def list_campaigns(
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    campaigns = (
        db.query(Campaign)
        .filter(
            Campaign.organization_id
            == organization_id
        )
        .order_by(
            Campaign.created_at.desc()
        )
        .all()
    )

    return [
        _serialize_campaign(campaign)
        for campaign in campaigns
    ]


@router.get("/{campaign_id}")
def get_campaign(
    campaign_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.id == campaign_id,
            Campaign.organization_id
            == organization_id,
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found.",
        )

    return _serialize_campaign(
        campaign
    )


@router.patch("/{campaign_id}/status")
def update_campaign_status(
    campaign_id: UUID,
    data: CampaignStatusUpdate,
    db: Session = Depends(get_db),
):
    status = data.status.strip().lower()

    if status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid campaign status. "
                "Allowed values are: "
                "draft, scheduled, active, "
                "paused, completed."
            ),
        )

    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.id == campaign_id,
            Campaign.organization_id
            == data.organization_id,
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found.",
        )

    campaign.status = status

    db.commit()
    db.refresh(campaign)

    return _serialize_campaign(
        campaign
    )
