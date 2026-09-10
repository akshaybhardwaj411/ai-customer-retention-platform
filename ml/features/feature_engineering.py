import pandas as pd


def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create customer-level features for churn prediction.
    """

    features = df.copy()

    if "tenure" in features.columns:
        features["tenure"] = pd.to_numeric(
            features["tenure"],
            errors="coerce",
        )

    if "monthly_charges" in features.columns:
        features["monthly_charges"] = pd.to_numeric(
            features["monthly_charges"],
            errors="coerce",
        )

    if "total_charges" in features.columns:
        features["total_charges"] = pd.to_numeric(
            features["total_charges"],
            errors="coerce",
        )

    features = features.fillna(0)

    return features
