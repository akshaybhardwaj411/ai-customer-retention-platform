import uuid

from sqlalchemy import Column, DateTime, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.session import Base


class ActionOutcome(Base):
    __tablename__ = "action_outcomes"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    organization_id = Column(
        UUID(as_uuid=True),
        nullable=False,
    )

    action_id = Column(
        UUID(as_uuid=True),
        nullable=False,
    )

    customer_id = Column(
        UUID(as_uuid=True),
        nullable=False,
    )

    outcome = Column(
        String(100),
        nullable=False,
    )

    revenue_saved = Column(
        Numeric(12, 2),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
