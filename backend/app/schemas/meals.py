from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

from app.models.tracking import MealSize


class MealLogCreate(BaseModel):
    mealSize: MealSize
    hungerLevelBefore: Optional[int] = None
    notes: Optional[str] = None

    @field_validator("hungerLevelBefore")
    @classmethod
    def validate_hunger(cls, v):
        if v is not None and (v < 1 or v > 10):
            raise ValueError("hungerLevelBefore must be between 1 and 10")
        return v


class HungerPrediction(BaseModel):
    nextHungerAt: Optional[datetime] = None
    confidence: Optional[float] = None


class MealLogResponse(BaseModel):
    success: bool = True
    mealId: str
    prediction: HungerPrediction


class MealItem(BaseModel):
    id: str
    mealSize: str
    loggedAt: datetime
    hungerLevelBefore: Optional[int] = None

    model_config = {"from_attributes": True}


class MealHistoryResponse(BaseModel):
    meals: List[MealItem]
    total: int


class MealTodayResponse(BaseModel):
    meals: List[MealItem]
    count: int
