from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.prediction import Prediction


router = APIRouter(
    prefix="/insights",
    tags=["AI Insights"],
)


@router.get("/{customer_id}")
def get_customer_insight(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    prediction = (
        db.query(Prediction)
        .filter(
            Prediction.customer_id
            == customer_id,
        )
        .order_by(
            Prediction.created_at.desc()
        )
        .first()
    )

    if not prediction:
        return {
            "customer_id": str(customer_id),
            "summary": (
                "There is not enough prediction "
                "data to generate an AI insight yet."
            ),
            "risk_factors": [],
            "confidence": None,
        }

    probability = (
        float(prediction.churn_probability)
        if prediction.churn_probability
        is not None
        else None
    )

    risk_level = (
        prediction.risk_level
        or "unknown"
    )

    if probability is not None:
        summary = (
            f"The customer is currently "
            f"classified as {risk_level} risk "
            f"with an estimated churn probability "
            f"of {probability:.0%}."
        )
    else:
        summary = (
            f"The customer is currently "
            f"classified as {risk_level} risk."
        )

    return {
        "customer_id": str(customer_id),
        "summary": summary,
        "risk_factors": [],
        "confidence": None,
    }
