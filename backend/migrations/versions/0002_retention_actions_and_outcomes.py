from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0002_retention_actions_and_outcomes"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "retention_actions",
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
            "status",
            sa.String(50),
            nullable=False,
        ),
        sa.Column(
            "recommendation",
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

    op.create_table(
        "action_outcomes",
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
            "action_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "customer_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "outcome",
            sa.String(100),
            nullable=False,
        ),
        sa.Column(
            "revenue_saved",
            sa.Numeric(12, 2),
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
        "ix_retention_actions_organization_id",
        "retention_actions",
        ["organization_id"],
    )

    op.create_index(
        "ix_retention_actions_customer_id",
        "retention_actions",
        ["customer_id"],
    )

    op.create_index(
        "ix_action_outcomes_organization_id",
        "action_outcomes",
        ["organization_id"],
    )

    op.create_index(
        "ix_action_outcomes_action_id",
        "action_outcomes",
        ["action_id"],
    )

    op.create_index(
        "ix_action_outcomes_customer_id",
        "action_outcomes",
        ["customer_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_action_outcomes_customer_id",
        table_name="action_outcomes",
    )

    op.drop_index(
        "ix_action_outcomes_action_id",
        table_name="action_outcomes",
    )

    op.drop_index(
        "ix_action_outcomes_organization_id",
        table_name="action_outcomes",
    )

    op.drop_index(
        "ix_retention_actions_customer_id",
        table_name="retention_actions",
    )

    op.drop_index(
        "ix_retention_actions_organization_id",
        table_name="retention_actions",
    )

    op.drop_table("action_outcomes")
    op.drop_table("retention_actions")
