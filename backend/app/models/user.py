import uuid
from datetime import datetime, timezone as tz
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    # Baseline / onboarding
    meals_per_day = Column(Integer, default=3)
    activity_level = Column(String, default="moderate")  # sedentary | light | moderate | active | very_active
    water_target_ml = Column(Integer, default=2000)
    timezone = Column(String, default="UTC")

    # Location (for weather-based hydration scoring)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)

    # Push notifications
    fcm_token = Column(String, nullable=True)
    device_platform = Column(String, nullable=True)  # android | ios

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
    jti = Column(String, unique=True, index=True, nullable=False)
    blacklisted_at = Column(DateTime, default=lambda: datetime.now(tz.utc), nullable=False)
