import pandas as pd


def explain_prediction(
    model,
    customer_data: pd.DataFrame,
) -> list[dict]:
    """
    Return feature importance information for a prediction.
    """

    classifier = model.named_steps.get("classifier")

    if classifier is None:
        return []

    if not hasattr(classifier, "coef_"):
        return []

    features = pd.get_dummies(
        customer_data,
        drop_first=True,
    )

    features = features.fillna(0)

    coefficients = classifier.coef_[0]

    explanations = []

    for feature, coefficient in zip(
        features.columns,
        coefficients,
    ):
        explanations.append(
            {
                "feature": feature,
                "impact": float(coefficient),
                "direction": (
                    "increases_risk"
                    if coefficient > 0
                    else "decreases_risk"
                ),
            }
        )

    explanations.sort(
        key=lambda item: abs(item["impact"]),
        reverse=True,
    )

    return explanations
