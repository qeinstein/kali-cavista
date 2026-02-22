import { create } from "zustand";
import {
  logMeal as apiLogMeal,
  fetchTodayMeals,
} from "../services/api/mealService";
import {
  logWater as apiLogWater,
  fetchTodayWaterLogs,
} from "../services/api/hydrationService";
import { fetchPrediction as apiFetchPrediction } from "../services/api/predictionService";
import { onReloadData } from "../helpers/services/useRequest";
import {
  sendMessage as apiSendMessage,
  clearChatHistory as apiClearChatHistory,
  fetchChatHistory as apiFetchChatHistory,
} from "../services/api/chatService";
import { syncHealthData as apiSyncHealthData } from "../services/api/healthService";
import {
  MealLog,
  WaterLog,
  HeartRateLog,
  Prediction,
  ChatMessage,
  ActivityLevel,
  MealSize as HeartRateMealSize,
  WeatherContext,
  SleepLog,
  WellbeingState,
  HistoricalData,
} from "../types/health";

export type MealSize = HeartRateMealSize;

export {
  MealLog,
  WaterLog,
  HeartRateLog,
  Prediction,
  ChatMessage,
  ActivityLevel,
};

interface AppState {
  meals: MealLog[];
  waterLogs: WaterLog[];
  prediction: Prediction | null;
  chatMessages: ChatMessage[];
  hydrationScore: number;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  lastDailyCheckInDate: string | null;
  setLastDailyCheckInDate: (date: string) => void;
  isLoadingPrediction: boolean;
  isSplashVisible: boolean;
  isAiTyping: boolean;
  conversationId: string | null;
  themePreference: "system" | "light" | "dark";
  setThemePreference: (pref: "system" | "light" | "dark") => void;

  // Heart Rate state
  heartRateLogs: HeartRateLog[];
  lastHeartRate: number | null;
  heartRateStatus: "Resting" | "Elevated" | "High" | null;

  // Simulation state
  weather: WeatherContext | null;
  sleepLogs: SleepLog[];
  wellbeing: WellbeingState | null;
  historicalData: HistoricalData | null;
  isHistoricalSyncing: boolean;

  // Activity state
  steps: number;
  activeMinutes: number;
  activityLevel: ActivityLevel;
  lastActivityUpdate: string;
  lastWaterTimestamp: string | null;

  logMeal: (size: "light" | "medium" | "heavy", hungerLevel?: number) => void;
  logWater: (amountMl: number) => void;
  fetchTodayData: () => Promise<void>;
  fetchPrediction: () => Promise<void>;
  fetchChatHistory: () => Promise<void>;
  sendChatMessage: (content: string) => Promise<void>;
  clearChat: () => Promise<void>;
  setSplashVisible: (visible: boolean) => void;

  // Activity actions
  updateActivity: (
    steps: number,
    level: ActivityLevel,
    activeMinutes: number,
  ) => void;
  depleteHydration: () => void;
  addHeartRateReading: (
    bpm: number,
    status: "Resting" | "Elevated" | "High",
  ) => void;

  // Simulation actions
  updateWeather: (weather: WeatherContext) => void;
  addSleepLog: (log: SleepLog) => void;
  updateWellbeing: (energy: number, stress: number, mood: string) => void;
  setHistoricalSyncing: (syncing: boolean) => void;
  setHistoricalData: (data: HistoricalData) => void;

  // Derived helpers
  getTodayMeals: () => MealLog[];
  getTodayWaterMl: () => number;
  getHydrationScore: () => number;
}

const genId = () => Math.random().toString(36).slice(2);

const getMockPrediction = (
  meals: MealLog[],
  waterLogs: WaterLog[],
): Prediction => {
  const lastMeal = meals[meals.length - 1];
  const sizeToHours: Record<MealSize, number> = {
    light: 2.5,
    medium: 3.5,
    heavy: 5,
  };
  const hoursUntil = lastMeal
    ? Math.max(0.5, sizeToHours[lastMeal.size] - 0.5)
    : 3.5;
  const nextHunger = new Date(
    Date.now() + hoursUntil * 3600 * 1000,
  ).toISOString();

  const totalWater = waterLogs
    .filter((w) =>
      w.timestamp.startsWith(new Date().toISOString().slice(0, 10)),
    )
    .reduce((s, w) => s + w.amountMl, 0);
  const hydration = Math.min(1, totalWater / 2000);

  return {
    nextHungerAt: nextHunger,
    hoursUntilHungry: hoursUntil,
    hydrationScore: hydration,
    confidence: 0.82,
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  meals: [],
  waterLogs: [],
  prediction: null,
  hydrationScore: 68,
  chatMessages: [],
  hasCompletedOnboarding: false,
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  lastDailyCheckInDate: null,
  setLastDailyCheckInDate: (date) => set({ lastDailyCheckInDate: date }),
  isLoadingPrediction: false,
  isSplashVisible: true,
  isAiTyping: false,
  conversationId: null,
  themePreference: "system",
  setThemePreference: (pref) => set({ themePreference: pref }),

  // Heart Rate state
  heartRateLogs: [],
  lastHeartRate: null,
  heartRateStatus: null,

  // Simulation state
  weather: null,
  sleepLogs: [],
  wellbeing: null,
  historicalData: null,
  isHistoricalSyncing: false,

  // Activity state
  steps: 0,
  activeMinutes: 0,
  activityLevel: "Sedentary",
  lastActivityUpdate: new Date().toISOString(),
  lastWaterTimestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),

  updateActivity: (steps, level, activeMinutes) => {
    const prevState = get();

    // Nudge for Intense activity transition
    if (level === "Intense" && prevState.activityLevel !== "Intense") {
      const nudgeMsg: ChatMessage = {
        id: genId(),
        role: "ai",
        content: "You're active right now — drink water soon. 💧",
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        chatMessages: [...s.chatMessages, nudgeMsg],
      }));
    }

    set({
      steps,
      activityLevel: level,
      activeMinutes,
      lastActivityUpdate: new Date().toISOString(),
    });
  },

  depleteHydration: () => {
    set((s) => {
      // Base depletion: 1% every 10 mins (0.1% per min)
      // Intense depletion: 2% every 10 mins (0.2% per min - increased by user request to ~30% boost)
      // user requested: "Active/Intense increase by 30%" -> so if rest is 0.1, active is 0.13.
      // but users also said: "At rest: loses 4 points per hour (0.066 per min)"
      // Let's stick to the granular specs:
      // At rest: 4 pts/hr (0.0667)
      // Active: 6 pts/hr (0.1)
      // Hot weather (>33C): +2 pts/hr (0.0333)

      let ratePerHour =
        s.activityLevel === "Intense" || s.activityLevel === "Active" ? 6 : 4;
      if (s.weather && s.weather.temp > 33) {
        ratePerHour += 2;
      }

      const ratePerMin = ratePerHour / 60;

      return {
        hydrationScore: Math.max(0, s.hydrationScore - ratePerMin),
      };
    });
  },

  updateWeather: (weather) => set({ weather }),
  addSleepLog: (log) => set((s) => ({ sleepLogs: [log, ...s.sleepLogs] })),
  updateWellbeing: (energy, stress, mood) =>
    set({
      wellbeing: {
        energy,
        stress,
        mood,
        lastCheckIn: new Date().toISOString(),
      },
    }),
  setHistoricalSyncing: (syncing) => set({ isHistoricalSyncing: syncing }),
  setHistoricalData: (data) => set({ historicalData: data }),

  addHeartRateReading: (bpm, status) => {
    const newLog: HeartRateLog = {
      id: genId(),
      bpm,
      status,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      heartRateLogs: [newLog, ...s.heartRateLogs],
      lastHeartRate: bpm,
      heartRateStatus: status,
    }));

    // Fire API call asynchronously to log heart rate to the server
    apiSyncHealthData([
      {
        snapshotAt: newLog.timestamp,
        stepsCount: get().steps,
        activeCalories:
          get().activityLevel === "Intense" ? Math.round(bpm * 0.1) : 0,
        heartRate: bpm,
      },
    ]).catch((err) =>
      console.warn("[AppStore] Failed to sync pulse check to backend", err),
    );
  },

  logMeal: (size, hungerLevel) => {
    // Optimistic local update
    const newMeal: MealLog = {
      id: genId(),
      size,
      timestamp: new Date().toISOString(),
      hungerLevelBefore: hungerLevel,
    };
    set((s) => ({
      meals: [...s.meals, newMeal],
    }));

    // Fire real API call in background
    apiLogMeal({ mealSize: size, hungerLevelBefore: hungerLevel })
      .then((res) => {
        if (res?.prediction) {
          set({
            prediction: {
              nextHungerAt: res.prediction.nextHungerAt,
              hoursUntilHungry: Math.max(
                0,
                (new Date(res.prediction.nextHungerAt).getTime() - Date.now()) /
                  3600000,
              ),
              hydrationScore: get().hydrationScore / 100,
              confidence: res.prediction.confidence,
            },
          });
        }
        onReloadData().catch(console.warn);
      })
      .catch((err) => {
        console.warn(
          "[AppStore] API logMeal failed, using local fallback:",
          err,
        );
        // Local fallback prediction
        set({
          prediction: {
            nextHungerAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
            hoursUntilHungry: 4,
            hydrationScore: get().hydrationScore / 100,
            confidence: 0.88,
          },
        });
      });
  },

  logWater: (amountMl) => {
    // Optimistic local update
    const newLog: WaterLog = {
      id: genId(),
      amountMl,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      waterLogs: [...s.waterLogs, newLog],
      hydrationScore: Math.min(100, s.hydrationScore + 10),
      lastWaterTimestamp: newLog.timestamp,
    }));

    // Fire real API call in background
    apiLogWater(amountMl)
      .then((res) => {
        // Sync to server-returned hydration score
        if (res?.hydrationScore != null) {
          set({ hydrationScore: res.hydrationScore });
        }
        onReloadData().catch(console.warn);
      })
      .catch((err) => {
        console.warn(
          "[AppStore] API logWater failed, keeping local state:",
          err,
        );
      });
  },

  fetchTodayData: async () => {
    try {
      const [mealRes, waterRes] = await Promise.all([
        fetchTodayMeals(),
        fetchTodayWaterLogs(),
      ]);

      const mealsData: any = mealRes;
      const meals = Array.isArray(mealsData?.data?.meals)
        ? mealsData.data.meals.map((m: any) => ({
            id: String(m.id),
            size: m.mealSize || "medium",
            timestamp: m.loggedAt || new Date().toISOString(),
            hungerLevelBefore: m.hungerLevelBefore,
          }))
        : [];

      const waterData: any = waterRes;
      const waterLogs = Array.isArray(waterData?.data?.logs)
        ? waterData.data.logs.map((w: any) => ({
            id: String(w.id),
            amountMl: w.amountMl || 0,
            timestamp: w.loggedAt || new Date().toISOString(),
          }))
        : [];

      set({ meals, waterLogs });
    } catch (err) {
      console.warn("[AppStore] Failed to fetch existing generic day data", err);
    }
  },

  fetchPrediction: async () => {
    set({ isLoadingPrediction: true });
    try {
      await apiFetchPrediction();
    } catch (err) {
      console.warn(
        "[AppStore] API fetchPrediction failed, using local fallback:",
        err,
      );
      // Local fallback
      const { meals, waterLogs } = get();
      const prediction = getMockPrediction(meals, waterLogs);
      set({ prediction, isLoadingPrediction: false });
    }
  },

  fetchChatHistory: async () => {
    try {
      const response = await apiFetchChatHistory();
      if (response && response.messages) {
        // Map API response to our local ChatMessage format
        const formattedMessages: ChatMessage[] = response.messages.map(
          (msg: any) => ({
            id: genId(), // Using genId since history might not provide unique IDs per message
            role: msg.role === "assistant" || msg.role === "ai" ? "ai" : "user",
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString(),
          }),
        );

        // Ensure messages are sorted oldest to newest if needed, though usually history is fetched
        // assuming standard chronological order for chat rendering.
        set({ chatMessages: formattedMessages });
      }
    } catch (err) {
      console.warn("[AppStore] API fetchChatHistory failed:", err);
    }
  },

  sendChatMessage: async (content: string) => {
    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      chatMessages: [...s.chatMessages, userMsg],
      isAiTyping: true,
    }));

    try {
      const response = await apiSendMessage({
        message: content,
        conversationId: get().conversationId || undefined,
      });

      const aiMsg: ChatMessage = {
        id: genId(),
        role: "ai",
        content: response.reply,
        timestamp: new Date().toISOString(),
      };

      set((s) => ({
        chatMessages: [...s.chatMessages, aiMsg],
        isAiTyping: false,
        conversationId: response.conversationId || s.conversationId,
      }));
    } catch (err) {
      console.warn("[AppStore] Chat API failed:", err);
      // Optional: Add a system message letting the user know it failed
      const errorMsg: ChatMessage = {
        id: genId(),
        role: "ai",
        content:
          "Sorry, I am having trouble connecting to my servers right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        chatMessages: [...s.chatMessages, errorMsg],
        isAiTyping: false,
      }));
    }
  },

  clearChat: async () => {
    try {
      await apiClearChatHistory();
    } catch (err) {
      console.warn("[AppStore] Clear chat API failed:", err);
    }
    set({ chatMessages: [], conversationId: null });
  },

  getTodayMeals: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().meals.filter((m) => m.timestamp.startsWith(today));
  },

  getTodayWaterMl: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get()
      .waterLogs.filter((w) => w.timestamp.startsWith(today))
      .reduce((s, w) => s + w.amountMl, 0);
  },

  getHydrationScore: () => {
    return get().hydrationScore / 100;
  },

  setSplashVisible: (visible) => set({ isSplashVisible: visible }),
}));
