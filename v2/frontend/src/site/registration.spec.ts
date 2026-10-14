import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { RegistrationComponent } from './registration';

const eventFixture = {
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
      tickets: 3,
      totalAmount: 0,
      registeredAt: '2026-10-13T09:42:51.000Z',
    },
    {
      id: 2,
      fullName: 'Sam Lee',
      tickets: 1,
      totalAmount: 0,
      registeredAt: '2026-10-12T09:42:51.000Z',
    },
    {
      id: 1,
      fullName: 'Alex Morgan',
      tickets: 2,
      totalAmount: 0,
      registeredAt: '2026-10-08T09:42:51.000Z',
    },
  ],
};
describe('Registration with actual Angular form directives', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    history.replaceState(null, '', '/registration.html?id=1');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  async function ready() {
    const fixture = TestBed.createComponent(RegistrationComponent);
    http.expectOne((r) => r.url.endsWith('/api/events/1')).flush(eventFixture);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }
  it('renders the selected event and blocks an empty form before any POST', async () => {
    const fixture = await ready();
    expect(fixture.nativeElement.textContent).toContain(eventFixture.name);
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new globalThis.Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toMatch(
      /Check|Complete/,
    );
    http.expectNone((r) => r.method === 'POST');
  });
  it('rejects an invalid email through Angular validation', async () => {
    const fixture = await ready();
    const input = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;
    input.value = 'invalid-address';
    input.dispatchEvent(new globalThis.Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.classList.contains('ng-invalid')).toBe(true);
  });
  it('uses one in-flight request and renders the real server receipt', async () => {
    const fixture = await ready();
    const component = fixture.componentInstance;
    component.details = {
      fullName: 'Migration Check',
      email: 'migration-check@example.com',
      phone: '+61 400 123 456',
      tickets: 1,
    };
    fixture.detectChanges();
    await fixture.whenStable();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new globalThis.Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new globalThis.Event('submit', { bubbles: true, cancelable: true }));
    const requests = http.match((r) => r.method === 'POST');
    expect(requests).toHaveLength(1);
    expect(requests[0].request.body.email).toBe('migration-check@example.com');
    requests[0].flush({
      id: 91,
      fullName: 'Migration Check',
      email: 'migration-check@example.com',
      phone: '+61 400 123 456',
      tickets: 1,
      ticketPrice: 0,
      totalAmount: 0,
      registeredAt: '2026-10-14T01:00:00.000Z',
      eventId: 1,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('DL-91');
    expect(fixture.nativeElement.textContent).toContain('on the list');
  });
  it('shows a duplicate-registration response and lets the user correct it', async () => {
    const fixture = await ready();
    const component = fixture.componentInstance;
    component.details = {
      fullName: 'Migration Check',
      email: 'migration-check@example.com',
      phone: '+61 400 123 456',
      tickets: 1,
    };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new globalThis.Event('submit', { bubbles: true, cancelable: true }));
    http
      .expectOne((r) => r.method === 'POST')
      .flush(
        { error: 'This email address is already registered for this event.' },
        { status: 409, statusText: 'Conflict' },
      );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('already registered');
  });
});
