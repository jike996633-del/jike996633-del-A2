import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { EventEditorComponent } from './event';
const detail = {
  id: 1,
  name: 'North Bondi Beach Clean-up',
  summary: 'Collect litter along the north end of Bondi before the beach gets busy.',
  description:
    'Start with a safety briefing at North Bondi, then work in small groups toward the promenade. We will collect and sort litter along the way. Gloves and bags are provided. Wear closed shoes and bring a refillable water bottle. Children are welcome with an adult.',
  purpose: 'Remove small plastics and fishing line before they reach the water.',
  locationName: 'Bondi Beach',
  suburb: 'Bondi',
  date: '2026-10-17',
  startTime: '07:30',
  endTime: '10:00',
  meetingPoint: 'North Bondi Surf Life Saving Club entrance',
  ticketPrice: 0,
  fundingGoal: 1800,
  donationRaised: 680,
  fundingRaised: 680,
  registrationCount: 3,
  ticketsBooked: 6,
  imagePath: 'assets/images/hero-coast.jpg',
  latitude: -33.8915,
  longitude: 151.2767,
  status: 'active',
  displayStatus: 'active',
  categoryId: 1,
  category: 'Beach clean-up',
  organizationId: 1,
  organization: 'Driftline',
  organizationSummary:
    'A Sydney community group that organises beach clean-ups, rockpool surveys and planting days.',
  registrations: [
    {
      id: 3,
      fullName: 'Casey Tran',
      email: 'casey.tran@example.com',
      phone: '0400 000 103',
      tickets: 3,
      ticketPrice: 0,
      totalAmount: 0,
      registeredAt: '2026-10-13T09:42:51.000Z',
    },
    {
      id: 2,
      fullName: 'Sam Lee',
      email: 'sam.lee@example.com',
      phone: '0400 000 102',
      tickets: 1,
      ticketPrice: 0,
      totalAmount: 0,
      registeredAt: '2026-10-12T09:42:51.000Z',
    },
    {
      id: 1,
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '0400 000 101',
      tickets: 2,
      ticketPrice: 0,
      totalAmount: 0,
      registeredAt: '2026-10-08T09:42:51.000Z',
    },
  ],
};
const categories = [
  { id: 1, name: 'Beach clean-up', slug: 'beach-cleanup' },
  { id: 2, name: 'Coastal restoration', slug: 'coastal-restoration' },
  { id: 3, name: 'Citizen science', slug: 'citizen-science' },
  { id: 4, name: 'Community gathering', slug: 'community-gathering' },
];
const organisations = [
  {
    id: 1,
    name: 'Driftline',
    summary:
      'A Sydney community group that organises beach clean-ups, rockpool surveys and planting days.',
  },
  {
    id: 2,
    name: 'Driftline Field Team',
    summary: 'Volunteers who coordinate planting and field survey sessions in Sydney.',
  },
];
describe('Staff edit with the original database values', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    history.replaceState(null, '', '/admin/event.html?id=1');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  async function ready() {
    const fixture = TestBed.createComponent(EventEditorComponent);
    http.expectOne((r) => r.url.endsWith('/api/categories')).flush(categories);
    http.expectOne((r) => r.url.endsWith('/api/organizations')).flush(organisations);
    http.expectOne((r) => r.url.endsWith('/api/admin/events/1')).flush(detail);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }
  it('renders registrations and retains the event local date and times', async () => {
    const fixture = await ready();
    const data = fixture.componentInstance.data;
    expect(data.dateInput).toBe(detail.date);
    expect(data.startInput).toBe(detail.startTime);
    expect(data.endInput).toBe(detail.endTime);
    expect(fixture.nativeElement.querySelector('input[name="name"]').value).toBe(detail.name);
    expect(fixture.nativeElement.textContent).toMatch(/registrations/i);
  });
  it('submits an unchanged event with the original date, time and identity', async () => {
    const fixture = await ready();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new globalThis.Event('submit', { bubbles: true, cancelable: true }));
    const request = http.expectOne((r) => r.method === 'PUT');
    expect(request.request.url).toContain('/api/admin/events/1');
    expect(request.request.body.date).toBe(detail.date);
    expect(request.request.body.startTime).toBe(detail.startTime);
    expect(request.request.body.endTime).toBe(detail.endTime);
    request.flush(detail);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toMatch(/Saved|saved/);
  });
  it('blocks an end time before the start before issuing a write', async () => {
    const fixture = await ready();
    fixture.componentInstance.data.startInput = '10:00';
    fixture.componentInstance.data.endInput = '09:00';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new globalThis.Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    http.expectNone((r) => r.method === 'PUT' || r.method === 'POST');
    expect(fixture.nativeElement.textContent).toMatch(/after|times/);
  });
});
