from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.campaign import Campaign
from app.models.campaign_customer import CampaignCustomer
from app.models.customer import Customer
from app.models.prediction import Prediction


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


class CampaignTargetRequest(BaseModel):
    organization_id: UUID
    segment: str = Field(
        min_length=2,
        max_length=100,
    )


ALLOWED_STATUSES = {
    "draft",
    "scheduled",
    "active",
    "paused",
    "completed",
}


ALLOWED_SEGMENTS = {
    "critical_risk",
    "high_risk",
    "medium_risk",
    "low_risk",
    "all_customers",
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


def _get_latest_predictions(
    organization_id: UUID,
    db: Session,
):
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

    return prediction_map


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

    customer_count = (
        db.query(CampaignCustomer)
        .filter(
            CampaignCustomer.campaign_id
            == campaign_id,
            CampaignCustomer.organization_id
            == organization_id,
        )
        .count()
    )

    response = _serialize_campaign(
        campaign
    )

    response["customer_count"] = (
        customer_count
    )

    return response


@router.patch(
    "/{campaign_id}/status"
)
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


@router.post(
    "/{campaign_id}/target"
)
def target_campaign_customers(
    campaign_id: UUID,
    data: CampaignTargetRequest,
    db: Session = Depends(get_db),
):
    segment = (
        data.segment
        .strip()
        .lower()
    )

    if segment not in ALLOWED_SEGMENTS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid target segment. "
                "Allowed values are: "
                "critical_risk, high_risk, "
                "medium_risk, low_risk, "
                "all_customers."
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

    customers = (
        db.query(Customer)
        .filter(
            Customer.organization_id
            == data.organization_id
        )
        .all()
    )

    prediction_map = (
        _get_latest_predictions(
            organization_id=
                data.organization_id,
            db=db,
        )
    )

    added = 0
    skipped = 0

    for customer in customers:
        prediction = prediction_map.get(
            str(customer.id)
        )

        risk_level = (
            prediction.risk_level
            if prediction
            else None
        )

        if segment == "all_customers":
            matches = True
        else:
            matches = (
                risk_level
                == segment.replace(
                    "_risk",
                    "",
                )
            )

        if not matches:
            continue

        existing = (
            db.query(CampaignCustomer)
            .filter(
                CampaignCustomer.campaign_id
                == campaign_id,
                CampaignCustomer.customer_id
                == customer.id,
                CampaignCustomer.organization_id
                == data.organization_id,
            )
            .first()
        )

        if existing:
            skipped += 1
            continue

        campaign_customer = CampaignCustomer(
            organization_id=
                data.organization_id,
            campaign_id=campaign_id,
            customer_id=customer.id,
            status="pending",
            outcome=None,
        )

        db.add(campaign_customer)
        added += 1

    campaign.target_segment = segment

    db.commit()

    return {
        "campaign_id": str(
            campaign_id
        ),
        "segment": segment,
        "added": added,
        "skipped": skipped,
        "message": (
            "Campaign customers "
            "targeted successfully."
        ),
    }


@router.get(
    "/{campaign_id}/customers"
)
def list_campaign_customers(
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

    campaign_customers = (
        db.query(
            CampaignCustomer
        )
        .filter(
            CampaignCustomer.campaign_id
            == campaign_id,
            CampaignCustomer.organization_id
            == organization_id,
        )
        .all()
    )

    customer_ids = [
        item.customer_id
        for item in campaign_customers
    ]

    customers = (
        db.query(Customer)
        .filter(
            Customer.organization_id
            == organization_id,
            Customer.id.in_(
                customer_ids
            )
        )
        .all()
        if customer_ids
        else []
    )

    customer_map = {
        str(customer.id): customer
        for customer in customers
    }

    return [
        {
            "id": str(item.id),
            "campaign_id": str(
                item.campaign_id
            ),
            "customer_id": str(
                item.customer_id
            ),
            "customer_name": (
                customer_map[
                    str(item.customer_id)
                ].name
                if str(item.customer_id)
                in customer_map
                else "Unknown customer"
            ),
            "customer_email": (
                customer_map[
                    str(item.customer_id)
                ].email
                if str(item.customer_id)
                in customer_map
                else None
            ),
            "status": item.status,
            "outcome": item.outcome,
            "created_at":
                item.created_at,
        }
        for item in campaign_customers
    ]
