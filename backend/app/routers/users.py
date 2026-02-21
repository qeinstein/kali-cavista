"""User router — profile, device token, location."""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile")
async def get_profile(user: User = Depends(get_current_user)):
    """Fetch user profile & baseline."""
    pass


@router.put("/profile")
async def update_profile(user: User = Depends(get_current_user)):
    """Update profile & preferences."""
    pass


@router.post("/device-token")
async def register_device_token(user: User = Depends(get_current_user)):
    """Register FCM push token."""
    pass


@router.put("/location")
async def update_location(user: User = Depends(get_current_user)):
    """Update location for weather."""
    pass
