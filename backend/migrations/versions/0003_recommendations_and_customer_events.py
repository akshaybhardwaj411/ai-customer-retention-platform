from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0003_recommendations_and_customer_events"
down_revision = "0002_retention_actions_and_outcomes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "recommendations",
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
            "customer_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "action_type",
            sa.String(100),
            nullable=False,
        ),
        sa.Column(
            "reason",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.String(50),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_table(
        "customer_events",
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
            "customer_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "event_type",
            sa.String(100),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
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
        "ix_recommendations_organization_id",
        "recommendations",
        ["organization_id"],
    )

    op.create_index(
        "ix_recommendations_customer_id",
        "recommendations",
        ["customer_id"],
    )

    op.create_index(
        "ix_customer_events_organization_id",
        "customer_events",
        ["organization_id"],
    )

    op.create_index(
        "ix_customer_events_customer_id",
        "customer_events",
        ["customer_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_customer_events_customer_id",
        table_name="customer_events",
    )

    op.drop_index(
        "ix_customer_events_organization_id",
        table_name="customer_events",
    )

    op.drop_index(
        "ix_recommendations_customer_id",
        table_name="recommendations",
    )

    op.drop_index(
        "ix_recommendations_organization_id",
        table_name="recommendations",
    )

    op.drop_table("customer_events")
    op.drop_table("recommendations")
