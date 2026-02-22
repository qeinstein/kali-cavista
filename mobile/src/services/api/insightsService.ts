import { useState } from "react";
import BaseRequest, { parseNetworkError } from "../../helpers/services";
import { useRequest } from "../../helpers/services/useRequest";

// ─── Types matching API contracts ────────────────────────────────────────────

export type InsightType = "info" | "warning" | "alert";

export interface InsightData {
  id: string;
  type: InsightType;
  title: string;
  body: string;
}

export interface InsightsListResponse {
  insights: InsightData[];
}

/** GET /api/v1/insights/weekly-summary */
export interface WeeklySummaryMetrics {
  mealsLogged: number;
  waterTargetDaysHit: number;
  avgMealGapHours: number;
}

export interface WeeklySummaryResponse {
  weekStarting: string;
  summary: string;
  metrics: WeeklySummaryMetrics;
}

// ─── GET: Active insights ───────────────────────────────────────────────────

/**
 * useInsights()
 * → GET /api/v1/insights
 * → Returns { insights: [{id, type, title, body}] }
 */
export const useInsights = () => {
  return useRequest("/api/v1/insights", {
    initialValue: { insights: [] },
  });
};

// ─── GET: Weekly summary ────────────────────────────────────────────────────

/**
 * useWeeklySummary()
 * → GET /api/v1/insights/weekly-summary
 * → Returns { weekStarting, summary, metrics: { mealsLogged, waterTargetDaysHit, avgMealGapHours } }
 */
export const useWeeklySummary = () => {
  return useRequest("/api/v1/insights/weekly-summary", {
    initialValue: null,
  });
};

// ─── POST: Dismiss insight ──────────────────────────────────────────────────

/**
 * dismissInsight(id)
 * → POST /api/v1/insights/{insight_id}/dismiss
 * → Returns { success: true }
 */
export const dismissInsight = async (
  insightId: string,
): Promise<{ success: boolean }> => {
  return await BaseRequest.post(`/api/v1/insights/${insightId}/dismiss`);
};

// ─── useInsightsService Hook ────────────────────────────────────────────────

export const useInsightsService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insightsList = useInsights();
  const weeklySummary = useWeeklySummary();

  const handleAction = async <T>(action: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await action();
      return res;
    } catch (err: any) {
      const [message] = parseNetworkError(err);
      setError(message as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async (insightId: string) => {
    return handleAction(() => dismissInsight(insightId));
  };

  return {
    isLoading,
    error,
    insights: insightsList,
    weeklySummary,
    dismissInsight: handleDismiss,
  };
};
