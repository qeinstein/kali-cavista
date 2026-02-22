export type MealSize = "light" | "medium" | "heavy";
export type ActivityLevel = "Sedentary" | "Light" | "Active" | "Intense";
export type HeartRateStatus = "Resting" | "Elevated" | "High";

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

export interface HeartRateLog {
  id: string;
  bpm: number;
  status: HeartRateStatus;
  timestamp: string;
}

export interface Prediction {
  nextHungerAt: string;
  hoursUntilHungry: number;
  hydrationScore: number;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

export interface HealthDataPayload {
  userId: string;
  steps?: number;
  heartRate?: number;
  activeMinutes?: number;
  timestamp: string;
}

export interface MealPayload {
  userId: string;
  mealSize: MealSize;
  hungerLevelBefore?: number;
  notes?: string;
}

export interface WaterPayload {
  userId: string;
  amountMl: number;
}

// ─── Simulation Types ─────────────────────────────────────────────────────────

export interface WeatherContext {
  temp: number;
  humidity: number;
  uvIndex: number;
  city: string;
  multiplier: number;
  lastUpdate: string;
}

export interface SleepLog {
  id: string;
  durationHours: number;
  quality: "Poor" | "Fair" | "Good";
  bedtime: string;
  wakeTime: string;
  timestamp: string;
}

export interface WellbeingState {
  energy: number; // 1-5
  stress: number; // 1-5
  mood: string;
  lastCheckIn: string;
}

export interface HistoricalData {
  steps: number[];
  calories: number[];
  sleep: number[];
  heartRate: number[];
  isSynced: boolean;
}
