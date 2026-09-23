"""Link campaign customers to retention actions.

Revision ID: 0006_campaign_customer_action
Revises: 0005_campaigns
Create Date: 2026-09-24
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0006_campaign_customer_action"
down_revision = "0005_campaigns"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "campaign_customers",
        sa.Column(
            "retention_action_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_campaign_customers_retention_action_id",
        "campaign_customers",
        ["retention_action_id"],
    )


def downgrade():
    op.drop_index(
        "ix_campaign_customers_retention_action_id",
        table_name="campaign_customers",
    )

    op.drop_column(
        "campaign_customers",
        "retention_action_id",
    )
