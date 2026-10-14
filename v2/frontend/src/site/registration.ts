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
  templateUrl: './registration.html',
})
export class RegistrationComponent {
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
  loadError = '';
  details = { fullName: '', email: '', phone: '', tickets: 1 };
  confirmation!: Receipt;
  total!: () => number;
  submit!: (form: NgForm) => void;
  constructor() {
    const api = inject(HttpApi);
    const display = inject(Display);

    const vm = this;

    vm.details = { fullName: '', email: '', phone: '', tickets: 1 };
    vm.fields = {};
    const id = new URLSearchParams(window.location.search).get('id');
    vm.loading = true;
    api
      .get<Event>('api/events/' + encodeURIComponent(id || '0'))
      .then(
        (event) => {
          vm.event = event;
        },
        (error) => {
          vm.loadError = error.message;
        },
      )
      .finally(() => {
        vm.loading = false;
      });
    vm.total = () =>
      vm.event ? Number(vm.event.ticketPrice) * Number(vm.details.tickets || 0) : 0;
    vm.submit = function (form) {
      vm.error = '';
      vm.fields = {};
      if (
        form.invalid ||
        !(vm.details.fullName || '').trim() ||
        (vm.details.phone || '').replace(/\D/g, '').length < 6
      ) {
        vm.error = 'Check your name, email, contact number and ticket quantity.';
        defer(() => {
          document.querySelector<HTMLElement>('#registration-error')?.focus();
        }, 0);
        return;
      }
      if (vm.saving || !vm.event) return;
      vm.saving = true;
      return api
        .post<Receipt>('api/events/' + vm.event.id + '/registrations', vm.details)
        .then(
          (record) => {
            vm.confirmation = record;
            defer(() => {
              document.querySelector<HTMLElement>('#booking-confirmation')?.focus();
            }, 0);
          },
          (error) => {
            vm.error = error.message;
            vm.fields = error.fields || {};
          },
        )
        .finally(() => {
          vm.saving = false;
        });
    };
  }
}
