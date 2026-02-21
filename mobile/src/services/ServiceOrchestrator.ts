import MockSensorService from "./MockSensorService";
import MockWeatherService from "./MockWeatherService";
import MockSleepService from "./MockSleepService";
import MockHealthSyncService from "./MockHealthSyncService";
import { requestNotificationPermission } from "./notifications";

class ServiceOrchestrator {
  private isStarted = false;

  async start() {
    if (this.isStarted) return;
    this.isStarted = true;

    console.log("[ServiceOrchestrator] Starting simulation services...");

    try {
      // 0. Request notification permissions
      await requestNotificationPermission();
    } catch (error) {
      console.warn(
        "[ServiceOrchestrator] Failed to request permissions:",
        error,
      );
    }

    // 1. Check for initial sync
    // Using dynamic require to avoid circular dependency / initialization issues
    try {
      const { useAppStore } = require("../store/useAppStore");
      const historicalData = useAppStore.getState().historicalData;

      if (!historicalData || !historicalData.isSynced) {
        await MockHealthSyncService.performInitialSync();
      }
    } catch (error) {
      console.error(
        "[ServiceOrchestrator] Error during initial sync check:",
        error,
      );
    }

    // 2. Start ongoing periodic services
    MockSensorService.start();
    MockWeatherService.start();
    MockSleepService.generateLastNightSleep(); // Run once on morning boot
  }

  stop() {
    MockSensorService.stop();
    MockWeatherService.stop();
    this.isStarted = false;
  }
}

export default new ServiceOrchestrator();
