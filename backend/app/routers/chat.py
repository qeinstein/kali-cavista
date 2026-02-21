"""Chat router — message, history, clear."""

import uuid as uuid_mod

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat import ChatMessage
from app.schemas.chat import (
    ChatMessageRequest, ChatMessageResponse, ChatAction,
    ChatHistoryItem, ChatHistoryResponse,
)
from app.schemas.user import SuccessResponse
from app.services.chat import get_llm_response

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    payload: ChatMessageRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message to the AI assistant (powered by OpenRouter LLM)."""
    # Resolve or create conversation
    conversation_id = (
        payload.conversationId
        if payload.conversationId
        else str(uuid_mod.uuid4())
    )

    # Load conversation history for context
    history_result = await db.execute(
        select(ChatMessage)
        .where(
            ChatMessage.user_id == user.id,
            ChatMessage.conversation_id == conversation_id,
        )
        .order_by(ChatMessage.created_at)
    )
    past_messages = history_result.scalars().all()
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in past_messages
    ]

    # Save user message
    user_msg = ChatMessage(
        user_id=user.id,
        conversation_id=conversation_id,
        role="user",
        content=payload.message,
    )
    db.add(user_msg)

    # Get LLM response with full user context
    reply_text, raw_actions = await get_llm_response(
        user=user,
        message=payload.message,
        conversation_history=conversation_history,
        db=db,
    )

    # Save assistant message
    assistant_msg = ChatMessage(
        user_id=user.id,
        conversation_id=conversation_id,
        role="assistant",
        content=reply_text,
    )
    db.add(assistant_msg)
    await db.flush()

    # Convert raw action dicts to ChatAction models
    actions = [
        ChatAction(type=a.get("type", ""), payload=a.get("payload", {}))
        for a in raw_actions
        if isinstance(a, dict) and "type" in a
    ]

    return ChatMessageResponse(
        reply=reply_text,
        conversationId=conversation_id,
        actions=actions,
    )


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get recent chat messages."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id)
        .order_by(desc(ChatMessage.created_at))
        .limit(limit)
    )
    messages = list(reversed(result.scalars().all()))

    return ChatHistoryResponse(
        messages=[
            ChatHistoryItem(
                role=msg.role,
                content=msg.content,
                timestamp=msg.created_at,
            )
            for msg in messages
        ]
    )


@router.delete("/history", response_model=SuccessResponse)
async def clear_chat_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Clear all chat history for the user."""
    await db.execute(
        delete(ChatMessage).where(ChatMessage.user_id == user.id)
    )
    await db.flush()
    return SuccessResponse()
