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
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-page',
  standalone: true,
  imports: [LocalAnchor, CommonModule, FormsModule],
  templateUrl: './event.html',
})
export class EventComponent {
  readonly vm = this;
  readonly nav = { open: false };
  readonly view = inject(Display);
  readonly destroyRef = inject(DestroyRef);
  loading = false;
  error = '';
  saving = false;
  message = '';
  fields: Record<string, string> = {};
  event!: Event;
  weather: Forecast = {};
  weatherLoading = false;
  load!: () => void;
  constructor() {
    const api = inject(HttpApi);
    const display = inject(Display);
    const weather = inject(Weather);

    const vm = this;

    const id = new URLSearchParams(window.location.search).get('id');
    vm.load = function () {
      vm.loading = true;
      vm.error = '';
      return api
        .get<Event>('api/events/' + encodeURIComponent(id || '0'))
        .then(
          (event) => {
            vm.event = event;
            document.title = event.name + ' | Driftline';
            vm.weatherLoading = true;
            weather
              .forEvent(event)
              .then((result) => {
                vm.weather = result;
              })
              .finally(() => {
                vm.weatherLoading = false;
              });
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
