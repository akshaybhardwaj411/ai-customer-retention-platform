from sqlalchemy.orm import Session

from app.models.organization import Organization


def create_organization(
    db: Session,
    name: str,
) -> Organization:
    organization = Organization(name=name)

    db.add(organization)
    db.commit()
    db.refresh(organization)

    return organization
