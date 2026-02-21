"""Insight model — stores pre-computed behavioural observations."""

import uuid
from datetime import datetime, timezone as tz
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Insight(Base):
    __tablename__ = "insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)       # meal_skip_pattern | hydration_trend | hunger_cycle | sleep_correlation | weekend_shift
    title = Column(String, nullable=False)
    body = Column(String, nullable=False)
    severity = Column(String, default="info")   # info | warning | alert
    dismissed = Column(Boolean, default=False)
    generated_at = Column(DateTime, default=lambda: datetime.now(tz.utc), nullable=False)
