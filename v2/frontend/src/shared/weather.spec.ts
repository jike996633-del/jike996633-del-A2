import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { Weather } from './weather';
import { Event as CharityEvent } from './models';
describe('Event-day weather', () => {
  let http: HttpTestingController;
  let weather: Weather;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    weather = TestBed.inject(Weather);
  });
  afterEach(() => http.verify());
  function event(days: number): CharityEvent {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney' }).format(
      new Date(),
    );
    const date = new Date(today + 'T12:00:00Z');
    date.setUTCDate(date.getUTCDate() + days);
    const day = date.toISOString().slice(0, 10);
    return { date: day, latitude: -33.8, longitude: 151.2 } as CharityEvent;
  }
  it('does not label today’s forecast as a distant event forecast', async () => {
    const result = await weather.load(event(40));
    expect(result.message).toContain('16 days');
    http.expectNone(() => true);
  });
  it('uses the event coordinates, local timezone and matching forecast date', async () => {
    const value = event(2);
    const result = weather.load(value);
    const req = http.expectOne((r) => r.url === 'https://api.open-meteo.com/v1/forecast');
    expect(req.request.params.get('timezone')).toBe('Australia/Sydney');
    expect(req.request.params.get('latitude')).toBe('-33.8');
    const day = value.date;
    req.flush({
      daily: {
        time: [day],
        weather_code: [3],
        temperature_2m_min: [12.4],
        temperature_2m_max: [20.6],
        precipitation_probability_max: [30],
      },
    });
    expect(await result).toMatchObject({ description: 'Overcast', low: 12, high: 21 });
  });
  it('handles incomplete forecasts without displaying a made-up temperature', async () => {
    const result = weather.load(event(2));
    http
      .expectOne((r) => r.url.startsWith('https://api.open-meteo.com'))
      .flush({
        daily: { time: [], weather_code: [], temperature_2m_min: [], temperature_2m_max: [] },
      });
    expect((await result).message).toContain('not available');
  });
});
