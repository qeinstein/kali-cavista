export interface HealthSteps {
  steps: number;
  active_minutes: number;
}

export interface HealthHeartRate {
  bpm: number;
  label: "Resting" | "Elevated" | "High";
}

export interface HealthSleepData {
  duration_hours: number;
  quality: "Poor" | "Fair" | "Good";
}

export interface HealthActivityLevel {
  level: "Sedentary" | "Light" | "Active" | "Intense";
}

export interface HealthCalories {
  kcal: number;
}

export interface HealthHydrationDrop {
  points_per_hour: number;
}

export interface HealthService {
  isHealthAvailable(): Promise<boolean>;
  getSteps(): Promise<HealthSteps>;
  getHeartRate(): Promise<HealthHeartRate>;
  getSleepData(): Promise<HealthSleepData>;
  getActivityLevel(): Promise<HealthActivityLevel>;
  getCaloriesBurned(): Promise<HealthCalories>;
  getHydrationDrop(): Promise<HealthHydrationDrop>;
}

declare const healthService: HealthService;
export default healthService;
