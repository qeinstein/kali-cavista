import { useAppStore } from "../store/useAppStore";
import { WeatherContext } from "../types/health";

class MockWeatherService {
  private updateInterval: ReturnType<typeof setInterval> | null = null;

  start() {
    this.refreshWeather();
    this.updateInterval = setInterval(() => this.refreshWeather(), 1800000); // 30 mins
  }

  stop() {
    if (this.updateInterval) clearInterval(this.updateInterval);
  }

  refreshWeather() {
    const temp = Math.floor(Math.random() * 10) + 29; // 29-38
    const humidity = Math.floor(Math.random() * 21) + 65; // 65-85
    const uvIndex = Math.floor(Math.random() * 5) + 6; // 6-10

    const multiplier = this.calculateMultiplier(temp, uvIndex);

    const weather: WeatherContext = {
      temp,
      humidity,
      uvIndex,
      city: "Lagos",
      multiplier,
      lastUpdate: new Date().toISOString(),
    };

    useAppStore.getState().updateWeather(weather);
  }

  private calculateMultiplier(temp: number, uv: number): number {
    let m = 1.0;
    if (temp < 28) m = 1.0;
    else if (temp <= 32) m = 1.2;
    else if (temp <= 36) m = 1.4;
    else m = 1.6;

    if (uv > 8) m += 0.1;

    return parseFloat(m.toFixed(1));
  }
}

export default new MockWeatherService();
