from fastapi import APIRouter

from app.services.ml_service import (
    load_feature_columns,
    load_model,
    load_model_metadata,
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

    metadata = (
        load_model_metadata()
    )

    model_available = (
        model is not None
    )

    features_available = (
        feature_columns is not None
    )

    metadata_available = (
        metadata is not None
    )

    ready = (
        model_available
        and features_available
        and metadata_available
    )

    if not ready:
        return {
            "status": "not_ready",
            "model_available": model_available,
            "features_available": features_available,
            "metadata_available": metadata_available,
            "feature_count": (
                len(feature_columns)
                if feature_columns
                else 0
            ),
            "training": metadata,
            "message": (
                "ML system is not fully ready. "
                "Model, feature columns, and "
                "training metadata are required."
            ),
        }

    return {
        "status": "ready",
        "model_available": True,
        "features_available": True,
        "metadata_available": True,
        "feature_count": len(
            feature_columns
        ),
        "training": metadata,
        "message": (
            "Churn model is ready "
            "for predictions."
        ),
    }
