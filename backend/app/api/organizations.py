from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.organization_service import create_organization


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


class OrganizationCreate(BaseModel):
    name: str


@router.post("/")
def create_organization_endpoint(
    data: OrganizationCreate,
    db: Session = Depends(get_db),
):
    organization = create_organization(
        db=db,
        name=data.name,
    )

    return {
        "id": str(organization.id),
        "name": organization.name,
        "message": "Organization created successfully",
    }
