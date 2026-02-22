"""
Hydration score computation service.

Computes a 0-100 score based on:
- Water logged today vs. user's target
- Time since last water intake
- Current temperature (from weather service)
- Activity level (steps today)
"""

from datetime import datetime, time, timezone as tz, timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.user import User
from app.models.tracking import HydrationLog, ActivityLog
from app.services.weather import get_current_weather


def _score_label(score: int) -> tuple[str, str]:
    """Returns (label, color) for a given hydration score."""
    if score >= 80:
        return "Well Hydrated", "green"
    elif score >= 60:
        return "On Track", "blue"
    elif score >= 40:
        return "Drink Soon", "orange"
    else:
        return "Dehydrated", "red"


async def compute_hydration_score(
    user: User,
    db: AsyncSession,
) -> dict:
    """
    Compute the live hydration score and return all signals.

    Returns dict with: score, label, color, signals
    """
    now = datetime.now(tz.utc)
    day_start = datetime.combine(now.date(), time.min, tzinfo=tz.utc)
    day_end = datetime.combine(now.date(), time.max, tzinfo=tz.utc)

    # Total water logged today
    total_result = await db.execute(
        select(func.coalesce(func.sum(HydrationLog.amount_ml), 0.0))
        .where(
            HydrationLog.user_id == user.id,
            HydrationLog.logged_at.between(day_start, day_end),
        )
    )
    water_logged_ml = float(total_result.scalar())

    # Last water intake time
    last_log_result = await db.execute(
        select(HydrationLog.logged_at)
        .where(HydrationLog.user_id == user.id)
        .order_by(HydrationLog.logged_at.desc())
        .limit(1)
    )
    last_log_time = last_log_result.scalar_one_or_none()
    last_water_mins_ago = (
        int((now - last_log_time).total_seconds() / 60)
        if last_log_time else None
    )

    # Steps today (from activity logs)
    steps_result = await db.execute(
        select(func.coalesce(func.sum(ActivityLog.steps), 0))
        .where(
            ActivityLog.user_id == user.id,
            ActivityLog.logged_at.between(day_start, day_end),
        )
    )
    steps_today = int(steps_result.scalar())

    # Weather (if user has location set)
    temperature_c: Optional[float] = None
    if user.lat and user.lon:
        weather = await get_current_weather(user.lat, user.lon)
        if weather:
            temperature_c = weather["temperature_c"]

    # ── Score calculation ────────────────────────────────────────
    target_ml = user.water_target_ml or 2000
    score = 50  # base

    # Factor 1: progress toward target (0-40 points)
    progress_ratio = min(water_logged_ml / target_ml, 1.0)
    score = int(progress_ratio * 40)

    # Factor 2: recency of last intake (0-30 points)
    if last_water_mins_ago is not None:
        if last_water_mins_ago <= 30:
            score += 30
        elif last_water_mins_ago <= 60:
            score += 25
        elif last_water_mins_ago <= 120:
            score += 15
        elif last_water_mins_ago <= 180:
            score += 5
        # >180 mins = 0 bonus

    # Factor 3: time of day expectation (0-20 points)
    hour = now.hour
    expected_progress = min(max((hour - 6) / 14, 0), 1.0)  # 6 AM to 8 PM
    if expected_progress > 0 and progress_ratio >= expected_progress * 0.8:
        score += 20
    elif expected_progress > 0 and progress_ratio >= expected_progress * 0.5:
        score += 10

    # Factor 4: heat penalty (-10 points if hot and behind)
    if temperature_c and temperature_c > 30 and progress_ratio < 0.6:
        score -= 10

    # Factor 5: activity bonus requirement (-5 if active but low intake)
    if steps_today > 5000 and progress_ratio < 0.4:
        score -= 5

    score = max(0, min(100, score))

    label, color = _score_label(score)

    return {
        "score": score,
        "label": label,
        "color": color,
        "signals": {
            "lastWaterMinsAgo": last_water_mins_ago,
            "temperatureCelsius": temperature_c,
            "stepsToday": steps_today,
            "waterLoggedMl": water_logged_ml,
            "targetMl": target_ml,
        },
    }
