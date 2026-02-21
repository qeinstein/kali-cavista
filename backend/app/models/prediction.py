"""Prediction and feedback models."""

import uuid
from datetime import datetime, timezone as tz
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    next_hunger_at = Column(DateTime, nullable=True)
    confidence = Column(Float, nullable=True)
    based_on_meals = Column(Integer, default=0)
    generated_at = Column(DateTime, default=lambda: datetime.now(tz.utc), nullable=False)


class HungerFeedback(Base):
    __tablename__ = "hunger_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    hunger_level = Column(Integer, nullable=False)  # 1-10
    rated_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(tz.utc), nullable=False)
