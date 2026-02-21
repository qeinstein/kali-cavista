"""Health data models — snapshots from HealthKit/Google Health Connect."""

import uuid
from datetime import datetime, timezone as tz
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class HealthSnapshot(Base):
    __tablename__ = "health_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    snapshot_at = Column(DateTime(timezone=True), nullable=False)
    steps_count = Column(Integer, nullable=True)
    active_calories = Column(Integer, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)


class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    sleep_start = Column(DateTime(timezone=True), nullable=False)
    sleep_end = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    quality = Column(String, nullable=True)  # poor | fair | good | excellent
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)
