"""
Prediction service — generates hunger predictions.

Currently uses a simple heuristic based on meal history.
This will be replaced with an ML model as more data is collected.
"""

from datetime import datetime, timedelta, timezone as tz

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.models.user import User
from app.models.tracking import MealLog
from app.models.prediction import Prediction


async def generate_prediction(user: User, db: AsyncSession) -> Prediction:
    """
    Generate a hunger prediction based on the user's meal history.

    Strategy:
    1. Calculate the average gap between meals from history
    2. Use the last meal time + average gap to predict next hunger
    3. Confidence increases with more data points
    """
    # Count total meals for trust indicator
    count_result = await db.execute(
        select(func.count(MealLog.id)).where(MealLog.user_id == user.id)
    )
    total_meals = int(count_result.scalar() or 0)

    # Get recent meals (last 14 days) ordered by time
    recent_meals_result = await db.execute(
        select(MealLog)
        .where(MealLog.user_id == user.id)
        .order_by(desc(MealLog.logged_at))
        .limit(50)
    )
    recent_meals = recent_meals_result.scalars().all()

    now = datetime.now(tz.utc)
    next_hunger_at = None
    confidence = None

    if len(recent_meals) >= 2:
        # Calculate average gap between consecutive meals
        gaps = []
        sorted_meals = sorted(recent_meals, key=lambda m: m.logged_at)
        for i in range(1, len(sorted_meals)):
            gap = (sorted_meals[i].logged_at - sorted_meals[i - 1].logged_at).total_seconds() / 3600
            if 1.0 <= gap <= 12.0:  # ignore overnight gaps and <1hr gaps
                gaps.append(gap)

        if gaps:
            avg_gap_hours = sum(gaps) / len(gaps)
            last_meal_time = recent_meals[0].logged_at  # most recent
            next_hunger_at = last_meal_time + timedelta(hours=avg_gap_hours)

            # Confidence: scales with data points, caps at 0.95
            data_confidence = min(len(gaps) / 30, 1.0)  # more gaps = more confidence
            confidence = round(0.4 + (0.55 * data_confidence), 2)

    elif len(recent_meals) == 1:
        # Only one meal: use baseline meals_per_day to estimate
        meals_per_day = user.meals_per_day or 3
        avg_gap_hours = 14.0 / meals_per_day  # ~14 waking hours / meals
        next_hunger_at = recent_meals[0].logged_at + timedelta(hours=avg_gap_hours)
        confidence = 0.3  # low confidence with minimal data

    # Save prediction
    prediction = Prediction(
        user_id=user.id,
        next_hunger_at=next_hunger_at,
        confidence=confidence,
        based_on_meals=total_meals,
    )
    db.add(prediction)
    await db.flush()
    await db.refresh(prediction)

    return prediction
