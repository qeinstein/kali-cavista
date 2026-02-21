from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.tracking import MealLog, HydrationLog, MoodLog, ActivityLog
from app.schemas.tracking import (
    MealLogCreate, MealLogResponse,
    HydrationLogCreate, HydrationLogResponse,
    MoodLogCreate, MoodLogResponse,
    ActivityLogCreate, ActivityLogResponse,
)

router = APIRouter(prefix="/tracking", tags=["Tracking"])


# ── Meals ────────────────────────────────────────────────────────
@router.post("/meals", response_model=MealLogResponse, status_code=201)
async def log_meal(
    payload: MealLogCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log a meal."""
    entry = MealLog(user_id=user.id, **payload.model_dump())
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.get("/meals", response_model=List[MealLogResponse])
async def get_meals(
    days: int = Query(7, ge=1, le=90),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get meal logs for the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(MealLog)
        .where(MealLog.user_id == user.id, MealLog.logged_at >= since)
        .order_by(desc(MealLog.logged_at))
    )
    return result.scalars().all()


# ── Hydration ────────────────────────────────────────────────────
@router.post("/hydration", response_model=HydrationLogResponse, status_code=201)
async def log_hydration(
    payload: HydrationLogCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log water intake."""
    entry = HydrationLog(user_id=user.id, **payload.model_dump())
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.get("/hydration", response_model=List[HydrationLogResponse])
async def get_hydration(
    days: int = Query(7, ge=1, le=90),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get hydration logs for the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(HydrationLog)
        .where(HydrationLog.user_id == user.id, HydrationLog.logged_at >= since)
        .order_by(desc(HydrationLog.logged_at))
    )
    return result.scalars().all()


# ── Mood / Energy ───────────────────────────────────────────────
@router.post("/mood", response_model=MoodLogResponse, status_code=201)
async def log_mood(
    payload: MoodLogCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log mood and energy level."""
    entry = MoodLog(user_id=user.id, **payload.model_dump())
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.get("/mood", response_model=List[MoodLogResponse])
async def get_mood(
    days: int = Query(7, ge=1, le=90),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get mood logs for the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(MoodLog)
        .where(MoodLog.user_id == user.id, MoodLog.logged_at >= since)
        .order_by(desc(MoodLog.logged_at))
    )
    return result.scalars().all()


# ── Activity ────────────────────────────────────────────────────
@router.post("/activity", response_model=ActivityLogResponse, status_code=201)
async def log_activity(
    payload: ActivityLogCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log activity snapshot (steps, active minutes, sleep)."""
    entry = ActivityLog(user_id=user.id, **payload.model_dump())
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.get("/activity", response_model=List[ActivityLogResponse])
async def get_activity(
    days: int = Query(7, ge=1, le=90),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get activity logs for the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.user_id == user.id, ActivityLog.logged_at >= since)
        .order_by(desc(ActivityLog.logged_at))
    )
    return result.scalars().all()
