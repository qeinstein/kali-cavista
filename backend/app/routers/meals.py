"""Meals router — log, history, today, delete."""

from datetime import datetime, time, timezone as tz

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.tracking import MealLog
from app.schemas.meals import (
    MealLogCreate, MealLogResponse, HungerPrediction,
    MealItem, MealHistoryResponse, MealTodayResponse,
)
from app.schemas.user import SuccessResponse
from app.services.prediction import generate_prediction

router = APIRouter(prefix="/meals", tags=["Meals"])


def _meal_to_item(meal: MealLog) -> MealItem:
    return MealItem(
        id=str(meal.id),
        mealSize=meal.meal_size.value,
        loggedAt=meal.logged_at,
        hungerLevelBefore=meal.hunger_level_before,
    )


@router.post("/log", response_model=MealLogResponse, status_code=201)
async def log_meal(
    payload: MealLogCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Records a new meal. Returns an inline hunger prediction."""
    meal = MealLog(
        user_id=user.id,
        meal_size=payload.mealSize,
        hunger_level_before=payload.hungerLevelBefore,
        notes=payload.notes,
    )
    db.add(meal)
    await db.flush()
    await db.refresh(meal)

    # Generate a fresh hunger prediction after logging
    pred = await generate_prediction(user, db)
    prediction = HungerPrediction(
        nextHungerAt=pred.next_hunger_at,
        confidence=pred.confidence,
    )

    return MealLogResponse(
        success=True,
        mealId=str(meal.id),
        prediction=prediction,
    )


@router.get("/history", response_model=MealHistoryResponse)
async def get_meal_history(
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    date: str = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Paginated meal history. Optionally filter by date (YYYY-MM-DD)."""
    base_q = select(MealLog).where(MealLog.user_id == user.id)
    count_q = select(func.count(MealLog.id)).where(MealLog.user_id == user.id)

    if date:
        day = datetime.strptime(date, "%Y-%m-%d").date()
        day_start = datetime.combine(day, time.min, tzinfo=tz.utc)
        day_end = datetime.combine(day, time.max, tzinfo=tz.utc)
        base_q = base_q.where(MealLog.logged_at.between(day_start, day_end))
        count_q = count_q.where(MealLog.logged_at.between(day_start, day_end))

    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    result = await db.execute(
        base_q.order_by(desc(MealLog.logged_at)).limit(limit).offset(offset)
    )
    meals = result.scalars().all()

    return MealHistoryResponse(
        meals=[_meal_to_item(m) for m in meals],
        total=total,
    )


@router.get("/today", response_model=MealTodayResponse)
async def get_todays_meals(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Today's meals only."""
    now = datetime.now(tz.utc)
    day_start = datetime.combine(now.date(), time.min, tzinfo=tz.utc)
    day_end = datetime.combine(now.date(), time.max, tzinfo=tz.utc)

    result = await db.execute(
        select(MealLog)
        .where(
            MealLog.user_id == user.id,
            MealLog.logged_at.between(day_start, day_end),
        )
        .order_by(desc(MealLog.logged_at))
    )
    meals = result.scalars().all()

    return MealTodayResponse(
        meals=[_meal_to_item(m) for m in meals],
        count=len(meals),
    )


@router.delete("/{meal_id}", response_model=SuccessResponse)
async def delete_meal(
    meal_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a meal log."""
    result = await db.execute(
        select(MealLog).where(MealLog.id == meal_id, MealLog.user_id == user.id)
    )
    meal = result.scalar_one_or_none()

    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")

    await db.delete(meal)
    await db.flush()

    # Recalculate prediction after deletion
    await generate_prediction(user, db)

    return SuccessResponse()
