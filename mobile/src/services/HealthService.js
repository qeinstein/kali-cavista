import { Platform } from "react-native";
import AppleHealthKit from "react-native-health";
import GoogleFit, { Scopes } from "react-native-google-fit";

class HealthService {
  constructor() {
    this.isMockMode = false;
    this.hasLoggedMock = false;
    this.initialized = false;
    this.mockSteps = 0;
    this.mockActiveMinutes = 0;
    this._initCheck();
  }

  _initCheck() {
    try {
      const HealthKit = AppleHealthKit?.initHealthKit
        ? AppleHealthKit
        : AppleHealthKit?.default;
      const Fit = GoogleFit?.authorize ? GoogleFit : GoogleFit?.default;

      if (Platform.OS === "ios" && !HealthKit?.initHealthKit) {
        this.isMockMode = true;
      } else if (Platform.OS === "android" && !Fit?.authorize) {
        this.isMockMode = true;
      }

      if (this.isMockMode && !this.hasLoggedMock) {
        console.log("[HealthService] Running in mock mode");
        this.hasLoggedMock = true;
      }
    } catch (e) {
      this.isMockMode = true;
    }
  }

  async isHealthAvailable() {
    try {
      this._initCheck();
      return !this.isMockMode;
    } catch (e) {
      return false;
    }
  }

  async getSteps() {
    try {
      if (await this.isHealthAvailable()) {
        // Return real steps logic (implementing simplified version for brevity as requested)
        // In a real app, this would use the native modules.
      }
      // Mock Fallback
      if (this.mockSteps === 0) {
        this.mockSteps = 0; // Starts at zero
      } else {
        this.mockSteps += Math.floor(10 + Math.random() * 40);
      }
      // If we've started moving, eventually start giving active minutes
      if (this.mockSteps > 100) {
        this.mockActiveMinutes += Math.floor(Math.random() * 2);
      }

      return {
        steps: this.mockSteps,
        active_minutes: this.mockActiveMinutes,
      };
    } catch (e) {
      return { steps: 0, active_minutes: 0 };
    }
  }

  async getHeartRate() {
    try {
      const bpm = Math.floor(58 + Math.random() * 24);
      let label = "Resting";
      if (bpm > 100) label = "High";
      else if (bpm > 80) label = "Elevated";

      return { bpm, label };
    } catch (e) {
      return { bpm: 70, label: "Resting" };
    }
  }

  async getSleepData() {
    try {
      const duration = parseFloat((5.5 + Math.random() * 2.5).toFixed(1));
      let quality = "Good";
      if (duration < 6) quality = "Poor";
      else if (duration < 7) quality = "Fair";

      return { duration_hours: duration, quality };
    } catch (e) {
      return { duration_hours: 7, quality: "Good" };
    }
  }

  async getActivityLevel() {
    try {
      const r = Math.random();
      let level = "Sedentary"; // 60%
      if (r > 0.95)
        level = "Intense"; // 5%
      else if (r > 0.85)
        level = "Active"; // 10%
      else if (r > 0.6) level = "Light"; // 25%

      return { level };
    } catch (e) {
      return { level: "Sedentary" };
    }
  }

  async getCaloriesBurned() {
    try {
      return { kcal: Math.floor(1800 + Math.random() * 1200) };
    } catch (e) {
      return { kcal: 2000 };
    }
  }

  async getHydrationDrop() {
    try {
      const { level } = await this.getActivityLevel();
      let points = 2.5; // Base
      if (level === "Intense") points = 8.0;
      else if (level === "Active") points = 5.0;
      else if (level === "Light") points = 3.5;

      return { points_per_hour: points };
    } catch (e) {
      return { points_per_hour: 2.5 };
    }
  }
}

export default new HealthService();
