from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "organizations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(255),
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
        "customers",
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
            sa.String(255),
            nullable=False,
        ),
        sa.Column(
            "email",
            sa.String(255),
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
        "predictions",
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
            "churn_probability",
            sa.Numeric(5, 4),
            nullable=True,
        ),
        sa.Column(
            "risk_level",
            sa.String(50),
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
        "ix_customers_organization_id",
        "customers",
        ["organization_id"],
    )

    op.create_index(
        "ix_predictions_organization_id",
        "predictions",
        ["organization_id"],
    )

    op.create_index(
        "ix_predictions_customer_id",
        "predictions",
        ["customer_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_predictions_customer_id",
        table_name="predictions",
    )

    op.drop_index(
        "ix_predictions_organization_id",
        table_name="predictions",
    )

    op.drop_index(
        "ix_customers_organization_id",
        table_name="customers",
    )

    op.drop_table("predictions")
    op.drop_table("customers")
    op.drop_table("organizations")
