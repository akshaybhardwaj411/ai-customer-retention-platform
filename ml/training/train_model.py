from pathlib import Path

import joblib
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


MODEL_PATH = Path(
    "ml/models/churn_model.joblib"
)

FEATURES_PATH = Path(
    "ml/models/churn_features.joblib"
)


def prepare_features(
    df: pd.DataFrame,
    target_column: str,
):
    X = df.drop(
        columns=[target_column]
    )

    X = pd.get_dummies(
        X,
        drop_first=True,
    )

    X = X.fillna(0)

    return X


def train_churn_model(
    df: pd.DataFrame,
    target_column: str = "churn",
):
    if target_column not in df.columns:
        raise ValueError(
            f"Target column '{target_column}' "
            "not found."
        )

    X = prepare_features(
        df,
        target_column,
    )

    y = df[target_column]

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

    predictions = model.predict(
        X_test
    )

    probabilities = model.predict_proba(
        X_test
    )[:, 1]

    metrics = {
        "accuracy": round(
            accuracy_score(
                y_test,
                predictions,
            ),
            4,
        ),
        "precision": round(
            precision_score(
                y_test,
                predictions,
                zero_division=0,
            ),
            4,
        ),
        "recall": round(
            recall_score(
                y_test,
                predictions,
                zero_division=0,
            ),
            4,
        ),
        "roc_auc": round(
            roc_auc_score(
                y_test,
                probabilities,
            ),
            4,
        ),
    }

    return (
        model,
        X_test,
        y_test,
        list(X.columns),
        metrics,
    )


def train_and_save_model(
    df: pd.DataFrame,
    target_column: str = "churn",
):
    (
        model,
        X_test,
        y_test,
        feature_columns,
        metrics,
    ) = train_churn_model(
        df,
        target_column,
    )

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        model,
        MODEL_PATH,
    )

    joblib.dump(
        feature_columns,
        FEATURES_PATH,
    )

    return {
        "model_path": str(
            MODEL_PATH
        ),
        "features_path": str(
            FEATURES_PATH
        ),
        "feature_count": len(
            feature_columns
        ),
        "test_rows": len(X_test),
        "metrics": metrics,
        "trained": True,
    }
