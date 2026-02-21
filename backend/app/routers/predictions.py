from datetime import datetime, timedelta, timezone as tz

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.core.database import get_db
from app.core.errors import RateLimitedError
from app.core.security import get_current_user
from app.models.user import User
from app.models.prediction import Prediction, HungerFeedback
from app.models.tracking import MealLog
from app.schemas.predictions import (
    PredictionResponse, PredictionRefreshResponse,
    HungerFeedbackCreate, PredictionHistoryItem, PredictionHistoryResponse,
)
from app.schemas.user import SuccessResponse
from app.services.prediction import generate_prediction

router = APIRouter(prefix="/predictions", tags=["Predictions"])


def _hours_until(target: datetime) -> float | None:
    if not target:
        return None
    diff = (target - datetime.now(tz.utc)).total_seconds() / 3600
    return round(max(diff, 0), 2)


@router.get("/current", response_model=PredictionResponse)
async def get_current_prediction(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the latest hunger prediction."""
    result = await db.execute(
        select(Prediction)
        .where(Prediction.user_id == user.id)
        .order_by(desc(Prediction.generated_at))
        .limit(1)
    )
    pred = result.scalar_one_or_none()

    if not pred:
        # Generate first prediction on demand
        pred = await generate_prediction(user, db)

    return PredictionResponse(
        nextHungerAt=pred.next_hunger_at,
        hoursUntilHungry=_hours_until(pred.next_hunger_at),
        confidence=pred.confidence,
        generatedAt=pred.generated_at,
        basedOnMeals=pred.based_on_meals,
    )


@router.post("/refresh", response_model=PredictionRefreshResponse)
async def refresh_prediction(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Force a new prediction. Rate limited to once per 5 minutes."""
    # Rate limiting: check last prediction time
    result = await db.execute(
        select(Prediction.generated_at)
        .where(Prediction.user_id == user.id)
        .order_by(desc(Prediction.generated_at))
        .limit(1)
    )
    last_generated = result.scalar_one_or_none()

    if last_generated:
        cooldown = datetime.now(tz.utc) - last_generated
        if cooldown < timedelta(minutes=5):
            remaining = int((timedelta(minutes=5) - cooldown).total_seconds())
            raise RateLimitedError(
                message=f"Rate limited. Try again in {remaining} seconds.",
                retry_after=remaining,
            )

    pred = await generate_prediction(user, db)

    return PredictionRefreshResponse(
        nextHungerAt=pred.next_hunger_at,
        hoursUntilHungry=_hours_until(pred.next_hunger_at),
        confidence=pred.confidence,
    )


@router.post("/feedback", response_model=SuccessResponse)
async def submit_feedback(
    payload: HungerFeedbackCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit hunger rating feedback (ground truth for model training)."""
    feedback = HungerFeedback(
        user_id=user.id,
        hunger_level=payload.hungerLevel,
        rated_at=payload.ratedAt,
    )
    db.add(feedback)
    await db.flush()
    return SuccessResponse()


@router.get("/history", response_model=PredictionHistoryResponse)
async def get_prediction_history(
    days: int = Query(7, ge=1, le=30),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Past predictions and their accuracy."""
    since = datetime.now(tz.utc) - timedelta(days=days)

    # Get predictions in the time range
    result = await db.execute(
        select(Prediction)
        .where(Prediction.user_id == user.id, Prediction.generated_at >= since)
        .order_by(desc(Prediction.generated_at))
    )
    predictions = result.scalars().all()

    items = []
    accuracy_values = []

    for pred in predictions:
        actual_hunger_at = None
        accuracy_minutes = None

        # Find the first meal logged after the predicted hunger time
        if pred.next_hunger_at:
            meal_result = await db.execute(
                select(MealLog.logged_at)
                .where(
                    MealLog.user_id == user.id,
                    MealLog.logged_at >= pred.next_hunger_at - timedelta(hours=1),
                    MealLog.logged_at <= pred.next_hunger_at + timedelta(hours=3),
                )
                .order_by(MealLog.logged_at)
                .limit(1)
            )
            actual_time = meal_result.scalar_one_or_none()
            if actual_time:
                actual_hunger_at = actual_time
                accuracy_minutes = abs(
                    int((actual_time - pred.next_hunger_at).total_seconds() / 60)
                )
                accuracy_values.append(accuracy_minutes)

        items.append(PredictionHistoryItem(
            predictedAt=pred.generated_at,
            nextHungerAt=pred.next_hunger_at,
            actualHungerAt=actual_hunger_at,
            accuracyMinutes=accuracy_minutes,
            confidence=pred.confidence,
        ))

    avg_accuracy = (
        int(sum(accuracy_values) / len(accuracy_values))
        if accuracy_values else None
    )

    return PredictionHistoryResponse(
        predictions=items,
        avgAccuracyMinutes=avg_accuracy,
    )
