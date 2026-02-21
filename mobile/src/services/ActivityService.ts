import { Accelerometer } from "expo-sensors";
import { useAppStore, ActivityLevel } from "../store/useAppStore";
import HealthService from "./HealthService";

class ActivityService {
  private subscription: any = null;
  private lastX = 0;
  private lastY = 0;
  private lastZ = 0;
  private movementBuffer: number[] = [];
  private updateInterval: any = null;
  private hydrationInterval: any = null;

  async start() {
    const { status } = await Accelerometer.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("[ActivityService] Accelerometer permission denied");
      return;
    }

    Accelerometer.setUpdateInterval(500);
    this.subscription = Accelerometer.addListener((data) => {
      const delta =
        Math.abs(data.x - this.lastX) +
        Math.abs(data.y - this.lastY) +
        Math.abs(data.z - this.lastZ);
      this.movementBuffer.push(delta);
      if (this.movementBuffer.length > 20) this.movementBuffer.shift();

      this.lastX = data.x;
      this.lastY = data.y;
      this.lastZ = data.z;
    });

    // Update store every 60s
    this.updateInterval = setInterval(() => this.tick(), 60000);

    // Deplete hydration every minute
    this.hydrationInterval = setInterval(() => {
      useAppStore.getState().depleteHydration();
    }, 60000);

    // Initial tick
    this.tick();
  }

  stop() {
    this.subscription?.remove();
    clearInterval(this.updateInterval);
    clearInterval(this.hydrationInterval);
  }

  private async tick() {
    try {
      const avgMovement =
        this.movementBuffer.reduce((a, b) => a + b, 0) /
        (this.movementBuffer.length || 1);

      let level: ActivityLevel = "Sedentary";
      if (avgMovement > 1.5) level = "Intense";
      else if (avgMovement > 0.8) level = "Active";
      else if (avgMovement > 0.2) level = "Light";

      // Fetch steps and active minutes from HealthService
      const { steps, active_minutes } = await HealthService.getSteps();

      useAppStore.getState().updateActivity(steps, level, active_minutes);
    } catch (e) {
      console.warn("[ActivityService] Error in tick:", e);
    }
  }
}

export default new ActivityService();
