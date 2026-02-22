import uuid
from datetime import datetime, timezone as tz
from sqlalchemy import (
    Column, Integer, Float, String, DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.core.database import Base


class MealSize(str, enum.Enum):
    LIGHT = "light"
    MEDIUM = "medium"
    HEAVY = "heavy"


class MoodLevel(str, enum.Enum):
    GREAT = "great"
    GOOD = "good"
    OKAY = "okay"
    LOW = "low"
    BAD = "bad"


class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    meal_size = Column(SAEnum(MealSize), nullable=False)
    hunger_level_before = Column(Integer, nullable=True)  # 1-10
    notes = Column(String, nullable=True)
    logged_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)


class HydrationLog(Base):
    __tablename__ = "hydration_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    amount_ml = Column(Float, nullable=False)
    logged_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    mood = Column(SAEnum(MoodLevel), nullable=False)
    energy_level = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    logged_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    activity_type = Column(String, nullable=False) # e.g., 'walking', 'running', 'gym'
    duration_minutes = Column(Integer, nullable=False)
    calories_burned = Column(Integer, nullable=True)
    intensity = Column(String, nullable=True) # e.g., 'low', 'moderate', 'high'
    logged_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)

