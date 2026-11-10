import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { roles, type Role } from '../../../content/index';
import {
  formatDateRange,
  formatLocationModel,
  orderedBullets,
} from '../../../content/presentation';

@Component({
  selector: 'app-experience',
  imports: [RouterLink],
  template: `
    <main>
      <nav><a routerLink="/">Alí Padrón</a></nav>
      <h1>Experience</h1>

      @for (role of roles; track role.id) {
        <article>
          <h2>{{ role.company.en }}</h2>
          <p>{{ role.title.en }}</p>
          <p>
            {{ dateRange(role) }} · {{ location(role) }} ·
            {{ role.stack.join(', ') }}
          </p>
          <ul>
            @for (bullet of bullets(role); track bullet.id) {
              <li>{{ bullet.text.en }}</li>
            }
          </ul>
        </article>
      }
    </main>
  `,
})
export default class ExperiencePage {
  readonly roles = roles;

  dateRange(role: Role): string {
    return formatDateRange(role);
  }

  location(role: Role): string {
    return formatLocationModel(role.locationModel);
  }

  bullets(role: Role) {
    return orderedBullets(role);
  }
}
