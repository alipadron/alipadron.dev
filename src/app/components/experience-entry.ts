import { Component, computed, input } from '@angular/core';

import { ui } from '../../content/index';
import type { Language } from '../../content/language';
import {
  formatDateRange,
  formatLocationModel,
  type SelectedEntry,
} from '../../content/presentation';

/**
 * One role or project on the Experience page. The Home page owns the page
 * chrome; this component owns the shared entry layout and its heading level.
 */
@Component({
  selector: 'app-experience-entry',
  styleUrl: './experience-entry.css',
  template: `
    <article class="entry">
      <div class="entry-meta">
        <p class="dates">{{ dateRange() }}</p>
        <p class="place">{{ location() }}</p>
      </div>
      <div class="entry-body">
        @if (headingLevel() === 2) {
          <h2 class="entry-title">{{ entry().company[language()] }}</h2>
        } @else {
          <h3 class="entry-title">{{ entry().company[language()] }}</h3>
        }
        <p class="entry-role">{{ entry().title[language()] }}</p>
        <ul class="stack" [attr.aria-label]="ui.experience.stackLabel[language()]">
          @for (item of entry().stack; track item) {
            <li>{{ item }}</li>
          }
        </ul>
        <ul class="bullets">
          @for (bullet of entry().bullets; track bullet.id) {
            <li>{{ bullet.text[language()] }}</li>
          }
        </ul>
      </div>
    </article>
  `,
})
export class ExperienceEntry {
  readonly entry = input.required<SelectedEntry>();
  readonly language = input.required<Language>();
  readonly headingLevel = input.required<2 | 3>();

  protected readonly ui = ui;
  protected readonly dateRange = computed(() =>
    formatDateRange(this.entry(), this.language()),
  );
  protected readonly location = computed(() =>
    formatLocationModel(this.entry().locationModel, this.language()),
  );
}
