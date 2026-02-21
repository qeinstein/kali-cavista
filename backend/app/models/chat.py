"""Chat models — conversation messages."""

import uuid
from datetime import datetime, timezone as tz
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    conversation_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    role = Column(String, nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz.utc), nullable=False)
