from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class InsightItem(BaseModel):
    id: str
    type: str
    title: str
    body: str
    severity: str
    generatedAt: datetime


class InsightsResponse(BaseModel):
    insights: List[InsightItem]
    totalInsights: int


class WeeklySummaryMetrics(BaseModel):
    mealsLogged: int
    waterTargetDaysHit: int
    avgMealGapHours: Optional[float] = None


class WeeklySummaryResponse(BaseModel):
    weekStarting: str
    summary: str
    metrics: WeeklySummaryMetrics
