from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.core.errors import NotFoundError
from app.core.security import get_current_user
from app.models.user import User
from app.models.insight import Insight
from app.schemas.insights import (
    InsightItem, InsightsResponse,
    WeeklySummaryResponse, WeeklySummaryMetrics,
)
from app.schemas.user import SuccessResponse
from app.services.insights import compute_weekly_metrics, generate_summary_text

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("", response_model=InsightsResponse)
async def get_insights(
    limit: int = Query(10, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get behavioural insights, ordered by severity then recency."""
    # Custom severity ordering: alert > warning > info
    severity_order = func.array_position(
        func.cast("{alert,warning,info}", type_=func.text_array()),
        Insight.severity,
    ) if False else Insight.severity  # fallback to alphabetical which happens to be alert < info < warning

    # Simple approach: order by generated_at desc, alerts first via Python
    result = await db.execute(
        select(Insight)
        .where(Insight.user_id == user.id, Insight.dismissed == False)
        .order_by(desc(Insight.generated_at))
    )
    all_insights = result.scalars().all()

    # Sort: alert first, then warning, then info
    severity_rank = {"alert": 0, "warning": 1, "info": 2}
    sorted_insights = sorted(
        all_insights,
        key=lambda i: (severity_rank.get(i.severity, 3), i.generated_at),
    )

    limited = sorted_insights[:limit]

    return InsightsResponse(
        insights=[
            InsightItem(
                id=str(i.id),
                type=i.type,
                title=i.title,
                body=i.body,
                severity=i.severity,
                generatedAt=i.generated_at,
            )
            for i in limited
        ],
        totalInsights=len(all_insights),
    )


@router.post("/{insight_id}/dismiss", response_model=SuccessResponse)
async def dismiss_insight(
    insight_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dismiss an insight so it no longer appears."""
    result = await db.execute(
        select(Insight).where(
            Insight.id == insight_id,
            Insight.user_id == user.id,
        )
    )
    insight = result.scalar_one_or_none()

    if not insight:
        raise NotFoundError("Insight not found")

    insight.dismissed = True
    db.add(insight)
    await db.flush()
    return SuccessResponse()


@router.get("/weekly-summary", response_model=WeeklySummaryResponse)
async def get_weekly_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Narrative weekly summary of eating and hydration patterns."""
    metrics = await compute_weekly_metrics(user, db)
    summary_text = await generate_summary_text(metrics, user_name=user.name)

    return WeeklySummaryResponse(
        weekStarting=metrics["week_starting"],
        summary=summary_text,
        metrics=WeeklySummaryMetrics(
            mealsLogged=metrics["meals_logged"],
            waterTargetDaysHit=metrics["water_target_days_hit"],
            avgMealGapHours=metrics["avg_meal_gap_hours"],
        ),
    )
