import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { beforeEach, afterEach, it, expect } from 'vitest';
import { StaffEventsComponent } from './index';
import { CategoriesComponent } from './categories';
let http: HttpTestingController;
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  http = TestBed.inject(HttpTestingController);
});
afterEach(() => http.verify());
it('renders an event list while its unselected native confirmation dialog is closed', async () => {
  const fixture = TestBed.createComponent(StaffEventsComponent);
  expect(() => fixture.detectChanges()).not.toThrow();
  http
    .expectOne((r) => r.url.endsWith('/api/admin/events'))
    .flush([
      {
        id: 1,
        name: 'Initial render event',
        suburb: 'Bondi',
        category: 'Beach clean-up',
        displayStatus: 'active',
        date: '2026-10-20',
        startTime: '09:00',
        registrationCount: 0,
        ticketsBooked: 0,
        fundingRaised: 0,
      },
    ]);
  await fixture.whenStable();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Initial render event');
  expect(fixture.nativeElement.querySelector('#delete-event-dialog').open).toBe(false);
  expect(fixture.componentInstance.selected).toBeNull();
});
it('renders categories before any record is selected for deletion', async () => {
  const fixture = TestBed.createComponent(CategoriesComponent);
  expect(() => fixture.detectChanges()).not.toThrow();
  http
    .expectOne((r) => r.url.endsWith('/api/categories'))
    .flush([{ id: 1, name: 'Beach clean-up', slug: 'beach-clean-up' }]);
  await fixture.whenStable();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Beach clean-up');
  expect(fixture.nativeElement.querySelector('#delete-category-dialog').open).toBe(false);
});
