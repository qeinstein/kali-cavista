"""
Weather service — fetches real-time weather data for hydration scoring.

Uses OpenWeatherMap API to get temperature and humidity
for the user's location, which feeds into hydration risk calculations.
"""

import httpx
from typing import Optional
from app.core.config import settings


async def get_current_weather(lat: float, lon: float) -> Optional[dict]:
    """
    Fetch current weather for given coordinates.

    Returns dict with temperature_c, humidity, and description,
    or None if the API key is not configured / request fails.
    """
    if not settings.OPENWEATHER_API_KEY:
        return None

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            return {
                "temperature_c": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "description": data["weather"][0]["description"],
            }
    except Exception:
        return None
