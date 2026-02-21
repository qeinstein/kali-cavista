"""Notifications router — settings and interaction logging."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.notification import NotificationSettings, NotificationInteraction
from app.schemas.notifications import (
    NotificationSettingsResponse, NotificationSettingsUpdate,
    NotificationSettingsUpdateResponse, NotificationInteractionCreate,
)
from app.schemas.user import SuccessResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _settings_to_response(s: NotificationSettings) -> NotificationSettingsResponse:
    return NotificationSettingsResponse(
        hungerAlerts=s.hunger_alerts,
        hungerAlertMinutesBefore=s.hunger_alert_minutes_before,
        hydrationAlerts=s.hydration_alerts,
        hydrationThreshold=s.hydration_threshold,
        patternNudges=s.pattern_nudges,
        quietHoursStart=s.quiet_hours_start,
        quietHoursEnd=s.quiet_hours_end,
    )


async def _get_or_create_settings(user: User, db: AsyncSession) -> NotificationSettings:
    """Fetch existing settings or create with defaults."""
    result = await db.execute(
        select(NotificationSettings).where(NotificationSettings.user_id == user.id)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        settings = NotificationSettings(user_id=user.id)
        db.add(settings)
        await db.flush()
        await db.refresh(settings)
    return settings


@router.get("/settings", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current notification preferences."""
    settings = await _get_or_create_settings(user, db)
    return _settings_to_response(settings)


@router.put("/settings", response_model=NotificationSettingsUpdateResponse)
async def update_notification_settings(
    payload: NotificationSettingsUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update notification preferences. Send only changed fields."""
    settings = await _get_or_create_settings(user, db)

    if payload.hungerAlerts is not None:
        settings.hunger_alerts = payload.hungerAlerts
    if payload.hungerAlertMinutesBefore is not None:
        settings.hunger_alert_minutes_before = payload.hungerAlertMinutesBefore
    if payload.hydrationAlerts is not None:
        settings.hydration_alerts = payload.hydrationAlerts
    if payload.hydrationThreshold is not None:
        settings.hydration_threshold = payload.hydrationThreshold
    if payload.patternNudges is not None:
        settings.pattern_nudges = payload.patternNudges
    if payload.quietHoursStart is not None:
        settings.quiet_hours_start = payload.quietHoursStart
    if payload.quietHoursEnd is not None:
        settings.quiet_hours_end = payload.quietHoursEnd

    db.add(settings)
    await db.flush()
    await db.refresh(settings)

    return NotificationSettingsUpdateResponse(
        success=True,
        settings=_settings_to_response(settings),
    )


@router.post("/interaction", response_model=SuccessResponse)
async def log_interaction(
    payload: NotificationInteractionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log how the user responded to a push notification."""
    entry = NotificationInteraction(
        user_id=user.id,
        notification_id=payload.notificationId,
        action=payload.action,
        received_at=payload.receivedAt,
        acted_at=payload.actedAt,
    )
    db.add(entry)
    await db.flush()
    return SuccessResponse()
