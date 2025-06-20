import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { routes } from './app/app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class App {
  name = 'HomeMate';
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ]
});