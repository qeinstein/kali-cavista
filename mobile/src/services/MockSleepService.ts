import { useAppStore } from "../store/useAppStore";
import { SleepLog } from "../types/health";

class MockSleepService {
  generateLastNightSleep() {
    // Bedtime: yesterday between 10PM and 1AM
    const now = new Date();
    const bedtimeHour =
      Math.random() > 0.5
        ? 22 + Math.floor(Math.random() * 2)
        : Math.floor(Math.random() * 2);
    // Simplified: let's just use a fixed date for last night
    const bedtime = new Date();
    bedtime.setDate(bedtime.getDate() - 1);
    bedtime.setHours(bedtimeHour, Math.floor(Math.random() * 60), 0);

    const durationHours = Math.round((5.0 + Math.random() * 3.5) * 10) / 10;

    const wakeTime = new Date(bedtime.getTime() + durationHours * 3600 * 1000);

    const quality =
      durationHours < 6 ? "Poor" : durationHours < 7 ? "Fair" : "Good";

    const log: SleepLog = {
      id: Math.random().toString(36).slice(2),
      durationHours,
      quality,
      bedtime: bedtime.toISOString(),
      wakeTime: wakeTime.toISOString(),
      timestamp: new Date().toISOString(),
    };

    useAppStore.getState().addSleepLog(log);

    // Impact logic
    if (durationHours < 6) {
      this.applySleepImpact();
    }
  }

  private applySleepImpact() {
    const state = useAppStore.getState();
    const currentPrediction = state.prediction;

    if (currentPrediction) {
      // Subtract 45 minutes from next hunger prediction time
      const nextTime = new Date(currentPrediction.nextHungerAt);
      nextTime.setMinutes(nextTime.getMinutes() - 45);

      // Update prediction in store if possible (currently store has simplistic fetch)
      // For mock, we'll just log an AI nudge or impact state
      console.log("[SleepService] Poor sleep impact: -45m hunger window");
    }
  }
}

export default new MockSleepService();
