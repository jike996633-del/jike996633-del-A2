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
  templateUrl: './index.html',
})
export class HomeComponent {
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
  next!: Event;
  load!: () => void;
  constructor() {
    const api = inject(HttpApi);
    const display = inject(Display);

    const vm = this;

    vm.loading = true;
    vm.load = function () {
      vm.loading = true;
      vm.error = '';
      return api
        .get<Event[]>('api/events')
        .then(
          (events) => {
            vm.next = events[0];
            vm.events = events.slice(1);
          },
          (error) => {
            vm.error = error.message;
          },
        )
        .finally(() => {
          vm.loading = false;
        });
    };
    vm.load();
  }
}
