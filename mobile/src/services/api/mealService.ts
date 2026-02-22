import BaseRequest from "../../helpers/services";
import { useRequest } from "../../helpers/services/useRequest";
import { useState } from "react";
import { parseNetworkError } from "../../helpers/services";
// ─── Types matching API contracts ────────────────────────────────────────────

export type MealSize = "light" | "medium" | "heavy";

export interface MealLogPayload {
  mealSize: MealSize;
  hungerLevelBefore?: number;
  notes?: string;
}

export interface MealPrediction {
  nextHungerAt: string;
  confidence: number;
}

export interface MealLogResponse {
  success: boolean;
  mealId: string;
  prediction: MealPrediction;
}

/** Meal record as returned by the API (uses loggedAt, not timestamp) */
export interface ApiMealRecord {
  id: string;
  mealSize: MealSize;
  loggedAt: string;
  hungerLevelBefore?: number;
}

export interface MealHistoryResponse {
  meals: ApiMealRecord[];
  total: number;
}

export interface TodayMealsResponse {
  meals: ApiMealRecord[];
  count: number;
}

// ─── GET: Today's meals ─────────────────────────────────────────────────────

/**
 * useTodayMeals()
 * → GET /api/v1/meals/today
 * → Returns { meals: [...], count }
 * → Auto-refreshes every 5 minutes
 */
export const useTodayMeals = () => {
  return useRequest("/api/v1/meals/today", {
    refreshInterval: 300000,
    initialValue: { meals: [], count: 0 },
  });
};

export const fetchTodayMeals = async () => {
  return BaseRequest.get("/api/v1/meals/today");
};

// ─── GET: Meal history with pagination ──────────────────────────────────────

/**
 * useMealHistory(limit, offset, date?)
 * → GET /api/v1/meals/history?limit=N&offset=O&date=YYYY-MM-DD
 * → Returns { meals: [...], total }
 */
export const useMealHistory = (limit = 30, offset = 0, date?: string) => {
  const params: Record<string, any> = { limit, offset };
  if (date) params.date = date;

  return useRequest("/api/v1/meals/history", {
    params,
    initialValue: { meals: [], total: 0 },
  });
};

// ─── POST: Log a meal ───────────────────────────────────────────────────────

/**
 * logMeal(payload, onRefreshTodayMeals?)
 * → POST /api/v1/meals/log  { mealSize, hungerLevelBefore?, notes? }
 * → Returns { success, mealId, prediction: { nextHungerAt, confidence } }
 */
export const logMeal = async (
  payload: MealLogPayload,
  onRefreshTodayMeals?: () => void,
): Promise<MealLogResponse> => {
  const response: any = await BaseRequest.post("/api/v1/meals/log", payload);

  // Refresh today's meals list
  if (onRefreshTodayMeals) onRefreshTodayMeals();

  return response;
};

// ─── DELETE: Remove a meal ──────────────────────────────────────────────────

/**
 * deleteMeal(id, onRefreshTodayMeals?)
 * → DELETE /api/v1/meals/{meal_id}
 * → Returns { success: true }
 */
export const deleteMeal = async (
  id: string,
  onRefreshTodayMeals?: () => void,
) => {
  const response: any = await BaseRequest.delete(`/api/v1/meals/${id}`);
  if (onRefreshTodayMeals) onRefreshTodayMeals();
  return response;
};

// ─── useMealService Hook ────────────────────────────────────────────────────

export const useMealService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const todayMeals = useTodayMeals();

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

  const handleLogMeal = async (payload: MealLogPayload) => {
    return handleAction(() => logMeal(payload, todayMeals.onRefresh));
  };

  const handleDeleteMeal = async (id: string) => {
    return handleAction(() => deleteMeal(id, todayMeals.onRefresh));
  };

  return {
    isLoading,
    error,
    todayMeals,
    logMeal: handleLogMeal,
    deleteMeal: handleDeleteMeal,
  };
};
