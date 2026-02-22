import { create } from "zustand";

export type MealSize = "light" | "medium" | "heavy";

export interface MealLog {
  id: string;
  size: MealSize;
  timestamp: string;
  hungerLevelBefore?: number;
}

export interface WaterLog {
  id: string;
  amountMl: number;
  timestamp: string;
}

export interface Prediction {
  nextHungerAt: string; // ISO date string
  hoursUntilHungry: number;
  hydrationScore: number; // 0.0 – 1.0
  confidence: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

interface AppState {
  meals: MealLog[];
  waterLogs: WaterLog[];
  prediction: Prediction | null;
  chatMessages: ChatMessage[];
  isLoadingPrediction: boolean;
  isAiTyping: boolean;

  logMeal: (size: MealSize, hungerLevel?: number) => void;
  logWater: (amountMl: number) => void;
  fetchPrediction: () => Promise<void>;
  sendChatMessage: (content: string) => Promise<void>;

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
  chatMessages: [
    {
      id: genId(),
      role: "ai",
      content:
        "Hi! I'm your Companion Tracker AI. I'll help you stay on top of your nutrition and hydration. How are you feeling today? 👋",
      timestamp: new Date().toISOString(),
    },
  ],
  isLoadingPrediction: false,
  isAiTyping: false,

  logMeal: (size, hungerLevel) => {
    const newMeal: MealLog = {
      id: genId(),
      size,
      timestamp: new Date().toISOString(),
      hungerLevelBefore: hungerLevel,
    };
    set((s) => ({ meals: [...s.meals, newMeal] }));
    // Trigger prediction refresh
    get().fetchPrediction();
  },

  logWater: (amountMl) => {
    const newLog: WaterLog = {
      id: genId(),
      amountMl,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ waterLogs: [...s.waterLogs, newLog] }));
    get().fetchPrediction();
  },

  fetchPrediction: async () => {
    set({ isLoadingPrediction: true });
    // Simulate API latency
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

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const aiMsg: ChatMessage = {
      id: genId(),
      role: "ai",
      content:
        MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)],
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
    return get().prediction?.hydrationScore ?? 0.65;
  },
}));
