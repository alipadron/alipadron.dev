import { Component } from '@angular/core';

import { roles, type Role } from '../../../content/index';

@Component({
  selector: 'app-experience',
  template: `
    <main>
      <nav><a href="/">Alí Padrón</a></nav>
      <h1>Experience</h1>

      @for (role of roles; track role.id) {
        <article>
          <h2>{{ role.company.en }}</h2>
          <p>{{ role.title.en }}</p>
          <p>
            {{ dates(role) }} · {{ role.locationModel }} ·
            {{ role.stack.join(', ') }}
          </p>
          <ul>
            @for (bullet of orderedBullets(role); track bullet.id) {
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

  dates(role: Role): string {
    return `${role.startDate} – ${role.endDate ?? 'Present'}`;
  }

  orderedBullets(role: Role) {
    return [...role.bullets].sort((left, right) => left.order - right.order);
  }
}
