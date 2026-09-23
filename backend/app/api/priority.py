from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.customer import Customer
from app.models.prediction import Prediction
from app.services.priority_service import (
    calculate_priority,
)


router = APIRouter(
    prefix="/priority",
    tags=["Priority"],
)


class PriorityRequest(BaseModel):
    customer_value: float | None = None
    intervention_opportunity: float | None = None


@router.post("/customers/{customer_id}")
def calculate_customer_priority(
    customer_id: UUID,
    organization_id: UUID,
    data: PriorityRequest,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.organization_id
            == organization_id,
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found.",
        )

    prediction = (
        db.query(Prediction)
        .filter(
            Prediction.customer_id
            == customer_id,
            Prediction.organization_id
            == organization_id,
        )
        .order_by(
            Prediction.created_at.desc()
        )
        .first()
    )

    churn_probability = (
        float(prediction.churn_probability)
        if prediction
        and prediction.churn_probability
        is not None
        else None
    )

    customer_value = (
        data.customer_value
        if data.customer_value is not None
        else 0.5
    )

    intervention_opportunity = (
        data.intervention_opportunity
        if data.intervention_opportunity
        is not None
        else 0.5
    )

    result = calculate_priority(
        churn_probability=churn_probability,
        customer_value=customer_value,
        intervention_opportunity=(
            intervention_opportunity
        ),
    )

    return {
        "customer_id": str(
            customer_id
        ),
        "churn_probability": (
            churn_probability
        ),
        "customer_value": (
            customer_value
        ),
        "intervention_opportunity": (
            intervention_opportunity
        ),
        "priority_score": (
            result.priority_score
        ),
        "priority_level": (
            result.priority_level
        ),
    }
