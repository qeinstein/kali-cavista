"""
Online learning hunger prediction engine.

Uses scikit-learn SGDRegressor with partial_fit for per-user incremental
learning. Each user gets their own model weights stored in the DB, updated
every time they log a meal.

Target variable: hours until next meal (known retrospectively).
Features: time-of-day, day-of-week, meal size, hunger level, hydration,
          sleep duration, and activity calories.
"""

import json
import math
import numpy as np
from datetime import datetime, timedelta, timezone as tz
from typing import Optional

from sklearn.linear_model import SGDRegressor
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.models.user import User
from app.models.tracking import MealLog, HydrationLog, MealSize
from app.models.prediction import Prediction
from app.models.health import HealthSnapshot, SleepLog
from app.models.user_model import UserModel

# ── Constants ──────────────────────────────────────────────────────────────

NUM_FEATURES = 9
MIN_SAMPLES_FOR_MODEL = 3  # fall back to heuristic below this
DEFAULT_WAKING_HOURS = 14.0


# ── Feature extraction ────────────────────────────────────────────────────

def _encode_meal_size(size: MealSize) -> float:
    return {"light": 0.0, "medium": 0.5, "heavy": 1.0}.get(size.value if size else "medium", 0.5)


def _cyclical(value: float, period: float) -> tuple[float, float]:
    angle = 2 * math.pi * value / period
    return math.sin(angle), math.cos(angle)


async def _build_features(meal: MealLog, db: AsyncSession) -> np.ndarray:
    """
    Build a 9-feature vector from a meal's temporal context.

    Features:
        0-1: hour_sin, hour_cos      (time of day)
        2-3: dow_sin, dow_cos         (day of week)
        4:   meal_size                (light=0, medium=0.5, heavy=1)
        5:   hunger_before            (0-1 normalized, 0.5 default)
        6:   recent_water_ml          (last 4 hours, normalized /2000)
        7:   sleep_hours              (last night, normalized /10)
        8:   active_calories          (today, normalized /500)
    """
    ts = meal.logged_at
    hour_sin, hour_cos = _cyclical(ts.hour + ts.minute / 60, 24.0)
    dow_sin, dow_cos = _cyclical(ts.isoweekday(), 7.0)

    meal_size = _encode_meal_size(meal.meal_size)
    hunger_before = (meal.hunger_level_before or 5) / 10.0

    # Recent water intake (last 4 hours)
    water_since = ts - timedelta(hours=4)
    water_result = await db.execute(
        select(func.coalesce(func.sum(HydrationLog.amount_ml), 0.0))
        .where(
            HydrationLog.user_id == meal.user_id,
            HydrationLog.logged_at >= water_since,
            HydrationLog.logged_at <= ts,
        )
    )
    water_ml = float(water_result.scalar() or 0)
    water_norm = min(water_ml / 2000.0, 1.5)

    # Last night's sleep duration
    yesterday = ts.date() - timedelta(days=1)
    sleep_result = await db.execute(
        select(SleepLog.duration_minutes)
        .where(
            SleepLog.user_id == meal.user_id,
            func.date(SleepLog.sleep_end) >= yesterday,
        )
        .order_by(desc(SleepLog.sleep_end))
        .limit(1)
    )
    sleep_minutes = sleep_result.scalar_one_or_none()
    sleep_hours = (sleep_minutes / 60.0) if sleep_minutes else 7.0  # default 7h
    sleep_norm = min(sleep_hours / 10.0, 1.5)

    # Today's active calories
    today_start = datetime.combine(ts.date(), datetime.min.time()).replace(tzinfo=tz.utc)
    cal_result = await db.execute(
        select(func.coalesce(func.sum(HealthSnapshot.active_calories), 0))
        .where(
            HealthSnapshot.user_id == meal.user_id,
            HealthSnapshot.snapshot_at >= today_start,
            HealthSnapshot.snapshot_at <= ts,
        )
    )
    active_cals = float(cal_result.scalar() or 0)
    cals_norm = min(active_cals / 500.0, 2.0)

    return np.array([
        hour_sin, hour_cos,
        dow_sin, dow_cos,
        meal_size,
        hunger_before,
        water_norm,
        sleep_norm,
        cals_norm,
    ], dtype=np.float64)


# ── Model serialization ───────────────────────────────────────────────────

def _serialize_model(model: SGDRegressor) -> str:
    return json.dumps({
        "coef": model.coef_.tolist(),
        "intercept": model.intercept_.tolist(),
        "t": float(model.t_),
    })


def _deserialize_model(data: str) -> SGDRegressor:
    parsed = json.loads(data)
    model = SGDRegressor(
        loss="huber",
        epsilon=0.5,
        penalty="l2",
        alpha=0.001,
        learning_rate="invscaling",
        eta0=0.05,
        power_t=0.25,
        warm_start=True,
    )
    model.coef_ = np.array(parsed["coef"])
    model.intercept_ = np.array(parsed["intercept"])
    model.t_ = parsed["t"]
    return model


def _new_model() -> SGDRegressor:
    return SGDRegressor(
        loss="huber",
        epsilon=0.5,
        penalty="l2",
        alpha=0.001,
        learning_rate="invscaling",
        eta0=0.05,
        power_t=0.25,
        warm_start=True,
    )


def _serialize_scaler(mean: np.ndarray, var: np.ndarray, count: int) -> str:
    return json.dumps({
        "mean": mean.tolist(),
        "var": var.tolist(),
        "count": count,
    })


def _deserialize_scaler(data: str) -> tuple[np.ndarray, np.ndarray, int]:
    parsed = json.loads(data)
    return np.array(parsed["mean"]), np.array(parsed["var"]), parsed["count"]


def _update_running_stats(
    old_mean: np.ndarray, old_var: np.ndarray, old_count: int,
    new_x: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, int]:
    """Welford's online algorithm for running mean/variance."""
    n = old_count + 1
    delta = new_x - old_mean
    new_mean = old_mean + delta / n
    delta2 = new_x - new_mean
    new_var = ((old_var * old_count) + delta * delta2) / n
    return new_mean, new_var, n


def _normalize(x: np.ndarray, mean: np.ndarray, var: np.ndarray) -> np.ndarray:
    std = np.sqrt(var + 1e-8)
    return (x - mean) / std


# ── Confidence calculation ─────────────────────────────────────────────────

def _compute_confidence(samples: int) -> float:
    """Confidence scales with training samples, capped at 0.95."""
    if samples < MIN_SAMPLES_FOR_MODEL:
        return round(0.20 + 0.05 * samples, 2)
    return round(min(0.95, 0.3 + 0.6 * (1 - 1 / (1 + samples / 10))), 2)


# ── Core engine ────────────────────────────────────────────────────────────

async def _get_or_create_user_model(user_id, db: AsyncSession) -> UserModel:
    result = await db.execute(
        select(UserModel).where(UserModel.user_id == user_id)
    )
    um = result.scalar_one_or_none()
    if not um:
        um = UserModel(user_id=user_id)
        db.add(um)
        await db.flush()
    return um


async def train_on_new_meal(user: User, new_meal: MealLog, db: AsyncSession) -> None:
    """
    Called when a new meal is logged. Trains the model on the gap between
    the *previous* meal and this one.
    """
    # Find the previous meal (the one before this new one)
    result = await db.execute(
        select(MealLog)
        .where(
            MealLog.user_id == user.id,
            MealLog.id != new_meal.id,
            MealLog.logged_at < new_meal.logged_at,
        )
        .order_by(desc(MealLog.logged_at))
        .limit(1)
    )
    prev_meal = result.scalar_one_or_none()

    if not prev_meal:
        return  # first meal ever, nothing to train on

    # Compute target: hours between previous meal and this one
    gap_hours = (new_meal.logged_at - prev_meal.logged_at).total_seconds() / 3600.0

    # Skip unreasonable gaps (overnight, or micro-snacks)
    if gap_hours < 1.0 or gap_hours > 14.0:
        return

    # Build features from the previous meal's context
    features = await _build_features(prev_meal, db)

    # Load or create user model
    um = await _get_or_create_user_model(user.id, db)

    # Update running scaler
    if um.feature_scaler:
        mean, var, count = _deserialize_scaler(um.feature_scaler)
    else:
        mean = np.zeros(NUM_FEATURES)
        var = np.ones(NUM_FEATURES)
        count = 0

    mean, var, count = _update_running_stats(mean, var, count, features)
    um.feature_scaler = _serialize_scaler(mean, var, count)

    # Normalize features
    features_norm = _normalize(features, mean, var)

    # Load or create SGD model
    if um.model_weights:
        model = _deserialize_model(um.model_weights)
    else:
        model = _new_model()

    # Online learning step
    X = features_norm.reshape(1, -1)
    y = np.array([gap_hours])
    model.partial_fit(X, y)

    # Save updated model
    um.model_weights = _serialize_model(model)
    um.training_samples = (um.training_samples or 0) + 1
    um.last_trained_at = datetime.now(tz.utc)

    await db.flush()


async def generate_prediction(user: User, db: AsyncSession) -> Prediction:
    """
    Generate a hunger prediction. Uses the online model if enough data,
    otherwise falls back to a heuristic.
    """
    # Count total meals
    count_result = await db.execute(
        select(func.count(MealLog.id)).where(MealLog.user_id == user.id)
    )
    total_meals = int(count_result.scalar() or 0)

    # Get the most recent meal
    latest_result = await db.execute(
        select(MealLog)
        .where(MealLog.user_id == user.id)
        .order_by(desc(MealLog.logged_at))
        .limit(1)
    )
    latest_meal = latest_result.scalar_one_or_none()

    now = datetime.now(tz.utc)
    next_hunger_at: Optional[datetime] = None
    confidence: Optional[float] = None

    if not latest_meal:
        # No meals at all
        pass


    elif total_meals == 1:
        # One meal: use baseline
        meals_per_day = user.meals_per_day or 3
        avg_gap = DEFAULT_WAKING_HOURS / meals_per_day
        next_hunger_at = latest_meal.logged_at + timedelta(hours=avg_gap)
        confidence = _compute_confidence(0)

    elif total_meals == 2:
        # Two meals: use the one known gap
        prev_result = await db.execute(
            select(MealLog)
            .where(MealLog.user_id == user.id)
            .order_by(MealLog.logged_at)
            .limit(1)
        )
        first_meal = prev_result.scalar_one_or_none()
        if first_meal:
            gap = (latest_meal.logged_at - first_meal.logged_at).total_seconds() / 3600
            if 1.0 <= gap <= 14.0:
                next_hunger_at = latest_meal.logged_at + timedelta(hours=gap)
            else:
                next_hunger_at = latest_meal.logged_at + timedelta(hours=DEFAULT_WAKING_HOURS / (user.meals_per_day or 3))
        confidence = _compute_confidence(1)

    else:
        # 3+ meals: use the online model
        um = await _get_or_create_user_model(user.id, db)
        samples = um.training_samples or 0

        if samples >= MIN_SAMPLES_FOR_MODEL and um.model_weights and um.feature_scaler:
            # Model-based prediction
            features = await _build_features(latest_meal, db)
            mean, var, _ = _deserialize_scaler(um.feature_scaler)
            features_norm = _normalize(features, mean, var)

            model = _deserialize_model(um.model_weights)
            predicted_gap = float(model.predict(features_norm.reshape(1, -1))[0])

            # Clamp to reasonable range
            predicted_gap = max(1.0, min(predicted_gap, 12.0))
            next_hunger_at = latest_meal.logged_at + timedelta(hours=predicted_gap)
            confidence = _compute_confidence(samples)
        else:
            # Not enough training yet, use average gap heuristic
            recent_result = await db.execute(
                select(MealLog)
                .where(MealLog.user_id == user.id)
                .order_by(desc(MealLog.logged_at))
                .limit(30)
            )
            recent_meals = recent_result.scalars().all()
            sorted_meals = sorted(recent_meals, key=lambda m: m.logged_at)
            gaps = []
            for i in range(1, len(sorted_meals)):
                gap = (sorted_meals[i].logged_at - sorted_meals[i - 1].logged_at).total_seconds() / 3600
                if 1.0 <= gap <= 12.0:
                    gaps.append(gap)

            if gaps:
                avg_gap = sum(gaps) / len(gaps)
                next_hunger_at = latest_meal.logged_at + timedelta(hours=avg_gap)
                confidence = _compute_confidence(len(gaps))
            else:
                avg_gap = DEFAULT_WAKING_HOURS / (user.meals_per_day or 3)
                next_hunger_at = latest_meal.logged_at + timedelta(hours=avg_gap)
                confidence = _compute_confidence(0)

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
