from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.action_outcome import ActionOutcome


router = APIRouter(
    prefix="/impact",
    tags=["Impact"],
)


@router.get("/")
def get_impact(
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    total_actions = (
        db.query(ActionOutcome)
        .filter(
            ActionOutcome.organization_id == organization_id
        )
        .count()
    )

    customers_saved = (
        db.query(ActionOutcome)
        .filter(
            ActionOutcome.organization_id == organization_id,
            ActionOutcome.outcome == "saved",
        )
        .count()
    )

    revenue_saved = (
        db.query(
            func.coalesce(
                func.sum(ActionOutcome.revenue_saved),
                0,
            )
        )
        .filter(
            ActionOutcome.organization_id == organization_id
        )
        .scalar()
    )

    return {
        "total_actions": total_actions,
        "customers_saved": customers_saved,
        "revenue_saved": float(revenue_saved),
    }
