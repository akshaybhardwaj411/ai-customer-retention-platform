from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.recommendation import Recommendation


router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendations"],
)


class RecommendationCreate(BaseModel):
    organization_id: UUID
    customer_id: UUID
    action_type: str
    reason: str | None = None


@router.post("/")
def create_recommendation(
    data: RecommendationCreate,
    db: Session = Depends(get_db),
):
    recommendation = Recommendation(
        organization_id=data.organization_id,
        customer_id=data.customer_id,
        action_type=data.action_type,
        reason=data.reason,
        status="pending",
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return {
        "id": str(recommendation.id),
        "customer_id": str(recommendation.customer_id),
        "action_type": recommendation.action_type,
        "reason": recommendation.reason,
        "status": recommendation.status,
    }
