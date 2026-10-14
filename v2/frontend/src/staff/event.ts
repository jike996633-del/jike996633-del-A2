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
export class EventEditorComponent {
  readonly vm = this;
  readonly nav = { open: false };
  readonly view = inject(Display);
  readonly destroyRef = inject(DestroyRef);
  loading = false;
  error = '';
  saving = false;
  message = '';
  fields: Record<string, string> = {};
  event!: Event | null;
  data: EventDraft = {};
  id: string | number | null = null;
  loadError = '';
  images: { path: string; name: string }[] = [];
  categories: Category[] = [];
  organizations: Organisation[] = [];
  form?: NgForm;
  save!: (form: NgForm) => void;
  @ViewChild('eventFormControl') set eventFormControl(form: NgForm | undefined) {
    this.form = form;
  }
  constructor() {
    const api = inject(HttpApi);
    const display = inject(Display);

    const vm = this;

    vm.id = new URLSearchParams(window.location.search).get('id');
    vm.fields = {};
    vm.images = [
      { path: 'assets/images/hero-coast.jpg', name: 'Shoreline' },
      { path: 'assets/images/hero-bondi.jpg', name: 'Bondi from above' },
      { path: 'assets/images/rockpool.jpg', name: 'Rockpool' },
      { path: 'assets/images/dune-grass.jpg', name: 'Dune grass' },
      { path: 'assets/images/cliffs.jpg', name: 'Coastal cliffs' },
      { path: 'assets/images/cleanup.jpg', name: 'Beach clean-up' },
      { path: 'assets/images/volunteers.jpg', name: 'Volunteers' },
      { path: 'assets/images/shore-texture.jpg', name: 'Shore detail' },
    ];
    vm.loading = true;
    Promise.all([
      api.get<Category[]>('api/categories'),
      api.get<Organisation[]>('api/organizations'),
      vm.id
        ? api.get<Event>('api/admin/events/' + encodeURIComponent(vm.id))
        : Promise.resolve(null),
    ])
      .then(
        (results) => {
          vm.categories = results[0];
          vm.organizations = results[1];
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          nextWeek.setHours(12, 0, 0, 0);
          vm.event = results[2];
          vm.data = vm.event
            ? structuredClone(vm.event)
            : {
                name: '',
                summary: '',
                description: '',
                purpose: '',
                locationName: '',
                suburb: '',
                meetingPoint: '',
                categoryId: vm.categories[0]?.id,
                organizationId: vm.organizations[0]?.id,
                date: display.dateValue(nextWeek),
                startTime: '09:00',
                endTime: '12:00',
                ticketPrice: 0,
                fundingGoal: 1000,
                donationRaised: 0,
                imagePath: vm.images[0].path,
                latitude: -33.8915,
                longitude: 151.2767,
                status: 'active',
              };
          vm.data.dateInput = display.dateInput(vm.data.date);
          vm.data.startInput = display.timeInput(vm.data.startTime);
          vm.data.endInput = display.timeInput(vm.data.endTime);
          document.title =
            (vm.event ? 'Edit ' + vm.event.name : 'New event') + ' | Driftline staff';
        },
        (error) => {
          vm.loadError = error.message;
        },
      )
      .finally(() => {
        vm.loading = false;
      });
    vm.save = function (form) {
      vm.error = '';
      vm.message = '';
      vm.fields = {};
      if (form.invalid) {
        vm.error = 'Complete the required fields before saving.';
        return;
      }
      const data = structuredClone(vm.data);
      data.date = display.dateValue(data.dateInput);
      data.startTime = display.timeValue(data.startInput);
      data.endTime = display.timeValue(data.endInput);
      if (data.endTime <= data.startTime) {
        vm.fields.endTime = 'Choose an end time after the start time.';
        vm.error = 'Check the event times.';
        return;
      }
      if (vm.saving) return;
      vm.saving = true;
      const saving = vm.id
        ? api.put<Event>('api/admin/events/' + vm.id, data)
        : api.post<Event>('api/admin/events', data);
      saving
        .then(
          (event) => {
            vm.event = event;
            vm.id = event.id;
            history.replaceState(null, '', window.location.pathname + '?id=' + event.id);
            vm.message = 'Saved ' + event.name + '.';
            form?.form.markAsPristine();
            form?.form.markAsUntouched();
            defer(() => {
              document.querySelector<HTMLElement>('#save-message')?.focus();
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
    // ViewChild follows the conditional editor form as it enters and leaves the page.
    // Leave warnings only apply to unsaved form edits, not to a successful save.
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (vm.form && vm.form.dirty && !vm.saving) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warnBeforeLeave);
    this.destroyRef.onDestroy(() => window.removeEventListener('beforeunload', warnBeforeLeave));
  }
}
