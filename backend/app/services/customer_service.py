from uuid import UUID

from sqlalchemy.orm import Session

from app.models.customer import Customer


def create_customer(
    db: Session,
    organization_id: UUID,
    name: str,
    email: str | None = None,
) -> Customer:
    customer = Customer(
        organization_id=organization_id,
        name=name,
        email=email,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer
