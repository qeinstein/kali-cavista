from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class PredictionResponse(BaseModel):
    nextHungerAt: Optional[datetime] = None
    hoursUntilHungry: Optional[float] = None
    confidence: Optional[float] = None
    generatedAt: Optional[datetime] = None
    basedOnMeals: int = 0


class PredictionRefreshResponse(BaseModel):
    nextHungerAt: Optional[datetime] = None
    hoursUntilHungry: Optional[float] = None
    confidence: Optional[float] = None


class HungerFeedbackCreate(BaseModel):
    hungerLevel: int
    ratedAt: datetime

    @field_validator("hungerLevel")
    @classmethod
    def validate_hunger(cls, v):
        if v < 1 or v > 10:
            raise ValueError("hungerLevel must be between 1 and 10")
        return v


class PredictionHistoryItem(BaseModel):
    predictedAt: datetime
    nextHungerAt: Optional[datetime] = None
    actualHungerAt: Optional[datetime] = None
    accuracyMinutes: Optional[int] = None
    confidence: Optional[float] = None


class PredictionHistoryResponse(BaseModel):
    predictions: List[PredictionHistoryItem]
    avgAccuracyMinutes: Optional[int] = None
