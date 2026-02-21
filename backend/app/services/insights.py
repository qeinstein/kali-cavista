"""
Insights service — computes weekly summary metrics from user data.
"""

from datetime import datetime, time, timedelta, timezone as tz

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date

from app.models.user import User
from app.models.tracking import MealLog, HydrationLog


async def compute_weekly_metrics(user: User, db: AsyncSession) -> dict:
    """
    Compute metrics for the past 7 days:
    - mealsLogged
    - waterTargetDaysHit
    - avgMealGapHours
    """
    now = datetime.now(tz.utc)
    week_ago = now - timedelta(days=7)
    week_start = (now - timedelta(days=7)).date()

    # Meals logged in the past 7 days
    meals_result = await db.execute(
        select(func.count(MealLog.id))
        .where(MealLog.user_id == user.id, MealLog.logged_at >= week_ago)
    )
    meals_logged = int(meals_result.scalar() or 0)

    # Average meal gap
    avg_gap_hours = None
    if meals_logged >= 2:
        meals_result = await db.execute(
            select(MealLog.logged_at)
            .where(MealLog.user_id == user.id, MealLog.logged_at >= week_ago)
            .order_by(MealLog.logged_at)
        )
        times = [r[0] for r in meals_result.all()]
        gaps = []
        for i in range(1, len(times)):
            gap = (times[i] - times[i - 1]).total_seconds() / 3600
            if 1.0 <= gap <= 12.0:
                gaps.append(gap)
        if gaps:
            avg_gap_hours = round(sum(gaps) / len(gaps), 1)

    # Days where water target was hit
    target_ml = user.water_target_ml or 2000
    daily_water_result = await db.execute(
        select(
            cast(HydrationLog.logged_at, Date).label("day"),
            func.sum(HydrationLog.amount_ml).label("total"),
        )
        .where(HydrationLog.user_id == user.id, HydrationLog.logged_at >= week_ago)
        .group_by(cast(HydrationLog.logged_at, Date))
    )
    water_days = daily_water_result.all()
    water_target_days_hit = sum(1 for row in water_days if float(row.total) >= target_ml)

    return {
        "week_starting": str(week_start),
        "meals_logged": meals_logged,
        "water_target_days_hit": water_target_days_hit,
        "avg_meal_gap_hours": avg_gap_hours,
    }


def generate_summary_text(metrics: dict) -> str:
    """Generate a narrative summary from the weekly metrics."""
    m = metrics
    parts = [f"This week you logged {m['meals_logged']} meals"]

    parts.append(
        f"hit your water target on {m['water_target_days_hit']} out of 7 days"
    )

    if m["avg_meal_gap_hours"]:
        parts.append(
            f"and your average time between meals was {m['avg_meal_gap_hours']} hours"
        )

    return ", ".join(parts) + "."
