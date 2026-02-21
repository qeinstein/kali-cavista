import { create } from "zustand";
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
  isLoadingPrediction: boolean;
  isSplashVisible: boolean;
  isAiTyping: boolean;

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
  fetchPrediction: () => Promise<void>;
  sendChatMessage: (content: string) => Promise<void>;
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

const MOCK_AI_RESPONSES = [
  "Great choice! A medium meal will keep you fueled for about 3-4 hours. 🍽️",
  "Your hydration looks good today! Keep it up by drinking water every 90 minutes. 💧",
  "Based on your patterns, you tend to get hungry around 1 PM. Consider prepping a healthy snack! 🥗",
  "You've been consistent with your water intake this week — that's excellent for cognitive performance! 🧠",
  "Your meal timing has improved by 23% this week. Small steps, big health wins! 🏆",
  "Hot tip: eating within 30 minutes of waking up can help stabilize your blood sugar all day. ☀️",
];

export const useAppStore = create<AppState>((set, get) => ({
  meals: [
    {
      id: genId(),
      size: "medium",
      timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
      hungerLevelBefore: 6,
    },
  ],
  waterLogs: [
    {
      id: genId(),
      amountMl: 500,
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: genId(),
      amountMl: 250,
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
  ],
  prediction: null,
  hydrationScore: 68,
  chatMessages: [
    {
      id: "ex-1-a",
      role: "user",
      content: "Why am I always tired in the afternoons?",
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "ex-1-b",
      role: "ai",
      content:
        "Looking at your logs, you tend to eat a light breakfast around 8 AM but skip or delay lunch past 2 PM on weekdays. The afternoon energy dip is likely a combination of low blood sugar and mild dehydration — you average only 600ml of water by 3 PM.",
      timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 5000).toISOString(),
    },
    {
      id: "ex-2-a",
      role: "user",
      content: "Can you help me fix my water goal?",
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: "ex-2-b",
      role: "ai",
      content:
        "Of course! Based on your activity level, I've set a baseline of 2.5L. Would you like me to send reminders if you're behind by 2 PM?",
      timestamp: new Date(Date.now() - 12 * 3600 * 1000 + 8000).toISOString(),
    },
  ],
  isLoadingPrediction: false,
  isSplashVisible: true,
  isAiTyping: false,

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
  },

  logMeal: (size, hungerLevel) => {
    const newMeal: MealLog = {
      id: genId(),
      size,
      timestamp: new Date().toISOString(),
      hungerLevelBefore: hungerLevel,
    };
    set((s) => ({
      meals: [...s.meals, newMeal],
      prediction: {
        nextHungerAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        hoursUntilHungry: 4,
        hydrationScore: s.hydrationScore / 100,
        confidence: 0.88,
      },
    }));
  },

  logWater: (amountMl) => {
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
  },

  fetchPrediction: async () => {
    set({ isLoadingPrediction: true });
    await new Promise((r) => setTimeout(r, 600));
    const { meals, waterLogs } = get();
    const prediction = getMockPrediction(meals, waterLogs);
    set({ prediction, isLoadingPrediction: false });
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

    await new Promise((r) => setTimeout(r, 2000));

    const hydro = get().hydrationScore;
    let aiContent = "";

    if (content.toLowerCase().includes("tired")) {
      aiContent =
        "I noticed your hydration is a bit low (" +
        hydro +
        "%). Dehydration often causes that afternoon slump. Try drinking 2 glasses of water now! 💧";
    } else if (hydro < 50) {
      aiContent =
        "I've analyzed your recent logs. You're looking steady, but your hydration is quite low (" +
        hydro +
        "%). Definitely time for some water! 🌿";
    } else {
      aiContent =
        MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)];
    }

    const aiMsg: ChatMessage = {
      id: genId(),
      role: "ai",
      content: aiContent,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      chatMessages: [...s.chatMessages, aiMsg],
      isAiTyping: false,
    }));
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
