from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.prediction import Prediction


router = APIRouter(
    prefix="/risk-summary",
    tags=["Risk Summary"],
)


@router.get("/")
def get_risk_summary(
    organization_id: UUID,
    db: Session = Depends(get_db),
):
    predictions = (
        db.query(Prediction)
        .filter(Prediction.organization_id == organization_id)
        .all()
    )

    critical = sum(
        1 for prediction in predictions
        if prediction.risk_level == "critical"
    )

    high = sum(
        1 for prediction in predictions
        if prediction.risk_level == "high"
    )

    medium = sum(
        1 for prediction in predictions
        if prediction.risk_level == "medium"
    )

    low = sum(
        1 for prediction in predictions
        if prediction.risk_level == "low"
    )

    return {
        "total_customers_with_predictions": len(predictions),
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
    }
