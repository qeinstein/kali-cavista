"""
Chat service — OpenRouter LLM integration.

Assembles user health context and sends it to an LLM via OpenRouter
to generate personalised, context-aware responses with actionable intents.
"""

import json
import logging
from datetime import datetime, time, timedelta, timezone as tz
from typing import Optional

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.config import settings
from app.models.user import User
from app.models.tracking import MealLog, HydrationLog
from app.models.prediction import Prediction

logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """You are NutriSense AI — a friendly, concise health assistant embedded in a meal and hydration tracking app.

You have access to the user's real-time health context (provided below). Use it to give personalised, actionable advice.

RULES:
1. Be warm but brief — max 2-3 sentences for simple queries.
2. When the user describes eating or drinking, extract it into a structured action.
3. Never invent data you don't have. If context is missing, say so.
4. Use the user's name if available.
5. Reference their actual data (meal count, hydration score, predictions) when relevant.

ACTIONS — if the user's message implies any of these, include them in your response JSON:
- LOG_MEAL: user ate something → extract mealSize (light/medium/heavy)
- LOG_WATER: user drank water → extract amountMl (default 250)

RESPONSE FORMAT — you MUST reply with valid JSON only, no markdown fences:
{
  "reply": "Your natural language response to the user",
  "actions": [{"type": "ACTION_TYPE", "payload": {...}}, ...]
}

If no actions are needed, return an empty actions array.
"""


async def _build_user_context(user: User, db: AsyncSession) -> str:
    """Assemble the user's current health context for the LLM."""
    now = datetime.now(tz.utc)
    day_start = datetime.combine(now.date(), time.min, tzinfo=tz.utc)
    day_end = datetime.combine(now.date(), time.max, tzinfo=tz.utc)

    # Today's meals
    meals_result = await db.execute(
        select(MealLog)
        .where(MealLog.user_id == user.id, MealLog.logged_at.between(day_start, day_end))
        .order_by(desc(MealLog.logged_at))
    )
    meals = meals_result.scalars().all()

    # Today's water
    water_result = await db.execute(
        select(func.coalesce(func.sum(HydrationLog.amount_ml), 0.0))
        .where(HydrationLog.user_id == user.id, HydrationLog.logged_at.between(day_start, day_end))
    )
    water_ml = float(water_result.scalar())

    # Latest prediction
    pred_result = await db.execute(
        select(Prediction)
        .where(Prediction.user_id == user.id)
        .order_by(desc(Prediction.generated_at))
        .limit(1)
    )
    prediction = pred_result.scalar_one_or_none()

    target_ml = user.water_target_ml or 2000

    context_parts = [
        f"Current time: {now.strftime('%Y-%m-%d %H:%M UTC')}",
        f"User: {user.name or 'Unknown'} (timezone: {user.timezone})",
        f"Today's meals: {len(meals)} logged",
    ]

    if meals:
        meal_list = ", ".join(
            f"{m.meal_size.value} at {m.logged_at.strftime('%H:%M')}"
            for m in meals
        )
        context_parts.append(f"Meal details: {meal_list}")

    context_parts.extend([
        f"Water today: {water_ml:.0f}ml / {target_ml}ml target ({int(water_ml/target_ml*100)}%)",
    ])

    if prediction and prediction.next_hunger_at:
        diff = (prediction.next_hunger_at - now).total_seconds() / 3600
        context_parts.append(
            f"Next predicted hunger: {prediction.next_hunger_at.strftime('%H:%M UTC')} "
            f"({max(diff, 0):.1f}h from now, confidence: {prediction.confidence or 0:.0%})"
        )

    return "\n".join(context_parts)


async def get_llm_response(
    user: User,
    message: str,
    conversation_history: list[dict],
    db: AsyncSession,
) -> tuple[str, list[dict]]:
    """
    Send message to OpenRouter LLM with full user context.
    Returns (reply_text, actions_list).
    """
    if not settings.OPENROUTER_API_KEY:
        return (
            "Chat is not configured yet — the OPENROUTER_API_KEY needs to be set in the environment.",
            [],
        )

    # Build context
    user_context = await _build_user_context(user, db)

    # Assemble messages
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"USER HEALTH CONTEXT:\n{user_context}"},
    ]

    # Add conversation history (last N messages for context window)
    for msg in conversation_history[-20:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current message
    messages.append({"role": "user", "content": message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
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
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 512,
                },
            )
            response.raise_for_status()
            data = response.json()

        raw_content = data["choices"][0]["message"]["content"].strip()

        # Strip markdown code fences if the model wraps them
        if raw_content.startswith("```"):
            lines = raw_content.split("\n")
            raw_content = "\n".join(
                l for l in lines if not l.startswith("```")
            ).strip()

        # Parse structured response
        try:
            parsed = json.loads(raw_content)
            reply = parsed.get("reply", raw_content)
            actions = parsed.get("actions", [])
        except json.JSONDecodeError:
            # Model returned plain text — use as-is with no actions
            reply = raw_content
            actions = []

        return reply, actions

    except httpx.HTTPStatusError as e:
        logger.error(f"OpenRouter API error: {e.response.status_code} — {e.response.text}")
        return "Sorry, I'm having trouble connecting right now. Please try again in a moment.", []
    except Exception as e:
        logger.error(f"Chat service error: {e}")
        return "Something went wrong on my end. Please try again.", []
