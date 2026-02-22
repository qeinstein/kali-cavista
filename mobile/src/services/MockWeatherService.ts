import * as Location from "expo-location";
import { useAppStore } from "../store/useAppStore";
import { updateLocation } from "./api/profileService";
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

  async refreshWeather() {
    try {
      // Request location permission and get real coordinates
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("[WeatherService] Location permission not granted");
        this.applyFallbackWeather();
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lon } = location.coords;

      // Send location to backend for weather-based hydration scoring
      await updateLocation(lat, lon);
      console.log(`[WeatherService] Location updated: ${lat}, ${lon}`);

      // Reverse geocode for city name
      let city = "Unknown";
      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });
        if (geo?.city) city = geo.city;
        else if (geo?.region) city = geo.region;
      } catch {
        // fallback city
      }

      // Generate realistic weather based on location (will be replaced by backend weather in future)
      const temp = Math.floor(Math.random() * 10) + 29;
      const humidity = Math.floor(Math.random() * 21) + 65;
      const uvIndex = Math.floor(Math.random() * 5) + 6;
      const multiplier = this.calculateMultiplier(temp, uvIndex);

      const weather: WeatherContext = {
        temp,
        humidity,
        uvIndex,
        city,
        multiplier,
        lastUpdate: new Date().toISOString(),
      };

      useAppStore.getState().updateWeather(weather);
    } catch (err) {
      console.warn("[WeatherService] Failed to update location:", err);
      this.applyFallbackWeather();
    }
  }

  private applyFallbackWeather() {
    const temp = Math.floor(Math.random() * 10) + 29;
    const humidity = Math.floor(Math.random() * 21) + 65;
    const uvIndex = Math.floor(Math.random() * 5) + 6;
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
