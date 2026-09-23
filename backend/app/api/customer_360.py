from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.action_outcome import ActionOutcome
from app.models.customer import Customer
from app.models.customer_event import CustomerEvent
from app.models.prediction import Prediction
from app.models.retention_action import RetentionAction


router = APIRouter(
    prefix="/customer-360",
    tags=["Customer 360"],
)


@router.get("/{customer_id}")
def get_customer_360(
    customer_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.organization_id
            == organization_id,
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found.",
        )

    prediction = (
        db.query(Prediction)
        .filter(
            Prediction.customer_id
            == customer_id,
            Prediction.organization_id
            == organization_id,
        )
        .order_by(
            Prediction.created_at.desc()
        )
        .first()
    )

    events = (
        db.query(CustomerEvent)
        .filter(
            CustomerEvent.customer_id
            == customer_id,
            CustomerEvent.organization_id
            == organization_id,
        )
        .order_by(
            CustomerEvent.created_at.desc()
        )
        .all()
    )

    actions = (
        db.query(RetentionAction)
        .filter(
            RetentionAction.customer_id
            == customer_id,
            RetentionAction.organization_id
            == organization_id,
        )
        .order_by(
            RetentionAction.created_at.desc()
        )
        .all()
    )

    outcomes = (
        db.query(ActionOutcome)
        .filter(
            ActionOutcome.customer_id
            == customer_id,
            ActionOutcome.organization_id
            == organization_id,
        )
        .order_by(
            ActionOutcome.created_at.desc()
        )
        .all()
    )

    timeline = []

    for event in events:
        timeline.append(
            {
                "id": str(event.id),
                "type": "customer_event",
                "event_type": event.event_type,
                "description":
                    event.description,
                "status": None,
                "created_at":
                    event.created_at,
            }
        )

    for action in actions:
        timeline.append(
            {
                "id": str(action.id),
                "type": "retention_action",
                "event_type":
                    "retention_action",
                "description":
                    action.recommendation,
                "status":
                    action.status,
                "created_at":
                    action.created_at,
            }
        )

    for outcome in outcomes:
        timeline.append(
            {
                "id": str(outcome.id),
                "type": "action_outcome",
                "event_type":
                    "retention_outcome",
                "description":
                    f"Retention outcome: "
                    f"{outcome.outcome}",
                "status":
                    outcome.outcome,
                "revenue_saved":
                    (
                        float(
                            outcome.revenue_saved
                        )
                        if outcome.revenue_saved
                        is not None
                        else None
                    ),
                "created_at":
                    outcome.created_at,
            }
        )

    timeline.sort(
        key=lambda item: item[
            "created_at"
        ],
        reverse=True,
    )

    return {
        "customer": {
            "id": str(customer.id),
            "organization_id":
                str(customer.organization_id),
            "name": customer.name,
            "email": customer.email,
        },
        "risk": {
            "risk_level":
                prediction.risk_level
                if prediction
                else "unknown",
            "churn_probability": (
                float(
                    prediction.churn_probability
                )
                if (
                    prediction
                    and prediction.churn_probability
                    is not None
                )
                else None
            ),
        },
        "health": {
            "status": "unknown",
        },
        "insights": [],
        "recommended_actions": [],
        "timeline": timeline,
    }
