from pathlib import Path

import joblib
import pandas as pd


MODEL_PATH = Path(
    "ml/models/churn_model.joblib"
)


def load_model():
    if not MODEL_PATH.exists():
        return None

    return joblib.load(
        MODEL_PATH
    )


def predict_customer_churn(
    model,
    customer_data: dict,
) -> tuple[float, str]:
    dataframe = pd.DataFrame(
        [customer_data]
    )

    probability = float(
        model.predict_proba(
            dataframe
        )[0][1]
    )

    risk_level = _risk_level(
        probability
    )

    return (
        probability,
        risk_level,
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
