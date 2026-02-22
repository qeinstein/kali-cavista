"""
Composite Digital Twin Prediction Service.
Orchestrates multiple 'Harmony' models for different life facets.
"""

import math
import numpy as np
from datetime import datetime, timedelta, timezone as tz
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.models.user import User
from app.models.tracking import MealLog, HydrationLog, MealSize, MoodLog
from app.models.prediction import Prediction
from app.models.health import HealthSnapshot, SleepLog
from app.services.harmony_engine import HarmonyEngine

# ── Engines ──────────────────────────────────────────────────────────────

hunger_engine = HarmonyEngine(facet="hunger", num_features=9)
energy_engine = HarmonyEngine(facet="energy", num_features=8)
mood_engine = HarmonyEngine(facet="mood", num_features=8)

# ── Shared Helpers ───────────────────────────────────────────────────────

def _cyclical(value: float, period: float) -> tuple[float, float]:
    angle = 2 * math.pi * value / period
    return math.sin(angle), math.cos(angle)

def _encode_meal_size(size: MealSize) -> float:
    return {"light": 0.0, "medium": 0.5, "heavy": 1.0}.get(size.value if size else "medium", 0.5)

def _compute_confidence(samples: int) -> float:
    """Confidence scales with training samples, capped at 0.95."""
    if samples < 3: # MIN_SAMPLES_FOR_MODEL
        return round(0.20 + 0.05 * samples, 2)
    return round(min(0.95, 0.3 + 0.6 * (1 - 1 / (1 + samples / 10))), 2)

# ── Hunger Facet ─────────────────────────────────────────────────────────

async def _build_hunger_features(meal: MealLog, db: AsyncSession) -> np.ndarray:
    ts = meal.logged_at
    h_sin, h_cos = _cyclical(ts.hour + ts.minute / 60, 24.0)
    d_sin, d_cos = _cyclical(ts.isoweekday(), 7.0)
    
    meal_size = _encode_meal_size(meal.meal_size)
    hunger_before = (meal.hunger_level_before or 5) / 10.0

    # Recent water (4h)
    water_res = await db.execute(
        select(func.coalesce(func.sum(HydrationLog.amount_ml), 0.0))
        .where(HydrationLog.user_id == meal.user_id, HydrationLog.logged_at.between(ts - timedelta(hours=4), ts))
    )
    water_norm = min(float(water_res.scalar() or 0) / 2000.0, 1.5)

    # Last night's sleep
    sleep_res = await db.execute(
        select(SleepLog.duration_minutes).where(SleepLog.user_id == meal.user_id).order_by(desc(SleepLog.sleep_end)).limit(1)
    )
    sleep_mins = sleep_res.scalar_one_or_none() or 420
    sleep_norm = min(sleep_mins / 600.0, 1.5)

    # Today's calories
    today_start = datetime.combine(ts.date(), datetime.min.time()).replace(tzinfo=tz.utc)
    cal_res = await db.execute(
        select(func.coalesce(func.sum(HealthSnapshot.active_calories), 0))
        .where(HealthSnapshot.user_id == meal.user_id, HealthSnapshot.snapshot_at.between(today_start, ts))
    )
    cal_norm = min(float(cal_res.scalar() or 0) / 500.0, 2.0)

    return np.array([h_sin, h_cos, d_sin, d_cos, meal_size, hunger_before, water_norm, sleep_norm, cal_norm])

async def train_on_new_meal(user: User, new_meal: MealLog, db: AsyncSession) -> None:
    result = await db.execute(
        select(MealLog).where(MealLog.user_id == user.id, MealLog.id != new_meal.id, MealLog.logged_at < new_meal.logged_at)
        .order_by(desc(MealLog.logged_at)).limit(1)
    )
    prev_meal = result.scalar_one_or_none()
    if not prev_meal: return

    gap = (new_meal.logged_at - prev_meal.logged_at).total_seconds() / 3600.0
    if 1.0 <= gap <= 14.0:
        features = await _build_hunger_features(prev_meal, db)
        await hunger_engine.train_step(user.id, features, gap, db)

async def generate_prediction(user: User, db: AsyncSession) -> Prediction:
    latest_res = await db.execute(
        select(MealLog).where(MealLog.user_id == user.id).order_by(desc(MealLog.logged_at)).limit(1)
    )
    latest_meal = latest_res.scalar_one_or_none()
    
    count_res = await db.execute(select(func.count(MealLog.id)).where(MealLog.user_id == user.id))
    total_meals = int(count_res.scalar() or 0)

    next_hunger_at = None
    confidence = 0.3

    if latest_meal:
        features = await _build_hunger_features(latest_meal, db)
        pred_gap = await hunger_engine.predict(user.id, features, db)
        
        if pred_gap:
            pred_gap = max(1.0, min(pred_gap, 12.0))
            next_hunger_at = latest_meal.logged_at + timedelta(hours=pred_gap)
            samples = await hunger_engine.get_training_samples(user.id, db)
            confidence = _compute_confidence(samples)
        else:
            # Fallback to heuristic
            avg_gap = 14.0 / (user.meals_per_day or 3)
            next_hunger_at = latest_meal.logged_at + timedelta(hours=avg_gap)
            confidence = 0.3

    prediction = Prediction(user_id=user.id, next_hunger_at=next_hunger_at, confidence=confidence, based_on_meals=total_meals)
    db.add(prediction)
    await db.flush()
    return prediction

# ── Energy & Mood Facets ────────────────────────────────────────────────

async def _build_context_features(user_id, ts, db: AsyncSession) -> np.ndarray:
    """Builds shared context features for Energy/Mood facets."""
    h_sin, h_cos = _cyclical(ts.hour + ts.minute / 60, 24.0)
    
    # Time since last meal
    meal_res = await db.execute(
        select(MealLog.logged_at).where(MealLog.user_id == user_id).order_by(desc(MealLog.logged_at)).limit(1)
    )
    last_meal_at = meal_res.scalar_one_or_none()
    hours_since_meal = (ts - last_meal_at).total_seconds() / 3600.0 if last_meal_at else 6.0
    meal_norm = min(hours_since_meal / 10.0, 2.0)

    # Activity (steps in last 2h)
    act_res = await db.execute(
        select(func.coalesce(func.sum(HealthSnapshot.steps_count), 0))
        .where(HealthSnapshot.user_id == user_id, HealthSnapshot.snapshot_at.between(ts - timedelta(hours=2), ts))
    )
    steps_norm = min(float(act_res.scalar() or 0) / 4000.0, 1.5)

    # Sleep quality (normalized duration/quality)
    sleep_res = await db.execute(
        select(SleepLog).where(SleepLog.user_id == user_id).order_by(desc(SleepLog.sleep_end)).limit(1)
    )
    sleep = sleep_res.scalar_one_or_none()
    sleep_norm = (sleep.duration_minutes / 600.0) if sleep else 0.7
    
    return np.array([h_sin, h_cos, meal_norm, steps_norm, sleep_norm])

# ── Hydration Facet ───────────────────────────────────────────────────

hydration_engine = HarmonyEngine(facet="hydration", num_features=6)

async def _build_hydration_features(user_id, ts, db: AsyncSession) -> np.ndarray:
    """Features: current hour, ambient temp (simulated), steps, activity, prev water."""
    h_sin, h_cos = _cyclical(ts.hour + ts.minute / 60, 24.0)
    
    # Active calories (last 4h)
    cal_res = await db.execute(
        select(func.coalesce(func.sum(HealthSnapshot.active_calories), 0))
        .where(HealthSnapshot.user_id == user_id, HealthSnapshot.snapshot_at.between(ts - timedelta(hours=4), ts))
    )
    cal_norm = min(float(cal_res.scalar() or 0) / 1000.0, 2.0)

    # Ambient Temp (Simulated for now, or from config/profile)
    temp_c = 25.0 # Default
    temp_norm = min(temp_c / 40.0, 1.5)

    # Water logged in last 6h
    water_res = await db.execute(
        select(func.coalesce(func.sum(HydrationLog.amount_ml), 0.0))
        .where(HydrationLog.user_id == user_id, HydrationLog.logged_at.between(ts - timedelta(hours=6), ts))
    )
    water_in = float(water_res.scalar() or 0)
    water_norm = min(water_in / 3000.0, 1.5)

    # Steps (last 4h)
    steps_res = await db.execute(
        select(func.coalesce(func.sum(HealthSnapshot.steps_count), 0))
        .where(HealthSnapshot.user_id == user_id, HealthSnapshot.snapshot_at.between(ts - timedelta(hours=4), ts))
    )
    steps_norm = min(float(steps_res.scalar() or 0) / 10000.0, 1.5)

    return np.array([h_sin, h_cos, cal_norm, temp_norm, water_norm, steps_norm])

async def train_energy_mood(user_id, mood_log: MoodLog, db: AsyncSession) -> None:
    """Trains Energy and Mood models based on a new MoodLog entry."""
    ts = mood_log.logged_at
    features = await _build_context_features(user_id, ts, db)
    
    if mood_log.energy_level is not None:
        await energy_engine.train_step(user_id, features, float(mood_log.energy_level), db)
        
    mood_map = {"great": 5, "good": 4, "okay": 3, "low": 2, "bad": 1}
    mood_val = mood_map.get(mood_log.mood.value, 3)
    await mood_engine.train_step(user_id, features, float(mood_val), db)


async def train_hydration(user_id, hydration_log: HydrationLog, db: AsyncSession) -> None:
    """Trains Hydration model after a significant water log or deficit feedback."""
    ts = hydration_log.logged_at
    features = await _build_hydration_features(user_id, ts, db)
    target = float(hydration_log.amount_ml) / 1000.0 # liters
    await hydration_engine.train_step(user_id, features, target, db)



# ── Composite Digital Twin ──────────────────────────────────────────────

async def generate_composite_prediction(user: User, db: AsyncSession) -> dict:
    """
    Returns the full state of the user's digital twin across all facets.
    """
    now = datetime.now(tz.utc)
    
    # Hunger Prediction (existing logic)
    hunger_pred = await generate_prediction(user, db)
    
    # Energy & Mood Context
    context_features = await _build_context_features(user.id, now, db)
    energy_val = await energy_engine.predict(user.id, context_features, db)
    mood_val = await mood_engine.predict(user.id, context_features, db)
    
    # Hydration context
    hyd_features = await _build_hydration_features(user.id, now, db)
    hyd_deficit = await hydration_engine.predict(user.id, hyd_features, db)
    
    # Confidence scores
    energy_samples = await energy_engine.get_training_samples(user.id, db)
    mood_samples = await mood_engine.get_training_samples(user.id, db)
    hyd_samples = await hydration_engine.get_training_samples(user.id, db)

    return {
        "hunger": {
            "nextHungerAt": hunger_pred.next_hunger_at,
            "confidence": hunger_pred.confidence
        },
        "energy": {
            "predictedLevel": round(max(1.0, min(energy_val or 5.0, 10.0)), 1),
            "confidence": _compute_confidence(energy_samples)
        },
        "mood": {
            "predictedLevel": round(max(1.0, min(mood_val or 3.0, 5.0)), 1),
            "confidence": _compute_confidence(mood_samples)
        },
        "hydration": {
            "predictedDeficitLiters": round(max(0.0, min(hyd_deficit or 0.2, 3.0)), 2),
            "confidence": _compute_confidence(hyd_samples)
        }
    }

