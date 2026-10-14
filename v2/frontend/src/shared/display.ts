import { Injectable } from '@angular/core';
import { Event } from './models';
@Injectable({ providedIn: 'root' })
export class Display {
  money(value?: number | null): string {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(
      value || 0,
    );
  }
  dateValue(value?: Date | string | null): string {
    if (typeof value === 'string') return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
    if (!value || Number.isNaN(value.getTime())) return '';
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  timeValue(value?: Date | string | null): string {
    if (typeof value === 'string') return value.slice(0, 5);
    return value
      ? `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
      : '';
  }
  private calendar(value: string, options: Intl.DateTimeFormatOptions): string {
    const date = new Date(value + 'T12:00:00Z');
    return Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat('en-AU', { timeZone: 'UTC', ...options }).format(date);
  }
  day(value?: string): string {
    return value ? this.calendar(value, { day: '2-digit' }) : '';
  }
  month(value?: string): string {
    return value ? this.calendar(value, { month: 'short' }) : '';
  }
  date(value?: string): string {
    return value
      ? this.calendar(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : '';
  }
  recorded(value?: string): string {
    return value
      ? new Intl.DateTimeFormat('en-AU', {
          timeZone: 'Australia/Sydney',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(value))
      : '';
  }
  dateInput(value?: string): string {
    return value || '';
  }
  timeInput(value?: string): string {
    return value || '';
  }
  progress(event?: Partial<Event>): number {
    return Math.max(
      0,
      Math.min(100, Math.round(((event?.fundingRaised || 0) / (event?.fundingGoal || 1)) * 100)),
    );
  }
}
