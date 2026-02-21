// ─── API Service ─────────────────────────────────────────────────────────────
// All endpoints mirror the real backend at http://localhost:3000/api
// When the backend is running, set USE_MOCK = false and fill in BASE_URL.

const USE_MOCK = true;
const BASE_URL = "http://localhost:3000/api";

// ─── Types ────────────────────────────────────────────────────────────────────

import {
  WaterLog,
  HeartRateLog,
  HealthDataPayload,
  WaterPayload,
  MealPayload,
  Prediction,
  ActivityLevel,
  MealSize,
  MealLog, // Added MealLog
  ChatMessage, // Added ChatMessage
} from "../types/health";

export interface PredictionResponse {
  nextHungerAt: string;
  hoursUntilHungry: number;
  hydrationScore: number;
  confidence: number;
}

export interface InsightResponse {
  title: string;
  body: string;
  type: "warning" | "info" | "success";
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface SurveyPayload {
  mealsPerDay: string;
  activityLevel: string;
  waterGoal: string;
}

export interface NotificationSettings {
  hungerAlerts: boolean;
  hungerAlertOffset: number;
  hydrationAlerts: boolean;
  hydrationThreshold: number;
  patternNudges: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ─── Mock Implementations  ────────────────────────────────────────────────────

const mockDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const syncHealthData = async (payload: HealthDataPayload) => {
  if (USE_MOCK) {
    await mockDelay();
    console.log("[API Mock] Synchronized health data:", payload);
    return { success: true };
  }
  return request("/health-data/sync", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const logMeal = async (payload: MealPayload) => {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true };
  }
  return request("/meals/log", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getMealHistory = async (userId: string) => {
  if (USE_MOCK) {
    await mockDelay();
    return [];
  }
  return request(`/meals/history/${userId}`);
};

export const logWater = async (payload: WaterPayload) => {
  if (USE_MOCK) {
    await mockDelay();
    return { success: true };
  }
  return request("/hydration/log", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getHydrationScore = async (
  userId: string,
): Promise<{ score: number }> => {
  if (USE_MOCK) {
    await mockDelay();
    return { score: 0.72 };
  }
  return request(`/hydration/score/${userId}`);
};

export const fetchPredictions = async (
  userId: string,
): Promise<PredictionResponse> => {
  if (USE_MOCK) {
    await mockDelay(600);
    return {
      nextHungerAt: new Date(Date.now() + 2.5 * 3600 * 1000).toISOString(),
      hoursUntilHungry: 2.5,
      hydrationScore: 0.72,
      confidence: 0.82,
    };
  }
  return request(`/predictions/${userId}`);
};

export const getInsights = async (
  userId: string,
): Promise<InsightResponse[]> => {
  if (USE_MOCK) {
    await mockDelay();
    return [
      {
        title: "Lunch Skipping Pattern",
        body: "You skip lunch 3× per week. This correlates with your afternoon energy dips and overeating at dinner.",
        type: "warning",
        createdAt: new Date().toISOString(),
      },
      {
        title: "Hydration Improving",
        body: "Your average daily water intake rose 18% vs. last week. Keep it up during hot days!",
        type: "success",
        createdAt: new Date().toISOString(),
      },
      {
        title: "Late-Night Eating",
        body: "You logged meals after 10 PM on 4 of the last 7 days. Late meals can disrupt sleep quality.",
        type: "warning",
        createdAt: new Date().toISOString(),
      },
      {
        title: "Meal Consistency",
        body: "Your breakfast timing is very consistent (±15 min). This is a strong positive habit!",
        type: "success",
        createdAt: new Date().toISOString(),
      },
    ];
  }
  return request(`/insights/${userId}`);
};

export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    if (USE_MOCK) {
      await mockDelay();
      return {
        hungerAlerts: true,
        hungerAlertOffset: 30,
        hydrationAlerts: true,
        hydrationThreshold: 40,
        patternNudges: true,
      };
    }
    return request("/notifications/settings");
  };

export const updateNotificationSettings = async (
  settings: NotificationSettings,
): Promise<void> => {
  if (USE_MOCK) {
    await mockDelay(800);
    return;
  }
  return request("/notifications/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
};
