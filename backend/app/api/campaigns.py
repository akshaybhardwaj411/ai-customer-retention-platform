from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator, model_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.action_outcome import ActionOutcome
from app.models.campaign import Campaign
from app.models.campaign_customer import CampaignCustomer
from app.models.customer import Customer
from app.models.prediction import Prediction
from app.models.retention_action import RetentionAction
from app.services.campaign_scheduler_service import (
    process_scheduled_campaigns,
)


router = APIRouter(
    prefix="/campaigns",
    tags=["campaigns"],
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


ALLOWED_TRANSITIONS = {
    "draft": {
        "scheduled",
        "active",
    },
    "scheduled": {
        "active",
        "paused",
    },
    "active": {
        "paused",
        "completed",
    },
    "paused": {
        "active",
        "completed",
    },
    "completed": set(),
}


class CampaignCreate(BaseModel):
    organization_id: UUID
    name: str
    description: Optional[str] = None
    action_type: str
    target_segment: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @field_validator(
        "name",
        "action_type",
        mode="before",
    )
    @classmethod
    def validate_required_strings(
        cls,
        value,
    ):
        if value is None:
            return value

        if not isinstance(value, str):
            raise ValueError(
                "Value must be a string."
            )

        value = value.strip()

        if not value:
            raise ValueError(
                "Value cannot be empty."
            )

        return value

    @field_validator(
        "description",
        mode="before",
    )
    @classmethod
    def normalize_description(
        cls,
        value,
    ):
        if value is None:
            return None

        if not isinstance(value, str):
            raise ValueError(
                "Description must be a string."
            )

        value = value.strip()

        return value or None

    @field_validator(
        "target_segment",
        mode="before",
    )
    @classmethod
    def normalize_segment(
        cls,
        value,
    ):
        if value is None:
            return None

        if not isinstance(value, str):
            raise ValueError(
                "Target segment must be a string."
            )

        value = value.strip().lower()

        return value or None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date
            and self.end_date
            and self.end_date
            < self.start_date
        ):
            raise ValueError(
                "End date cannot be earlier than start date."
            )

        return self


class CampaignStatusUpdate(BaseModel):
    organization_id: UUID
    status: str

    @field_validator(
        "status",
        mode="before",
    )
    @classmethod
    def normalize_status(
        cls,
        value,
    ):
        if not isinstance(value, str):
            raise ValueError(
                "Status must be a string."
            )

        value = value.strip().lower()

        if not value:
            raise ValueError(
                "Status cannot be empty."
            )

        return value


class CampaignTargetRequest(BaseModel):
    organization_id: UUID
    segment: str

    @field_validator(
        "segment",
        mode="before",
    )
    @classmethod
    def normalize_segment(
        cls,
        value,
    ):
        if not isinstance(value, str):
            raise ValueError(
                "Segment must be a string."
            )

        value = value.strip().lower()

        if not value:
            raise ValueError(
                "Segment cannot be empty."
            )

        return value


def _normalize_datetime(
    value: Optional[datetime],
) -> Optional[datetime]:
    if value is None:
        return None

    if value.tzinfo is None:
        return value.replace(
            tzinfo=timezone.utc
        )

    return value.astimezone(
        timezone.utc
    )


def _serialize_campaign(
    campaign: Campaign,
    customer_count: Optional[int] = None,
):
    data = {
        "id": str(campaign.id),
        "organization_id": str(
            campaign.organization_id
        ),
        "name": campaign.name,
        "description": campaign.description,
        "action_type": campaign.action_type,
        "target_segment": campaign.target_segment,
        "status": campaign.status,
        "start_date": (
            campaign.start_date.isoformat()
            if campaign.start_date
            else None
        ),
        "end_date": (
            campaign.end_date.isoformat()
            if campaign.end_date
            else None
        ),
        "created_at": (
            campaign.created_at.isoformat()
            if campaign.created_at
            else None
        ),
    }

    if customer_count is not None:
        data["customer_count"] = customer_count

    return data


def _get_latest_predictions(
    db: Session,
    organization_id: UUID,
):
    predictions = (
        db.query(Prediction)
        .filter(
            Prediction.organization_id
            == organization_id,
        )
        .order_by(
            Prediction.customer_id,
            Prediction.created_at.desc(),
        )
        .all()
    )

    latest_predictions = {}

    for prediction in predictions:
        customer_id = str(
            prediction.customer_id
        )

        if customer_id not in latest_predictions:
            latest_predictions[
                customer_id
            ] = prediction

    return latest_predictions


@router.post("/")
def create_campaign(
    data: CampaignCreate,
    db: Session = Depends(get_db),
):
    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Campaign name is required.",
        )

    action_type = data.action_type.strip()

    if not action_type:
        raise HTTPException(
            status_code=400,
            detail="Action type is required.",
        )

    target_segment = (
        data.target_segment
        if data.target_segment
        else None
    )

    if (
        target_segment
        and target_segment
        not in ALLOWED_SEGMENTS
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid target segment. "
                "Allowed values are: "
                + ", ".join(
                    sorted(ALLOWED_SEGMENTS)
                )
            ),
        )

    start_date = _normalize_datetime(
        data.start_date
    )

    end_date = _normalize_datetime(
        data.end_date
    )

    if (
        start_date
        and end_date
        and end_date < start_date
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Campaign end date cannot "
                "be earlier than start date."
            ),
        )

    campaign = Campaign(
        organization_id=data.organization_id,
        name=name,
        description=data.description,
        action_type=action_type,
        target_segment=target_segment,
        status="draft",
        start_date=start_date,
        end_date=end_date,
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
    process_scheduled_campaigns(db)

    campaigns = (
        db.query(Campaign)
        .filter(
            Campaign.organization_id
            == organization_id,
        )
        .order_by(
            Campaign.created_at.desc()
        )
        .all()
    )

    results = []

    for campaign in campaigns:
        customer_count = (
            db.query(CampaignCustomer)
            .filter(
                CampaignCustomer.campaign_id
                == campaign.id,
                CampaignCustomer.organization_id
                == organization_id,
            )
            .count()
        )

        results.append(
            _serialize_campaign(
                campaign,
                customer_count=customer_count,
            )
        )

    return results


@router.get("/{campaign_id}")
def get_campaign(
    campaign_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    process_scheduled_campaigns(db)

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
            == campaign.id,
            CampaignCustomer.organization_id
            == organization_id,
        )
        .count()
    )

    return _serialize_campaign(
        campaign,
        customer_count=customer_count,
    )


@router.get(
    "/{campaign_id}/analytics"
)
def get_campaign_analytics(
    campaign_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    process_scheduled_campaigns(db)

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
        db.query(CampaignCustomer)
        .filter(
            CampaignCustomer.campaign_id
            == campaign_id,
            CampaignCustomer.organization_id
            == organization_id,
        )
        .all()
    )

    targeted_customers = len(
        campaign_customers
    )

    actions_created = sum(
        1
        for item in campaign_customers
        if item.retention_action_id
    )

    actions_executed = sum(
        1
        for item in campaign_customers
        if item.status in {
            "executed",
            "outcome_recorded",
        }
    )

    outcomes_recorded = sum(
        1
        for item in campaign_customers
        if item.outcome
    )

    saved = sum(
        1
        for item in campaign_customers
        if item.outcome == "saved"
    )

    not_saved = sum(
        1
        for item in campaign_customers
        if item.outcome == "not_saved"
    )

    no_response = sum(
        1
        for item in campaign_customers
        if item.outcome == "no_response"
    )

    unknown = sum(
        1
        for item in campaign_customers
        if item.outcome == "unknown"
    )

    resolved_outcomes = (
        saved + not_saved
    )

    save_rate = (
        (saved / resolved_outcomes) * 100
        if resolved_outcomes > 0
        else 0
    )

    action_ids = [
        item.retention_action_id
        for item in campaign_customers
        if item.retention_action_id
    ]

    revenue_saved = 0

    if action_ids:
        revenue_result = (
            db.query(
                func.coalesce(
                    func.sum(
                        ActionOutcome.revenue_saved
                    ),
                    0,
                )
            )
            .filter(
                ActionOutcome.organization_id
                == organization_id,
                ActionOutcome.action_id.in_(
                    action_ids
                ),
                ActionOutcome.outcome
                == "saved",
            )
            .scalar()
        )

        revenue_saved = float(
            revenue_result or 0
        )

    return {
        "campaign_id": str(
            campaign.id
        ),
        "campaign_name": campaign.name,
        "status": campaign.status,
        "target_segment": campaign.target_segment,
        "targeted_customers": targeted_customers,
        "actions_created": actions_created,
        "actions_executed": actions_executed,
        "outcomes_recorded": outcomes_recorded,
        "saved": saved,
        "not_saved": not_saved,
        "no_response": no_response,
        "unknown": unknown,
        "resolved_outcomes": resolved_outcomes,
        "save_rate": save_rate,
        "revenue_saved": revenue_saved,
    }


@router.patch(
    "/{campaign_id}/status"
)
def update_campaign_status(
    campaign_id: UUID,
    data: CampaignStatusUpdate,
    db: Session = Depends(get_db),
):
    process_scheduled_campaigns(db)

    requested_status = data.status

    if requested_status not in ALLOWED_STATUSES:
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

    current_status = campaign.status

    if (
        requested_status
        not in ALLOWED_TRANSITIONS.get(
            current_status,
            set(),
        )
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Campaign cannot move "
                f"from '{current_status}' "
                f"to '{requested_status}'."
            ),
        )

    if requested_status == "scheduled":
        if not campaign.start_date:
            raise HTTPException(
                status_code=400,
                detail=(
                    "A start date is required "
                    "before scheduling a campaign."
                ),
            )

        start_date = _normalize_datetime(
            campaign.start_date
        )

        end_date = _normalize_datetime(
            campaign.end_date
        )

        if (
            end_date
            and start_date
            and end_date < start_date
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Campaign end date cannot "
                    "be earlier than start date."
                ),
            )

    if requested_status == "active":
        customer_count = (
            db.query(CampaignCustomer)
            .filter(
                CampaignCustomer.campaign_id
                == campaign_id,
                CampaignCustomer.organization_id
                == data.organization_id,
            )
            .count()
        )

        if customer_count == 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Campaign cannot be activated "
                    "without targeted customers."
                ),
            )

    campaign.status = requested_status

    db.commit()
    db.refresh(campaign)

    customer_count = (
        db.query(CampaignCustomer)
        .filter(
            CampaignCustomer.campaign_id
            == campaign.id,
            CampaignCustomer.organization_id
            == data.organization_id,
        )
        .count()
    )

    return _serialize_campaign(
        campaign,
        customer_count=customer_count,
    )


@router.post(
    "/{campaign_id}/target"
)
def target_campaign_customers(
    campaign_id: UUID,
    data: CampaignTargetRequest,
    db: Session = Depends(get_db),
):
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

    if campaign.status not in {
        "draft",
        "scheduled",
    }:
        raise HTTPException(
            status_code=400,
            detail=(
                "Customers can only be targeted "
                "while a campaign is draft "
                "or scheduled."
            ),
        )

    segment = data.segment

    if segment not in ALLOWED_SEGMENTS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid target segment."
            ),
        )

    latest_predictions = (
        _get_latest_predictions(
            db,
            data.organization_id,
        )
    )

    customers = (
        db.query(Customer)
        .filter(
            Customer.organization_id
            == data.organization_id,
        )
        .all()
    )

    added = 0
    skipped = 0

    for customer in customers:
        existing = (
            db.query(CampaignCustomer)
            .filter(
                CampaignCustomer.organization_id
                == data.organization_id,
                CampaignCustomer.campaign_id
                == campaign_id,
                CampaignCustomer.customer_id
                == customer.id,
            )
            .first()
        )

        if existing:
            skipped += 1
            continue

        should_target = False

        if segment == "all_customers":
            should_target = True
        else:
            prediction = latest_predictions.get(
                str(customer.id)
            )

            if prediction:
                risk_level = (
                    prediction.risk_level
                    or ""
                ).lower()

                should_target = (
                    risk_level == segment
                )

        if not should_target:
            continue

        campaign_customer = CampaignCustomer(
            organization_id=data.organization_id,
            campaign_id=campaign_id,
            customer_id=customer.id,
            retention_action_id=None,
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
            f"{added} customer(s) added "
            "to the campaign."
        ),
    }


@router.get(
    "/{campaign_id}/customers"
)
def get_campaign_customers(
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

    rows = (
        db.query(
            CampaignCustomer,
            Customer,
        )
        .join(
            Customer,
            Customer.id
            == CampaignCustomer.customer_id,
        )
        .filter(
            CampaignCustomer.campaign_id
            == campaign_id,
            CampaignCustomer.organization_id
            == organization_id,
            Customer.organization_id
            == organization_id,
        )
        .order_by(
            CampaignCustomer.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": str(row.id),
            "campaign_id": str(
                row.campaign_id
            ),
            "customer_id": str(
                row.customer_id
            ),
            "retention_action_id": (
                str(row.retention_action_id)
                if row.retention_action_id
                else None
            ),
            "customer_name": customer.name,
            "customer_email": customer.email,
            "status": row.status,
            "outcome": row.outcome,
            "created_at": (
                row.created_at.isoformat()
                if row.created_at
                else None
            ),
        }
        for row, customer in rows
    ]


@router.post(
    "/{campaign_id}/execute"
)
def execute_campaign(
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

    if campaign.status != "active":
        raise HTTPException(
            status_code=400,
            detail=(
                "Only active campaigns "
                "can be executed."
            ),
        )

    campaign_customers = (
        db.query(CampaignCustomer)
        .filter(
            CampaignCustomer.campaign_id
            == campaign_id,
            CampaignCustomer.organization_id
            == organization_id,
            CampaignCustomer.status
            == "pending",
        )
        .all()
    )

    created_actions = 0
    skipped_actions = 0

    for campaign_customer in campaign_customers:
        existing_action = (
            db.query(RetentionAction)
            .filter(
                RetentionAction.organization_id
                == organization_id,
                RetentionAction.customer_id
                == campaign_customer.customer_id,
                RetentionAction.action_type
                == campaign.action_type,
                RetentionAction.status
                == "pending",
            )
            .order_by(
                RetentionAction.created_at.desc()
            )
            .first()
        )

        if existing_action:
            campaign_customer.retention_action_id = (
                existing_action.id
            )
            campaign_customer.status = (
                "action_created"
            )

            skipped_actions += 1
            continue

        action = RetentionAction(
            organization_id=organization_id,
            customer_id=campaign_customer.customer_id,
            action_type=campaign.action_type,
            status="pending",
            recommendation=campaign.description,
        )

        db.add(action)
        db.flush()

        campaign_customer.retention_action_id = (
            action.id
        )
        campaign_customer.status = (
            "action_created"
        )

        created_actions += 1

    db.commit()

    return {
        "campaign_id": str(
            campaign_id
        ),
        "created_actions": created_actions,
        "skipped_actions": skipped_actions,
        "message": (
            f"{created_actions} retention "
            "action(s) created."
        ),
    }
