from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.tracking import MealSize, MealType, MoodLevel


# ── Meal ─────────────────────────────────────────────────────────
class MealLogCreate(BaseModel):
    meal_type: MealType
    meal_size: MealSize
    description: Optional[str] = None
    logged_at: datetime


class MealLogResponse(BaseModel):
    id: int
    meal_type: MealType
    meal_size: MealSize
    description: Optional[str]
    logged_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Hydration ────────────────────────────────────────────────────
class HydrationLogCreate(BaseModel):
    amount_ml: float
    logged_at: datetime


class HydrationLogResponse(BaseModel):
    id: int
    amount_ml: float
    logged_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Mood / Energy ───────────────────────────────────────────────
class MoodLogCreate(BaseModel):
    mood: MoodLevel
    energy_level: Optional[int] = None  # 1-10
    notes: Optional[str] = None
    logged_at: datetime


class MoodLogResponse(BaseModel):
    id: int
    mood: MoodLevel
    energy_level: Optional[int]
    notes: Optional[str]
    logged_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Activity ────────────────────────────────────────────────────
class ActivityLogCreate(BaseModel):
    steps: Optional[int] = None
    active_minutes: Optional[int] = None
    sleep_hours: Optional[float] = None
    logged_at: datetime


class ActivityLogResponse(BaseModel):
    id: int
    steps: Optional[int]
    active_minutes: Optional[int]
    sleep_hours: Optional[float]
    logged_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
