import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { Event } from './models';
import { Display } from './display';
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-event-card',
  templateUrl: './event-card.html',
})
export class EventCardComponent {
  @Input({ required: true }) event!: Event;
  @Input() featured = false;
  readonly format = inject(Display);
  readonly view = this.format;
  get item(): Event {
    return this.event;
  }
}
