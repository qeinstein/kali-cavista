"""Hydration router — log, score, today, history."""

from datetime import datetime, time, timedelta, timezone as tz

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, cast, Date

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.tracking import HydrationLog
from app.schemas.hydration import (
    HydrationLogCreate, HydrationLogResponse,
    HydrationScoreResponse, HydrationScoreSignals,
    HydrationLogItem, HydrationTodayResponse,
    HydrationDaySummary, HydrationHistoryResponse,
)
from app.services.hydration import compute_hydration_score, _score_label

router = APIRouter(prefix="/hydration", tags=["Hydration"])


@router.post("/log", response_model=HydrationLogResponse, status_code=201)
async def log_hydration(
    payload: HydrationLogCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log water intake. Returns updated hydration score."""
    entry = HydrationLog(
        user_id=user.id,
        amount_ml=payload.amountMl,
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)

    score_data = await compute_hydration_score(user, db)

    return HydrationLogResponse(
        logId=str(entry.id),
        hydrationScore=score_data["score"],
        scoreLabel=score_data["label"],
    )


@router.get("/score", response_model=HydrationScoreResponse)
async def get_hydration_score(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current computed hydration score with signals breakdown."""
    score_data = await compute_hydration_score(user, db)

    return HydrationScoreResponse(
        score=score_data["score"],
        label=score_data["label"],
        color=score_data["color"],
        signals=HydrationScoreSignals(**score_data["signals"]),
    )


@router.get("/today", response_model=HydrationTodayResponse)
async def get_todays_hydration(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Today's water logs and running total."""
    now = datetime.now(tz.utc)
    day_start = datetime.combine(now.date(), time.min, tzinfo=tz.utc)
    day_end = datetime.combine(now.date(), time.max, tzinfo=tz.utc)

    result = await db.execute(
        select(HydrationLog)
        .where(
            HydrationLog.user_id == user.id,
            HydrationLog.logged_at.between(day_start, day_end),
        )
        .order_by(desc(HydrationLog.logged_at))
    )
    logs = result.scalars().all()

    total_ml = sum(log.amount_ml for log in logs)
    target_ml = user.water_target_ml or 2000
    percent = int((total_ml / target_ml) * 100) if target_ml > 0 else 0

    return HydrationTodayResponse(
        logs=[
            HydrationLogItem(
                id=str(log.id),
                amountMl=log.amount_ml,
                loggedAt=log.logged_at,
            )
            for log in logs
        ],
        totalMl=total_ml,
        targetMl=target_ml,
        percentOfTarget=min(percent, 100),
    )


@router.get("/history", response_model=HydrationHistoryResponse)
async def get_hydration_history(
    days: int = Query(7, ge=1, le=30),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Daily hydration totals for the past N days."""
    now = datetime.now(tz.utc)
    start_date = now - timedelta(days=days)
    target_ml = user.water_target_ml or 2000

    result = await db.execute(
        select(
            cast(HydrationLog.logged_at, Date).label("day"),
            func.sum(HydrationLog.amount_ml).label("total_ml"),
        )
        .where(
            HydrationLog.user_id == user.id,
            HydrationLog.logged_at >= start_date,
        )
        .group_by(cast(HydrationLog.logged_at, Date))
        .order_by(cast(HydrationLog.logged_at, Date).desc())
    )
    rows = result.all()

    history = []
    for row in rows:
        total = float(row.total_ml)
        ratio = min(total / target_ml, 1.0) if target_ml > 0 else 0
        avg_score = int(ratio * 100)
        label, _ = _score_label(avg_score)
        history.append(
            HydrationDaySummary(
                date=str(row.day),
                totalMl=total,
                targetMl=target_ml,
                avgScore=avg_score,
            )
        )

    return HydrationHistoryResponse(history=history)
