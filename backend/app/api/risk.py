from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.prediction import Prediction


router = APIRouter(
    prefix="/risk",
    tags=["Risk"],
)


@router.get("/customers/{customer_id}")
def get_customer_risk(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.customer_id == customer_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )

    if not prediction:
        return {
            "customer_id": str(customer_id),
            "churn_probability": None,
            "risk_level": "unknown",
        }

    return {
        "customer_id": str(prediction.customer_id),
        "churn_probability": float(prediction.churn_probability)
        if prediction.churn_probability is not None
        else None,
        "risk_level": prediction.risk_level,
    }
