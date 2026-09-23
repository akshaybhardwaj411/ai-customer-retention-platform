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
    base_query = (
        db.query(ActionOutcome)
        .filter(
            ActionOutcome.organization_id
            == organization_id
        )
    )

    total_outcomes = (
        base_query.count()
    )

    saved = (
        db.query(ActionOutcome)
        .filter(
            ActionOutcome.organization_id
            == organization_id,
            ActionOutcome.outcome
            == "saved",
        )
        .count()
    )

    not_saved = (
        db.query(ActionOutcome)
        .filter(
            ActionOutcome.organization_id
            == organization_id,
            ActionOutcome.outcome
            == "not_saved",
        )
        .count()
    )

    no_response = (
        db.query(ActionOutcome)
        .filter(
            ActionOutcome.organization_id
            == organization_id,
            ActionOutcome.outcome
            == "no_response",
        )
        .count()
    )

    unknown = (
        db.query(ActionOutcome)
        .filter(
            ActionOutcome.organization_id
            == organization_id,
            ActionOutcome.outcome
            == "unknown",
        )
        .count()
    )

    revenue_saved = (
        db.query(
            func.coalesce(
                func.sum(
                    ActionOutcome.revenue_saved
                ),
                0,
            )
        )
        .filter(
            ActionOutcome.organization_id
            == organization_id,
            ActionOutcome.outcome
            == "saved",
        )
        .scalar()
    )

    resolved_outcomes = (
        saved + not_saved
    )

    save_rate = (
        saved / resolved_outcomes
        if resolved_outcomes > 0
        else 0
    )

    return {
        "total_actions": total_outcomes,
        "customers_saved": saved,
        "customers_not_saved": not_saved,
        "no_response": no_response,
        "unknown": unknown,
        "resolved_outcomes":
            resolved_outcomes,
        "revenue_saved": float(
            revenue_saved or 0
        ),
        "save_rate": round(
            save_rate,
            4,
        ),
    }
