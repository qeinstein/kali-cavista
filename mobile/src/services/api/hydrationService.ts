import { useState, useEffect } from "react";
import BaseRequest, { parseNetworkError } from "../../helpers/services";
import { useRequest } from "../../helpers/services/useRequest";
import { Colors } from "../../constants/theme";

// ─── Types matching API contracts ────────────────────────────────────────────

export interface HydrationLogPayload {
  amountMl: number;
}

export interface HydrationLogResponse {
  success: boolean;
  logId: string;
  hydrationScore: number;
  scoreLabel: string;
}

/** GET /api/v1/hydration/score response */
export interface HydrationScoreSignals {
  lastWaterMinsAgo: number;
  temperatureCelsius: number;
  stepsToday: number;
  waterLoggedMl: number;
  targetMl: number;
}

export interface HydrationScoreResponse {
  score: number;
  label: string;
  color: string;
  signals: HydrationScoreSignals;
}

/** GET /api/v1/hydration/today response */
export interface WaterLogEvent {
  id: string;
  amountMl: number;
  loggedAt: string;
}

export interface HydrationTodayResponse {
  logs: WaterLogEvent[];
  totalMl: number;
}

/** GET /api/v1/hydration/history response */
export interface HydrationDayData {
  date: string;
  totalMl: number;
  targetMl: number;
  avgScore: number;
}

export interface HydrationHistoryResponse {
  history: HydrationDayData[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const getScoreColor = (score: number): string => {
  if (score > 70) return Colors.green;
  if (score > 40) return Colors.warning;
  return Colors.danger;
};

export const getScoreLabel = (score: number): string => {
  if (score > 70) return "Well Hydrated";
  if (score > 40) return "Drink Soon";
  return "Dehydration Risk!";
};

// ─── GET: Hydration score ───────────────────────────────────────────────────

/**
 * useHydrationScore()
 * → GET /api/v1/hydration/score
 * → Returns { score, label, color, signals: { lastWaterMinsAgo, temperatureCelsius, stepsToday, waterLoggedMl, targetMl } }
 * → Auto-refreshes every 5 minutes
 */
export const useHydrationScore = (onScoreUpdate?: (score: number) => void) => {
  const result = useRequest("/api/v1/hydration/score", {
    refreshInterval: 300000,
    initialValue: null,
  });

  // Execute callback if score is available
  useEffect(() => {
    if (result.data) {
      const data = result.data as any;
      if (data?.score != null && onScoreUpdate) {
        onScoreUpdate(data.score);
      }
    }
  }, [result.data, onScoreUpdate]);

  return result;
};

// ─── GET: Today's water logs ────────────────────────────────────────────────

/**
 * useHydrationToday()
 * → GET /api/v1/hydration/today
 * → Returns { logs: [{id, amountMl, loggedAt}], totalMl }
 */
export const useHydrationToday = () => {
  return useRequest("/api/v1/hydration/today", {
    initialValue: { logs: [], totalMl: 0 },
  });
};

export const fetchTodayWaterLogs = async () => {
  return BaseRequest.get("/api/v1/hydration/today");
};

// ─── GET: Hydration history ─────────────────────────────────────────────────

/**
 * useHydrationHistory(days)
 * → GET /api/v1/hydration/history?days=N
 * → Returns { history: [{date, totalMl, targetMl, avgScore}] }
 */
export const useHydrationHistory = (days = 7) => {
  return useRequest("/api/v1/hydration/history", {
    params: { days },
    initialValue: { history: [] },
  });
};

// ─── POST: Log water intake ─────────────────────────────────────────────────

/**
 * logWater(amountMl)
 * → POST /api/v1/hydration/log  { amountMl }
 * → Returns { success, logId, hydrationScore, scoreLabel }
 */
export const logWater = async (
  amountMl: number = 250,
  onRefreshScore?: () => void,
): Promise<HydrationLogResponse> => {
  const response: any = await BaseRequest.post("/api/v1/hydration/log", {
    amountMl,
  });

  if (onRefreshScore) onRefreshScore();

  return response;
};

// ─── useHydrationService Hook ───────────────────────────────────────────────

export const useHydrationService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrationScore = useHydrationScore();
  const hydrationToday = useHydrationToday();

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

  const handleLogWater = async (amountMl: number = 250) => {
    return handleAction(() => logWater(amountMl, hydrationScore.onRefresh));
  };

  return {
    isLoading,
    error,
    score: hydrationScore,
    today: hydrationToday,
    logWater: handleLogWater,
    getScoreColor,
    getScoreLabel,
  };
};

export default useHydrationService;
