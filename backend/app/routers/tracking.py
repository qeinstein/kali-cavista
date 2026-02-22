"""Tracking router — Mood and Activity logs."""

from datetime import datetime, timezone as tz
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.tracking import MoodLog, ActivityLog
from app.schemas.tracking import (
    MoodLogCreate, MoodLogResponse,
    ActivityLogCreate, ActivityLogResponse
)
from app.services.prediction import train_energy_mood

router = APIRouter(prefix="/tracking", tags=["Tracking"])

@router.post("/mood", response_model=MoodLogResponse, status_code=status.HTTP_201_CREATED)
async def log_mood(
    payload: MoodLogCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Logs current mood and energy level (Ground truth for Harmony models)."""
    entry = MoodLog(
        user_id=user.id,
        mood=payload.mood,
        energy_level=payload.energyLevel,
        notes=payload.notes,
        logged_at=payload.loggedAt or datetime.now(tz.utc)
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)

    # Trigger training for Energy and Mood facets
    await train_energy_mood(user.id, entry, db)

    return MoodLogResponse(
        id=str(entry.id),
        mood=entry.mood.value,
        energyLevel=entry.energy_level,
        loggedAt=entry.logged_at,
        success=True
    )

@router.post("/activity", response_model=ActivityLogResponse, status_code=status.HTTP_201_CREATED)
async def log_activity(
    payload: ActivityLogCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Logs a specific activity/workout."""
    entry = ActivityLog(
        user_id=user.id,
        activity_type=payload.activityType,
        duration_minutes=payload.durationMinutes,
        calories_burned=payload.caloriesBurned,
        intensity=payload.intensity,
        logged_at=payload.loggedAt or datetime.now(tz.utc)
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)

    return ActivityLogResponse(
        id=str(entry.id),
        activityType=entry.activity_type,
        success=True
    )
