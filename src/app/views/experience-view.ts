import { Component, input } from '@angular/core';

import { roles, ui, type Role } from '../../content/index';
import type { Language } from '../../content/language';
import {
  formatDateRange,
  formatLocationModel,
  orderedBullets,
} from '../../content/presentation';

@Component({
  selector: 'app-experience-view',
  template: `
    <main>
      <h1>{{ ui.experience.heading[language()] }}</h1>

      @for (role of roles; track role.id) {
        <article>
          <h2>{{ role.company[language()] }}</h2>
          <p>{{ role.title[language()] }}</p>
          <p>
            {{ dateRange(role) }} · {{ location(role) }} ·
            {{ role.stack.join(', ') }}
          </p>
          <ul>
            @for (bullet of bullets(role); track bullet.id) {
              <li>{{ bullet.text[language()] }}</li>
            }
          </ul>
        </article>
      }
    </main>
  `,
})
export class ExperienceView {
  readonly language = input.required<Language>();

  protected readonly ui = ui;
  protected readonly roles = roles;

  dateRange(role: Role): string {
    return formatDateRange(role, this.language());
  }

  location(role: Role): string {
    return formatLocationModel(role.locationModel, this.language());
  }

  bullets(role: Role) {
    return orderedBullets(role);
  }
}
