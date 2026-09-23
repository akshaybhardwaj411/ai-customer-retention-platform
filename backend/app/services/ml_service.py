from pathlib import Path

import joblib
import pandas as pd

from app.services.explainability_service import (
    explain_customer_prediction,
)


MODEL_PATH = Path(
    "ml/models/churn_model.joblib"
)

FEATURES_PATH = Path(
    "ml/models/churn_features.joblib"
)

METADATA_PATH = Path(
    "ml/models/churn_metadata.joblib"
)


def load_model():
    if not MODEL_PATH.exists():
        return None

    return joblib.load(
        MODEL_PATH
    )


def load_feature_columns():
    if not FEATURES_PATH.exists():
        return None

    return joblib.load(
        FEATURES_PATH
    )


def load_model_metadata():
    if not METADATA_PATH.exists():
        return None

    return joblib.load(
        METADATA_PATH
    )


def is_model_ready() -> bool:
    return (
        MODEL_PATH.exists()
        and FEATURES_PATH.exists()
        and METADATA_PATH.exists()
    )


def prepare_prediction_features(
    customer_data: dict,
    feature_columns: list[str],
) -> pd.DataFrame:
    dataframe = pd.DataFrame(
        [customer_data]
    )

    dataframe = pd.get_dummies(
        dataframe,
        drop_first=True,
    )

    dataframe = dataframe.reindex(
        columns=feature_columns,
        fill_value=0,
    )

    return dataframe


def predict_customer_churn(
    model,
    customer_data: dict,
) -> tuple[float, str]:
    if not is_model_ready():
        raise FileNotFoundError(
            "ML model is not fully ready. "
            "Model, feature columns, and "
            "metadata are required."
        )

    feature_columns = (
        load_feature_columns()
    )

    if feature_columns is None:
        raise FileNotFoundError(
            "Trained feature columns were not found."
        )

    features = (
        prepare_prediction_features(
            customer_data=customer_data,
            feature_columns=feature_columns,
        )
    )

    probability = float(
        model.predict_proba(
            features
        )[0][1]
    )

    risk_level = _risk_level(
        probability
    )

    return (
        probability,
        risk_level,
    )


def explain_customer_churn(
    model,
    customer_data: dict,
) -> list[dict]:
    if not is_model_ready():
        raise FileNotFoundError(
            "ML model is not fully ready."
        )

    feature_columns = (
        load_feature_columns()
    )

    if feature_columns is None:
        raise FileNotFoundError(
            "Trained feature columns were not found."
        )

    return explain_customer_prediction(
        model=model,
        customer_data=customer_data,
        feature_columns=feature_columns,
    )


def _risk_level(
    probability: float,
) -> str:
    if probability >= 0.80:
        return "critical"

    if probability >= 0.60:
        return "high"

    if probability >= 0.30:
        return "medium"

    return "low"
