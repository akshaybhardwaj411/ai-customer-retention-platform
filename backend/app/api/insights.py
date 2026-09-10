from uuid import UUID

from fastapi import APIRouter


router = APIRouter(
    prefix="/insights",
    tags=["AI Insights"],
)


@router.get("/{customer_id}")
def get_customer_insight(customer_id: UUID):
    return {
        "customer_id": str(customer_id),
        "summary": "AI insight is not available yet.",
        "risk_factors": [],
        "confidence": None,
    }
