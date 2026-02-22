"""
Insights service — computes weekly summary metrics and LLM-generated narrative.
"""

import json
import logging
from datetime import datetime, time, timedelta, timezone as tz

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date

from app.core.config import settings
from app.models.user import User
from app.models.tracking import MealLog, HydrationLog

logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SUMMARY_SYSTEM_PROMPT = """You are a health analytics assistant for a meal and hydration tracking app.
Given a user's weekly health metrics, write a concise, friendly, personalised weekly summary in 2-3 sentences.
Be specific with the numbers provided. Mention highlights and areas for improvement.
Do NOT use bullet points or headers — write flowing prose.
Address the user directly using "you"."""


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

    # Find best hydration day
    best_day = None
    best_total = 0
    for row in water_days:
        if float(row.total) > best_total:
            best_total = float(row.total)
            best_day = str(row.day)

    return {
        "week_starting": str(week_start),
        "meals_logged": meals_logged,
        "water_target_days_hit": water_target_days_hit,
        "avg_meal_gap_hours": avg_gap_hours,
        "best_hydration_day": best_day,
        "best_hydration_ml": best_total,
        "water_target_ml": target_ml,
    }


async def generate_summary_text(metrics: dict, user_name: str = None) -> str:
    """Generate a narrative weekly summary using OpenRouter LLM."""
    # Build metrics prompt
    metrics_text = (
        f"User: {user_name or 'User'}\n"
        f"Week starting: {metrics['week_starting']}\n"
        f"Meals logged: {metrics['meals_logged']}\n"
        f"Water target days hit: {metrics['water_target_days_hit']} out of 7\n"
        f"Water target: {metrics['water_target_ml']}ml/day\n"
    )

    if metrics["avg_meal_gap_hours"]:
        metrics_text += f"Average time between meals: {metrics['avg_meal_gap_hours']} hours\n"

    if metrics["best_hydration_day"]:
        metrics_text += f"Best hydration day: {metrics['best_hydration_day']} ({metrics['best_hydration_ml']:.0f}ml)\n"

    # If no API key, generate a reasonable template fallback
    if not settings.OPENROUTER_API_KEY:
        return _fallback_summary(metrics)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://nutrisense.app",
                    "X-Title": settings.APP_NAME,
                },
                json={
                    "model": settings.OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
                        {"role": "user", "content": f"Generate a weekly summary from these metrics:\n{metrics_text}"},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 200,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        logger.error(f"LLM summary generation failed: {e}")
        return _fallback_summary(metrics)


def _fallback_summary(metrics: dict) -> str:
    """Fallback if LLM is unavailable — still uses real data."""
    m = metrics
    parts = [f"This week you logged {m['meals_logged']} meals"]
    parts.append(f"hit your water target on {m['water_target_days_hit']} out of 7 days")

    if m["avg_meal_gap_hours"]:
        parts.append(f"and your average time between meals was {m['avg_meal_gap_hours']} hours")

    summary = ", ".join(parts) + "."

    if m.get("best_hydration_day"):
        summary += f" Your best hydration day was {m['best_hydration_day']}."

    return summary
