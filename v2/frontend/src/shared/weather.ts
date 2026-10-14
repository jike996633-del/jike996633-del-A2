import { inject, Injectable } from '@angular/core';
import { HttpApi } from './http-api';
import { Event, Forecast } from './models';
interface WeatherData {
  daily: {
    time: string[];
    weather_code: (number | null)[];
    temperature_2m_min: (number | null)[];
    temperature_2m_max: (number | null)[];
    precipitation_probability_max?: (number | null)[];
  };
}
@Injectable({ providedIn: 'root' })
export class Weather {
  private readonly api = inject(HttpApi);
  private readonly names: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Freezing fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Freezing drizzle',
    57: 'Heavy freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Showers',
    82: 'Heavy showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  };
  forEvent(event: Event): Promise<Forecast> {
    return this.load(event);
  }
  async load(event: Event): Promise<Forecast> {
    const day = event.date;
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney' }).format(
      new Date(),
    );
    const days = (Date.parse(day + 'T12:00:00Z') - Date.parse(today + 'T12:00:00Z')) / 86400000;
    if (event.latitude == null || event.longitude == null)
      return this.note('Weather is unavailable for this venue.');
    if (days < 0) return this.note('This event has finished; a forecast is no longer available.');
    if (days > 15) return this.note('The forecast will be available within 16 days of this event.');
    try {
      const data = await this.api.request<WeatherData>(
        'GET',
        'https://api.open-meteo.com/v1/forecast',
        undefined,
        {
          latitude: event.latitude,
          longitude: event.longitude,
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
          timezone: 'Australia/Sydney',
          forecast_days: 16,
        },
        10000,
      );
      const daily = data.daily,
        index = daily?.time?.indexOf(day) ?? -1;
      const low = daily?.temperature_2m_min?.[index],
        high = daily?.temperature_2m_max?.[index],
        code = daily?.weather_code?.[index];
      if (
        index < 0 ||
        typeof low !== 'number' ||
        typeof high !== 'number' ||
        typeof code !== 'number' ||
        ![low, high, code].every(Number.isFinite)
      )
        return this.note('The forecast for this event date is not available yet.');
      return {
        description: this.names[code] || 'Conditions unavailable',
        low: Math.round(low),
        high: Math.round(high),
        date: day,
      };
    } catch {
      return this.note('Weather could not be loaded. Check the forecast before heading out.');
    }
  }
  private note(message: string): Forecast {
    return { message };
  }
}
