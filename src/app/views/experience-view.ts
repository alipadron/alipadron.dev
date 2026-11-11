import { Component, input } from '@angular/core';

import { content, ui } from '../../content/index';
import type { Language } from '../../content/language';
import {
  formatDateRange,
  formatLocationModel,
  selectAll,
  type SelectedEntry,
} from '../../content/presentation';

const selected = selectAll(content);

@Component({
  selector: 'app-experience-view',
  styleUrl: './experience-view.css',
  template: `
    <main class="wrap">
      <header class="page-head">
        <p class="kicker">{{ ui.cv.variantName[language()] }}</p>
        <h1 class="page-title">{{ ui.experience.heading[language()] }}</h1>
        <p class="summary">{{ content.profile.summary[language()] }}</p>
      </header>

      <section [attr.aria-label]="ui.experience.heading[language()]">
        @for (entry of experience; track entry.id) {
          <article class="entry">
            <div class="entry-meta">
              <p class="dates">{{ dateRange(entry) }}</p>
              <p class="place">{{ location(entry) }}</p>
            </div>
            <div class="entry-body">
              <h2 class="entry-title">{{ entry.company[language()] }}</h2>
              <p class="entry-role">{{ entry.title[language()] }}</p>
              <ul class="stack" [attr.aria-label]="ui.experience.stackLabel[language()]">
                @for (item of entry.stack; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
              <ul class="bullets">
                @for (bullet of entry.bullets; track bullet.id) {
                  <li>{{ bullet.text[language()] }}</li>
                }
              </ul>
            </div>
          </article>
        }
      </section>

      <section class="projects" aria-labelledby="projects-heading">
        <h2 id="projects-heading" class="section-label">
          {{ ui.projects.heading[language()] }}
        </h2>
        @for (entry of projects; track entry.id) {
          <article class="entry">
            <div class="entry-meta">
              <p class="dates">{{ dateRange(entry) }}</p>
              <p class="place">{{ location(entry) }}</p>
            </div>
            <div class="entry-body">
              <h3 class="entry-title">{{ entry.company[language()] }}</h3>
              <p class="entry-role">{{ entry.title[language()] }}</p>
              <ul class="stack" [attr.aria-label]="ui.experience.stackLabel[language()]">
                @for (item of entry.stack; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
              <ul class="bullets">
                @for (bullet of entry.bullets; track bullet.id) {
                  <li>{{ bullet.text[language()] }}</li>
                }
              </ul>
            </div>
          </article>
        }
      </section>
    </main>
  `,
})
export class ExperienceView {
  readonly language = input.required<Language>();

  protected readonly content = content;
  protected readonly ui = ui;
  protected readonly experience = selected.experience;
  protected readonly projects = selected.projects;

  dateRange(entry: SelectedEntry): string {
    return formatDateRange(entry, this.language());
  }

  location(entry: SelectedEntry): string {
    return formatLocationModel(entry.locationModel, this.language());
  }
}
