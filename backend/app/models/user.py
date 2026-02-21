import uuid
from datetime import datetime, timezone as tz
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    timezone = Column(String, default="UTC")
    created_at = Column(DateTime, default=lambda: datetime.now(tz.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(tz.utc),
        onupdate=lambda: datetime.now(tz.utc),
        nullable=False,
    )


class BlacklistedToken(Base):
    """Tokens that have been invalidated via logout."""
    __tablename__ = "blacklisted_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jti = Column(String, unique=True, index=True, nullable=False)  # JWT ID
    blacklisted_at = Column(DateTime, default=lambda: datetime.now(tz.utc), nullable=False)
