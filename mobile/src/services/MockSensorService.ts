import { AppState, AppStateStatus } from "react-native";
import { useAppStore } from "../store/useAppStore";
import { ActivityLevel } from "../types/health";

class MockSensorService {
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: any = null;

  start() {
    // Initial steps: 2000 - 4000
    const initialSteps = Math.floor(Math.random() * 2001) + 2000;
    const currentSteps = useAppStore.getState().steps;

    if (currentSteps === 0) {
      useAppStore
        .getState()
        .updateActivity(initialSteps, this.getCurrentActivityLevel(), 0);
    }

    this.setupIntervals();
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange,
    );
  }

  stop() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    if (this.appStateSubscription) this.appStateSubscription.remove();
  }

  private setupIntervals() {
    if (this.updateInterval) clearInterval(this.updateInterval);

    // Every 60 seconds update steps and check activity
    this.updateInterval = setInterval(() => {
      this.tick();
    }, 60000);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      this.setupIntervals();
      this.tick(); // Immediate update on resume
    } else {
      if (this.updateInterval) clearInterval(this.updateInterval);
    }
  };

  private tick() {
    const state = useAppStore.getState();

    // Steps: +20-80
    const stepIncrement = Math.floor(Math.random() * 61) + 20;
    const newSteps = state.steps + stepIncrement;

    // Active Minutes: +1 every 3 ticks (roughly 3 mins)
    // We can use a simple counter or just check time.
    // Let's use a modulus on the minute? Or just store it in state.
    const newActiveMinutes =
      state.activeMinutes + (Math.random() > 0.66 ? 1 : 0);

    const newLevel = this.getCurrentActivityLevel();

    state.updateActivity(newSteps, newLevel, newActiveMinutes);
  }

  private getCurrentActivityLevel(): ActivityLevel {
    const hour = new Date().getHours();

    // Active between 7–9AM and 5–7PM
    if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
      return "Active";
    }

    // Otherwise rotate between Sedentary and Light for realism
    return Math.random() > 0.7 ? "Light" : "Sedentary";
  }
}

export default new MockSensorService();
