"""Add retention campaigns.

Revision ID: 0005_campaigns
Revises: 0004_prediction_customer_features
Create Date: 2026-09-24
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0005_campaigns"
down_revision = "0004_prediction_customer_features"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "campaigns",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "organization_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "action_type",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "target_segment",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="draft",
        ),
        sa.Column(
            "start_date",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "end_date",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_campaigns_organization_id",
        "campaigns",
        ["organization_id"],
    )

    op.create_table(
        "campaign_customers",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "organization_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "campaign_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "customer_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "outcome",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_campaign_customers_organization_id",
        "campaign_customers",
        ["organization_id"],
    )

    op.create_index(
        "ix_campaign_customers_campaign_id",
        "campaign_customers",
        ["campaign_id"],
    )

    op.create_index(
        "ix_campaign_customers_customer_id",
        "campaign_customers",
        ["customer_id"],
    )


def downgrade():
    op.drop_index(
        "ix_campaign_customers_customer_id",
        table_name="campaign_customers",
    )

    op.drop_index(
        "ix_campaign_customers_campaign_id",
        table_name="campaign_customers",
    )

    op.drop_index(
        "ix_campaign_customers_organization_id",
        table_name="campaign_customers",
    )

    op.drop_table(
        "campaign_customers",
    )

    op.drop_index(
        "ix_campaigns_organization_id",
        table_name="campaigns",
    )

    op.drop_table(
        "campaigns",
    )
