from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.customer import Customer


router = APIRouter(
    prefix="/customer-360",
    tags=["Customer 360"],
)


@router.get("/{customer_id}")
def get_customer_360(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return {
        "customer": {
            "id": str(customer.id),
            "organization_id": str(customer.organization_id),
            "name": customer.name,
            "email": customer.email,
        },
        "risk": {
            "risk_level": "unknown",
            "churn_probability": None,
        },
        "health": {
            "status": "unknown",
        },
        "insights": [],
        "recommended_actions": [],
    }
