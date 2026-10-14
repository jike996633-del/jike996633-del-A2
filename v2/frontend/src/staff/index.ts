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
  templateUrl: './index.html',
})
export class StaffEventsComponent {
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
  filter = { status: '', text: '' };
  selected!: Event;
  deleteError = '';
  deleting = false;
  load!: () => void;
  visibleEvents!: () => Event[];
  count!: (status: string) => number;
  requestDelete!: (event: Event) => void;
  cancelDelete!: () => void;
  deleteEvent!: () => void;
  constructor() {
    const api = inject(HttpApi);
    const display = inject(Display);

    const vm = this;

    vm.filter = { status: '', text: '' };
    vm.load = function () {
      vm.loading = true;
      vm.error = '';
      return api
        .get<Event[]>('api/admin/events')
        .then(
          (events) => {
            vm.events = events;
          },
          (error) => {
            vm.error = error.message;
          },
        )
        .finally(() => {
          vm.loading = false;
        });
    };
    vm.visibleEvents = function () {
      const text = vm.filter.text.toLowerCase();
      return (vm.events || []).filter(
        (event) =>
          (!vm.filter.status || vm.filter.status === event.displayStatus) &&
          (event.name + ' ' + event.suburb + ' ' + event.category).toLowerCase().includes(text),
      );
    };
    vm.count = (status) =>
      (vm.events || []).filter((event) => !status || event.displayStatus === status).length;
    vm.requestDelete = function (event) {
      vm.selected = event;
      vm.deleteError = '';
      document.querySelector<HTMLDialogElement>('#delete-event-dialog')!.showModal();
    };
    vm.cancelDelete = function () {
      document.querySelector<HTMLDialogElement>('#delete-event-dialog')!.close();
    };
    vm.deleteEvent = function () {
      if (vm.deleting) return;
      vm.deleting = true;
      api
        .remove('api/admin/events/' + vm.selected.id)
        .then(
          () => {
            vm.message = 'Deleted ' + vm.selected.name + '.';
            vm.cancelDelete();
            vm.load();
          },
          (error) => {
            vm.deleteError = error.message;
          },
        )
        .finally(() => {
          vm.deleting = false;
        });
    };
    vm.load();
  }
}
