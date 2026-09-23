from fastapi import APIRouter

from app.services.ml_service import (
    load_feature_columns,
    load_model,
)


router = APIRouter(
    prefix="/ml",
    tags=["ML Status"],
)


@router.get("/status")
def get_ml_status():
    model = load_model()
    feature_columns = (
        load_feature_columns()
    )

    if model is None:
        return {
            "status": "not_ready",
            "model_available": False,
            "features_available": (
                feature_columns is not None
            ),
            "message": (
                "Churn model has not been trained yet."
            ),
        }

    return {
        "status": "ready",
        "model_available": True,
        "features_available": (
            feature_columns is not None
        ),
        "feature_count": (
            len(feature_columns)
            if feature_columns
            else 0
        ),
        "message": (
            "Churn model is ready for predictions."
        ),
    }
