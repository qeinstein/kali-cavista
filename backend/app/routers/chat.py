"""Chat router — AI assistant messaging."""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/message")
async def send_message(user: User = Depends(get_current_user)):
    """Send message to AI assistant."""
    pass


@router.get("/history")
async def get_chat_history(user: User = Depends(get_current_user)):
    """Get chat history."""
    pass


@router.delete("/history")
async def clear_chat_history(user: User = Depends(get_current_user)):
    """Clear chat conversation."""
    pass
