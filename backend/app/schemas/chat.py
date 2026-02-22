from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ChatAction(BaseModel):
    type: str          # LOG_MEAL | LOG_WATER | etc.
    payload: dict = {}


class ChatMessageRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None


class ChatMessageResponse(BaseModel):
    reply: str
    conversationId: str
    actions: List[ChatAction] = []


class ChatHistoryItem(BaseModel):
    role: str          # user | assistant
    content: str
    timestamp: datetime


class ChatHistoryResponse(BaseModel):
    messages: List[ChatHistoryItem]
