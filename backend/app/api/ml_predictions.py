from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.customer import Customer
from app.models.prediction import Prediction
from app.services.ml_service import (
    load_model,
    predict_customer_churn,
)


router = APIRouter(
    prefix="/ml",
    tags=["ML Predictions"],
)


class ChurnPredictionRequest(BaseModel):
    customer_data: dict


@router.post("/customers/{customer_id}/predict")
def predict_customer(
    customer_id: UUID,
    organization_id: UUID,
    data: ChurnPredictionRequest,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.organization_id == organization_id,
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found.",
        )

    model = load_model()

    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Churn model is not available. "
                "Train the model first."
            ),
        )

    try:
        probability, risk_level = (
            predict_customer_churn(
                model=model,
                customer_data=data.customer_data,
            )
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unable to generate prediction: {error}"
            ),
        ) from error

    prediction = Prediction(
        organization_id=organization_id,
        customer_id=customer_id,
        churn_probability=probability,
        risk_level=risk_level,
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return {
        "id": str(prediction.id),
        "customer_id": str(customer_id),
        "organization_id": str(
            organization_id
        ),
        "churn_probability": probability,
        "risk_level": risk_level,
        "source": "ml_model",
        "created_at": prediction.created_at,
    }
