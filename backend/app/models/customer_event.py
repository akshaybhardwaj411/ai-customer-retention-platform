import uuid

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.session import Base


class CustomerEvent(Base):
    __tablename__ = "customer_events"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    organization_id = Column(
        UUID(as_uuid=True),
        nullable=False,
    )

    customer_id = Column(
        UUID(as_uuid=True),
        nullable=False,
    )

    event_type = Column(
        String(100),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
