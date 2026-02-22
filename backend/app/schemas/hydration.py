from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class HydrationLogCreate(BaseModel):
    amountMl: float = 250


class HydrationScoreSignals(BaseModel):
    lastWaterMinsAgo: Optional[int] = None
    temperatureCelsius: Optional[float] = None
    stepsToday: Optional[int] = None
    waterLoggedMl: float
    targetMl: int


class HydrationLogResponse(BaseModel):
    success: bool = True
    logId: str
    hydrationScore: int
    scoreLabel: str


class HydrationScoreResponse(BaseModel):
    score: int
    label: str
    color: str
    signals: HydrationScoreSignals


class HydrationLogItem(BaseModel):
    id: str
    amountMl: float
    loggedAt: datetime


class HydrationTodayResponse(BaseModel):
    logs: List[HydrationLogItem]
    totalMl: float
    targetMl: int
    percentOfTarget: int


class HydrationDaySummary(BaseModel):
    date: str
    totalMl: float
    targetMl: int
    avgScore: Optional[int] = None


class HydrationHistoryResponse(BaseModel):
    history: List[HydrationDaySummary]
