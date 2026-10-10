// Weather adapter using Open-Meteo (free, no API key needed)
import { WeatherData } from './types';

const DELHI_LAT = 28.6139;
const DELHI_LNG = 77.2090;

export async function getWeather(
  lat: number = DELHI_LAT,
  lng: number = DELHI_LNG,
  targetDate?: string
): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation,windspeed_10m,weathercode&forecast_days=2&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API failed');
    const data = await res.json();

    // Get current or nearest hour index
    const now = new Date();
    const hourIndex = now.getHours();

    const temp = data.hourly.temperature_2m[hourIndex] ?? 28;
    const precip = data.hourly.precipitation[hourIndex] ?? 0;
    const wind = data.hourly.windspeed_10m[hourIndex] ?? 10;
    const code = data.hourly.weathercode[hourIndex] ?? 0;

    const isRaining = precip > 0.5 || (code >= 51 && code <= 99);
    const description = getWeatherDescription(code, precip);

    return { temperature: Math.round(temp), precipitationMm: precip, windSpeedKmh: Math.round(wind), description, isRaining };
  } catch {
    // Fallback demo data
    return { temperature: 28, precipitationMm: 0, windSpeedKmh: 12, description: 'Partly cloudy (Demo)', isRaining: false };
  }
}

function getWeatherDescription(code: number, precip: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return precip > 5 ? 'Heavy rain' : 'Light rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function getWeatherForJourney(weather: WeatherData): string {
  if (weather.isRaining) return `🌧️ ${weather.description}, ${weather.temperature}°C — carry umbrella`;
  if (weather.temperature > 35) return `☀️ Very hot, ${weather.temperature}°C — stay hydrated`;
  if (weather.temperature < 15) return `🧥 Cold, ${weather.temperature}°C — dress warm`;
  return `☀️ ${weather.description}, ${weather.temperature}°C`;
}
