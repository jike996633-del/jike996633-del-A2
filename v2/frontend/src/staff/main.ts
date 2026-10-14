import { Component, ChangeDetectionStrategy, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterOutlet, withInMemoryScrolling } from '@angular/router';
import { CategoriesComponent } from './categories';
import { EventEditorComponent } from './event';
import { StaffEventsComponent } from './index';
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class App {}
bootstrapApplication(App, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(
      [
        { path: '', component: StaffEventsComponent, pathMatch: 'full' },
        { path: 'categories.html', component: CategoriesComponent },
        { path: 'event.html', component: EventEditorComponent },
        { path: 'index.html', component: StaffEventsComponent },
      ],
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
  ],
}).catch(() => {
  const root = document.querySelector('app-root');
  if (root) root.textContent = 'The page could not be loaded. Refresh and try again.';
});
