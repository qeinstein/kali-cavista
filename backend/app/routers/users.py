"""User router — profile, device token, location."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import (
    ProfileResponse, ProfileUpdateRequest, ProfileUpdateResponse,
    BaselineResponse, DeviceTokenRequest, LocationUpdate, SuccessResponse,
)

router = APIRouter(prefix="/user", tags=["User"])


def _build_profile(user: User) -> ProfileResponse:
    """Build a ProfileResponse from a User model instance."""
    return ProfileResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        baseline=BaselineResponse(
            mealsPerDay=user.meals_per_day,
            activityLevel=user.activity_level,
            waterTargetMl=user.water_target_ml,
            timezone=user.timezone,
        ),
    )


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user: User = Depends(get_current_user)):
    """Fetch user profile & baseline."""
    return _build_profile(user)


@router.put("/profile", response_model=ProfileUpdateResponse)
async def update_profile(
    payload: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update profile & preferences. Send only the fields being changed."""
    if payload.name is not None:
        user.name = payload.name

    if payload.baseline:
        b = payload.baseline
        if b.mealsPerDay is not None:
            user.meals_per_day = b.mealsPerDay
        if b.activityLevel is not None:
            user.activity_level = b.activityLevel
        if b.waterTargetMl is not None:
            user.water_target_ml = b.waterTargetMl

    db.add(user)
    await db.flush()
    await db.refresh(user)

    return ProfileUpdateResponse(success=True, user=_build_profile(user))


@router.post("/device-token", response_model=SuccessResponse)
async def register_device_token(
    payload: DeviceTokenRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register FCM push token."""
    user.fcm_token = payload.fcmToken
    user.device_platform = payload.platform
    db.add(user)
    await db.flush()
    return SuccessResponse()


@router.put("/location", response_model=SuccessResponse)
async def update_location(
    payload: LocationUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update location for weather-based hydration scoring."""
    user.lat = payload.lat
    user.lon = payload.lon
    db.add(user)
    await db.flush()
    return SuccessResponse()
