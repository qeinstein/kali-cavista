"""Notifications router — settings, interaction logging."""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/settings")
async def get_notification_settings(user: User = Depends(get_current_user)):
    """Get notification preferences."""
    pass


@router.put("/settings")
async def update_notification_settings(user: User = Depends(get_current_user)):
    """Update notification preferences."""
    pass


@router.post("/interaction")
async def log_notification_interaction(user: User = Depends(get_current_user)):
    """Log notification interaction."""
    pass
