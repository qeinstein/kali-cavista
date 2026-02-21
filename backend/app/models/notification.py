"""Notification models — settings and interaction tracking."""

import uuid
from datetime import datetime, timezone as tz
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    hunger_alerts = Column(Boolean, default=True)
    hunger_alert_minutes_before = Column(Integer, default=20)
    hydration_alerts = Column(Boolean, default=True)
    hydration_threshold = Column(Integer, default=50)
    pattern_nudges = Column(Boolean, default=True)
    quiet_hours_start = Column(String, default="22:00")
    quiet_hours_end = Column(String, default="07:00")


class NotificationInteraction(Base):
    __tablename__ = "notification_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    notification_id = Column(String, nullable=False)
    action = Column(String, nullable=False)  # opened | dismissed | ignored
    received_at = Column(DateTime(timezone=True), nullable=False)
    acted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)
