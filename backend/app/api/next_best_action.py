from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.recommendation import Recommendation


router = APIRouter(
    prefix="/next-best-action",
    tags=["Next Best Action"],
)


@router.get("/{customer_id}")
def get_next_best_action(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    recommendation = (
        db.query(Recommendation)
        .filter(
            Recommendation.customer_id
            == customer_id,
            Recommendation.status
            == "pending",
        )
        .order_by(
            Recommendation.created_at.desc()
        )
        .first()
    )

    if not recommendation:
        return {
            "customer_id": str(customer_id),
            "action": None,
            "reason": None,
            "expected_value": None,
            "status": "not_available",
        }

    return {
        "customer_id": str(customer_id),
        "action": recommendation.action_type,
        "reason": recommendation.reason,
        "expected_value": None,
        "status": recommendation.status,
    }
