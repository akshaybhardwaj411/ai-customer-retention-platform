import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.session import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name = Column(
        String(255),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
