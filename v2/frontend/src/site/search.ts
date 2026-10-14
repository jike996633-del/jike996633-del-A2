import { LocalAnchor } from '../shared/navigation';
import { Component, ChangeDetectionStrategy, inject, DestroyRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpApi, DialogFocus, defer } from '../shared/http-api';
import { Display } from '../shared/display';
import {
  Event,
  Category,
  Organisation,
  Registration,
  Receipt,
  Forecast,
  EventDraft,
} from '../shared/models';
import { Weather } from '../shared/weather';
import { EventCardComponent } from '../shared/event-card';
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-page',
  standalone: true,
  imports: [LocalAnchor, CommonModule, FormsModule, EventCardComponent],
  templateUrl: './search.html',
})
export class SearchComponent {
  readonly vm = this;
  readonly nav = { open: false };
  readonly view = inject(Display);
  readonly destroyRef = inject(DestroyRef);
  loading = false;
  error = '';
  saving = false;
  message = '';
  fields: Record<string, string> = {};
  events: Event[] = [];
  categories: Category[] = [];
  categoryError = '';
  filters: { date: string | null; location: string; category: string } = {
    date: null,
    location: '',
    category: '',
  };
  search!: (form?: NgForm) => void;
  clear!: (form?: NgForm) => void;
  constructor() {
    const api = inject(HttpApi);
    const display = inject(Display);

    const vm = this;

    const params = new URLSearchParams(window.location.search);
    const rawDate = params.get('date') || '';
    vm.filters = {
      date: rawDate ? rawDate : null,
      location: params.get('location') || '',
      category: params.get('category') || '',
    };
    let requestNumber = 0;
    vm.search = function (form) {
      vm.error = '';
      if (form && form.invalid) {
        vm.error = 'Check the date and location, then apply your filters.';
        return;
      }
      const query: Record<string, string> = {};
      if (vm.filters.date) query.date = display.dateValue(vm.filters.date);
      if ((vm.filters.location || '').trim()) query.location = vm.filters.location.trim();
      if (vm.filters.category) query.category = String(vm.filters.category);
      const suffix = new URLSearchParams(query).toString();
      history.replaceState(null, '', window.location.pathname + (suffix ? '?' + suffix : ''));
      const current = ++requestNumber;
      vm.loading = true;
      return api
        .get<Event[]>('api/events', query)
        .then(
          (events) => {
            if (current === requestNumber) vm.events = events;
          },
          (error) => {
            if (current === requestNumber) {
              vm.error = error.message;
              vm.events = [];
            }
          },
        )
        .finally(() => {
          if (current === requestNumber) vm.loading = false;
        });
    };
    vm.clear = function (form) {
      vm.filters = { date: null, location: '', category: '' };
      form?.form.markAsPristine();
      form?.form.markAsUntouched();
      vm.search();
    };
    api.get<Category[]>('api/categories').then(
      (categories) => {
        vm.categories = categories;
      },
      (error) => {
        vm.categoryError = error.message;
      },
    );
    if (
      rawDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(vm.filters.date || '') ||
        display.dateValue(vm.filters.date) !== rawDate)
    ) {
      vm.error = 'Enter a valid date in YYYY-MM-DD format.';
      vm.filters.date = null;
    } else vm.search();
  }
}
