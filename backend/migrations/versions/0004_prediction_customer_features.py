"""Add customer features to predictions.

Revision ID: 0004_prediction_customer_features
Revises: 0003_recommendations_and_customer_events
Create Date: 2026-09-23
"""

from alembic import op
import sqlalchemy as sa


revision = "0004_prediction_customer_features"
down_revision = "0003_recommendations_and_customer_events"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "predictions",
        sa.Column(
            "customer_features",
            sa.JSON(),
            nullable=True,
        ),
    )


def downgrade():
    op.drop_column(
        "predictions",
        "customer_features",
    )
