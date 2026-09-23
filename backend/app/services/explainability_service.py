from typing import Any

import pandas as pd
import shap


def prepare_explanation_features(
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


def explain_customer_prediction(
    model: Any,
    customer_data: dict,
    feature_columns: list[str],
) -> list[dict]:
    features = prepare_explanation_features(
        customer_data=customer_data,
        feature_columns=feature_columns,
    )

    classifier = model.named_steps.get(
        "classifier"
    )

    if classifier is None:
        return []

    if not hasattr(
        classifier,
        "coef_",
    ):
        return []

    scaler = model.named_steps.get(
        "scaler"
    )

    transformed_features = features

    if scaler is not None:
        transformed_features = pd.DataFrame(
            scaler.transform(features),
            columns=features.columns,
            index=features.index,
        )

    explainer = shap.LinearExplainer(
        classifier,
        transformed_features,
    )

    shap_values = explainer(
        transformed_features
    )

    values = shap_values.values[0]

    explanations = []

    for feature, value in zip(
        features.columns,
        values,
    ):
        explanations.append(
            {
                "feature": feature,
                "impact": round(
                    float(value),
                    6,
                ),
                "direction": (
                    "increases_risk"
                    if value > 0
                    else "decreases_risk"
                ),
            }
        )

    explanations.sort(
        key=lambda item: abs(
            item["impact"]
        ),
        reverse=True,
    )

    return explanations
