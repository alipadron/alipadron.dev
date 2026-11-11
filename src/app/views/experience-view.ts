import { Component, input } from '@angular/core';

import { ExperienceEntry } from '../components/experience-entry';
import { content, ui } from '../../content/index';
import type { Language } from '../../content/language';
import { selectAll } from '../../content/presentation';

const selected = selectAll(content);

@Component({
  selector: 'app-experience-view',
  imports: [ExperienceEntry],
  styleUrl: './experience-view.css',
  template: `
    <main class="wrap">
      <header class="page-head">
        <p class="kicker">{{ ui.experience.kicker[language()] }}</p>
        <h1 class="page-title">{{ ui.experience.heading[language()] }}</h1>
        <p class="summary">{{ content.profile.summary[language()] }}</p>
      </header>

      <section [attr.aria-label]="ui.experience.heading[language()]">
        @for (entry of experience; track entry.id) {
          <app-experience-entry
            [entry]="entry"
            [language]="language()"
            [headingLevel]="2"
          />
        }
      </section>

      @if (projects.length > 0) {
        <section class="projects" aria-labelledby="projects-heading">
          <h2 id="projects-heading" class="section-label">
            {{ ui.projects.heading[language()] }}
          </h2>
          @for (entry of projects; track entry.id) {
            <app-experience-entry
              [entry]="entry"
              [language]="language()"
              [headingLevel]="3"
            />
          }
        </section>
      }
    </main>
  `,
})
export class ExperienceView {
  readonly language = input.required<Language>();

  protected readonly content = content;
  protected readonly ui = ui;
  protected readonly experience = selected.experience;
  protected readonly projects = selected.projects;
}
