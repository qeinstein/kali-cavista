import { useAppStore } from "../store/useAppStore";
import {
  HistoricalData,
  MealLog,
  WaterLog,
  HeartRateLog,
} from "../types/health";

class MockHealthSyncService {
  async performInitialSync() {
    const state = useAppStore.getState();
    state.setHistoricalSyncing(true);

    // Simulate 0.5s loading in background
    await new Promise((r) => setTimeout(r, 500));

    const historicalData: HistoricalData = {
      steps: Array.from(
        { length: 7 },
        () => Math.floor(Math.random() * 8001) + 3000,
      ),
      calories: [],
      sleep: Array.from(
        { length: 7 },
        () => Math.round((5.0 + Math.random() * 3.5) * 10) / 10,
      ),
      heartRate: Array.from(
        { length: 14 },
        () => Math.floor(Math.random() * 25) + 58,
      ),
      isSynced: true,
    };

    historicalData.calories = historicalData.steps.map((s) =>
      Math.round(s * 0.04),
    );

    state.setHistoricalData(historicalData);
    state.setHistoricalSyncing(false);

    // Pre-populate some logs for UI realism if empty
    this.populateHistoricalLogs();
  }

  private populateHistoricalLogs() {
    const state = useAppStore.getState();

    // Only populate if empty (avoid duplicate runs)
    if (state.meals.length > 5) return;

    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);

      // 2-4 meals per day
      const mealCount = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < mealCount; j++) {
        const mealTime = new Date(date);
        mealTime.setHours(8 + j * 4, Math.floor(Math.random() * 60));
        // We bypass the store action to allow historical timestamps
        useAppStore.setState((s) => ({
          meals: [
            ...s.meals,
            {
              id: Math.random().toString(36).slice(2),
              size: j === 0 ? "light" : "medium",
              timestamp: mealTime.toISOString(),
            } as MealLog,
          ],
        }));
      }
    }
  }
}

export default new MockHealthSyncService();
