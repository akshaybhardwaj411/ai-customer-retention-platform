from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.organization_service import (
    create_organization,
)


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


class OrganizationCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=255,
    )


@router.post("/")
def create_organization_endpoint(
    data: OrganizationCreate,
    db: Session = Depends(get_db),
):
    organization_name = data.name.strip()

    if not organization_name:
        raise HTTPException(
            status_code=400,
            detail="Organization name is required.",
        )

    organization = create_organization(
        db=db,
        name=organization_name,
    )

    return {
        "id": str(organization.id),
        "name": organization.name,
        "message": (
            "Organization created successfully"
        ),
    }
