import BaseRequest from "../../helpers/services";
import { useRequest } from "../../helpers/services/useRequest";
import { useEffect } from "react";

// ─── Types matching API contracts ────────────────────────────────────────────

/**
 * GET /api/v1/predictions/current
 * → { nextHungerAt, hoursUntilHungry, confidence, generatedAt, basedOnMeals }
 */
export interface PredictionResponse {
  nextHungerAt: string;
  hoursUntilHungry: number;
  confidence: number;
  generatedAt?: string;
  basedOnMeals?: number;
}

/**
 * POST /api/v1/predictions/refresh
 * → { nextHungerAt, hoursUntilHungry, confidence }
 */
export interface PredictionRefreshResponse {
  nextHungerAt: string;
  hoursUntilHungry: number;
  confidence: number;
}

/**
 * POST /api/v1/predictions/feedback
 * → payload: { hungerLevel, ratedAt }
 * → response: { success: true }
 */
export interface PredictionFeedbackPayload {
  hungerLevel: number;
  ratedAt: string;
}

/**
 * GET /api/v1/predictions/history?days=N
 * → { predictions: [...], avgAccuracyMinutes }
 */
export interface PredictionHistoryEntry {
  predictedAt: string;
  nextHungerAt: string;
  actualHungerAt: string;
  accuracyMinutes: number;
  confidence: number;
}

export interface PredictionHistoryResponse {
  predictions: PredictionHistoryEntry[];
  avgAccuracyMinutes: number;
}

// ─── GET: Current prediction (hook) ─────────────────────────────────────────

/**
 * usePrediction()
 * → GET /api/v1/predictions/current
 * → Auto-refreshes every 5 minutes
 */
export const usePrediction = (
  onPredictionUpdate?: (data: PredictionResponse) => void,
) => {
  const result = useRequest("/api/v1/predictions/current", {
    refreshInterval: 300000,
    initialValue: null,
  });

  useEffect(() => {
    if (result.data && onPredictionUpdate) {
      onPredictionUpdate(result.data as PredictionResponse);
    }
  }, [result.data, onPredictionUpdate]);

  return result;
};

// ─── GET: Current prediction (imperative) ───────────────────────────────────

export const fetchPrediction = async (): Promise<PredictionResponse> => {
  const response: any = await BaseRequest.get("/api/v1/predictions/current");
  return response;
};

// ─── POST: Refresh prediction ───────────────────────────────────────────────

/**
 * refreshPrediction()
 * → POST /api/v1/predictions/refresh
 * → Rate limited to once per 5 minutes
 * → Returns { nextHungerAt, hoursUntilHungry, confidence }
 */
export const refreshPrediction =
  async (): Promise<PredictionRefreshResponse> => {
    const response: any = await BaseRequest.post("/api/v1/predictions/refresh");
    return response;
  };

// ─── POST: Submit feedback ──────────────────────────────────────────────────

/**
 * submitPredictionFeedback(payload)
 * → POST /api/v1/predictions/feedback
 * → { hungerLevel, ratedAt }
 * → Returns { success: true }
 */
export const submitPredictionFeedback = async (
  payload: PredictionFeedbackPayload,
): Promise<{ success: boolean }> => {
  return await BaseRequest.post("/api/v1/predictions/feedback", payload);
};

// ─── GET: Prediction history ────────────────────────────────────────────────

/**
 * usePredictionHistory(days)
 * → GET /api/v1/predictions/history?days=N
 * → Returns { predictions: [...], avgAccuracyMinutes }
 */
export const usePredictionHistory = (days = 7) => {
  return useRequest("/api/v1/predictions/history", {
    params: { days },
    initialValue: { predictions: [], avgAccuracyMinutes: 0 },
  });
};
