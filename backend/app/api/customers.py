from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.customer import Customer


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


class CustomerCreate(BaseModel):
    organization_id: UUID
    name: str
    email: str | None = None


@router.post("/")
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
):
    customer = Customer(
        organization_id=data.organization_id,
        name=data.name,
        email=data.email,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return {
        "id": str(customer.id),
        "organization_id": str(customer.organization_id),
        "name": customer.name,
        "email": customer.email,
    }
