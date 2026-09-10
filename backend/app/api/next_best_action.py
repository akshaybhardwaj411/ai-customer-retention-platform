from uuid import UUID

from fastapi import APIRouter


router = APIRouter(
    prefix="/next-best-action",
    tags=["Next Best Action"],
)


@router.get("/{customer_id}")
def get_next_best_action(customer_id: UUID):
    return {
        "customer_id": str(customer_id),
        "action": None,
        "reason": None,
        "expected_value": None,
        "status": "not_available",
    }
