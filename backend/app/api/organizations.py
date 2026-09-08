from uuid import uuid4

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


class OrganizationCreate(BaseModel):
    name: str


@router.post("/")
def create_organization(data: OrganizationCreate):
    organization = {
        "id": str(uuid4()),
        "name": data.name,
        "message": "Organization created successfully",
    }

    return organization
