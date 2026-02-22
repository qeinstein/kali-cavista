from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.tracking import MoodLevel


# ── Mood / Energy ───────────────────────────────────────────────
class MoodLogCreate(BaseModel):
    mood: MoodLevel
    energyLevel: Optional[int] = None  # 1-10
    notes: Optional[str] = None
    loggedAt: Optional[datetime] = None


class MoodLogResponse(BaseModel):
    id: str
    mood: str
    energyLevel: Optional[int]
    loggedAt: datetime
    success: bool = True

    model_config = ConfigDict(from_attributes=True)


# ── Activity ────────────────────────────────────────────────────
class ActivityLogCreate(BaseModel):
    activityType: str
    durationMinutes: int
    caloriesBurned: Optional[int] = None
    intensity: Optional[str] = None
    loggedAt: Optional[datetime] = None


class ActivityLogResponse(BaseModel):
    id: str
    activityType: str
    success: bool = True

    model_config = ConfigDict(from_attributes=True)
