from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class HealthSnapshotItem(BaseModel):
    snapshotAt: datetime
    stepsCount: Optional[int] = None
    activeCalories: Optional[int] = None
    heartRate: Optional[int] = None


class HealthSyncRequest(BaseModel):
    snapshots: List[HealthSnapshotItem]


class HealthSyncResponse(BaseModel):
    success: bool = True
    snapshotsReceived: int


class SleepSyncRequest(BaseModel):
    sleepStart: datetime
    sleepEnd: datetime
    durationMinutes: int
    quality: Optional[str] = None

    @field_validator("quality")
    @classmethod
    def validate_quality(cls, v):
        if v is not None and v not in ("poor", "fair", "good", "excellent"):
            raise ValueError("quality must be one of: poor, fair, good, excellent")
        return v
