import pandas as pd


def predict_churn(
    model,
    customer_data: pd.DataFrame,
) -> pd.DataFrame:
    """
    Generate churn probabilities and risk levels.
    """

    features = pd.get_dummies(
        customer_data,
        drop_first=True,
    )

    features = features.fillna(0)

    probabilities = model.predict_proba(features)[:, 1]

    results = customer_data.copy()

    results["churn_probability"] = probabilities

    results["risk_level"] = results[
        "churn_probability"
    ].apply(_risk_level)

    return results


def _risk_level(probability: float) -> str:
    if probability >= 0.80:
        return "critical"

    if probability >= 0.60:
        return "high"

    if probability >= 0.30:
        return "medium"

    return "low"
