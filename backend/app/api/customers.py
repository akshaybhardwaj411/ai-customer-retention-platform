from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.customer import Customer
from app.services.customer_service import create_customer


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


class CustomerCreate(BaseModel):
    organization_id: UUID
    name: str
    email: str | None = None


@router.post("/")
def create_customer_endpoint(
    data: CustomerCreate,
    db: Session = Depends(get_db),
):
    customer = create_customer(
        db=db,
        organization_id=data.organization_id,
        name=data.name,
        email=data.email,
    )

    return {
        "id": str(customer.id),
        "organization_id": str(customer.organization_id),
        "name": customer.name,
        "email": customer.email,
    }


@router.get("/")
def list_customers(
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    customers = (
        db.query(Customer)
        .filter(Customer.organization_id == organization_id)
        .all()
    )

    return [
        {
            "id": str(customer.id),
            "name": customer.name,
            "email": customer.email,
        }
        for customer in customers
    ]
