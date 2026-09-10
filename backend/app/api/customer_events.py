from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.customer_event import CustomerEvent


router = APIRouter(
    prefix="/customer-events",
    tags=["Customer Events"],
)


class CustomerEventCreate(BaseModel):
    organization_id: UUID
    customer_id: UUID
    event_type: str
    description: str | None = None


@router.post("/")
def create_customer_event(
    data: CustomerEventCreate,
    db: Session = Depends(get_db),
):
    event = CustomerEvent(
        organization_id=data.organization_id,
        customer_id=data.customer_id,
        event_type=data.event_type,
        description=data.description,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "id": str(event.id),
        "customer_id": str(event.customer_id),
        "event_type": event.event_type,
        "description": event.description,
        "created_at": event.created_at,
    }
