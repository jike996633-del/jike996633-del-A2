export interface Category {
  id: number;
  name: string;
  slug: string;
}
export interface Organisation {
  id: number;
  name: string;
  summary: string;
}
export interface Registration {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  tickets: number;
  ticketPrice: number;
  totalAmount: number;
  registeredAt: string;
}
export interface Receipt extends Registration {
  eventId: number;
}
export interface Event {
  id: number;
  name: string;
  summary: string;
  description: string;
  purpose: string;
  locationName: string;
  suburb: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingPoint: string;
  ticketPrice: number;
  fundingGoal: number;
  donationRaised: number;
  fundingRaised: number;
  registrationCount: number;
  ticketsBooked: number;
  imagePath: string;
  latitude: number;
  longitude: number;
  status: string;
  displayStatus: string;
  categoryId: number;
  category: string;
  organizationId: number;
  organization: string;
  organizationSummary: string;
  registrations: Registration[];
}
export interface Forecast {
  message?: string;
  description?: string;
  low?: number;
  high?: number;
  date?: string;
}
export type EventDraft = Partial<Event> & {
  dateInput?: string;
  startInput?: string;
  endInput?: string;
};
