from pathlib import Path

import joblib
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


MODEL_PATH = Path(
    "ml/models/churn_model.joblib"
)


def train_churn_model(
    df: pd.DataFrame,
    target_column: str = "churn",
):
    if target_column not in df.columns:
        raise ValueError(
            f"Target column '{target_column}' "
            "not found."
        )

    X = df.drop(
        columns=[target_column]
    )

    y = df[target_column]

    X = pd.get_dummies(
        X,
        drop_first=True,
    )

    X = X.fillna(0)

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=y,
        )
    )

    model = Pipeline(
        steps=[
            (
                "scaler",
                StandardScaler(),
            ),
            (
                "classifier",
                LogisticRegression(
                    max_iter=1000
                ),
            ),
        ]
    )

    model.fit(
        X_train,
        y_train,
    )

    return (
        model,
        X_test,
        y_test,
    )


def train_and_save_model(
    df: pd.DataFrame,
    target_column: str = "churn",
):
    model, X_test, y_test = (
        train_churn_model(
            df,
            target_column,
        )
    )

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        model,
        MODEL_PATH,
    )

    return {
        "model_path": str(
            MODEL_PATH
        ),
        "test_rows": len(X_test),
        "trained": True,
    }
