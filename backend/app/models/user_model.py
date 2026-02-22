"""Per-user model storage for online learning predictions."""

import uuid
from datetime import datetime, timezone as tz
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class UserModel(Base):
    __tablename__ = "user_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    model_weights = Column(Text, nullable=True)      # JSON: coef_, intercept_
    feature_scaler = Column(Text, nullable=True)      # JSON: running mean/var
    training_samples = Column(Integer, default=0)
    last_trained_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)
