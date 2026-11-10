import { Component, input } from '@angular/core';

import { content, ui, type Bilingual } from '../../content/index';
import type { Language } from '../../content/language';
import {
  formatDateRange,
  formatLocationModel,
  selectAll,
  type SelectedEntry,
} from '../../content/presentation';

interface SiteSection {
  readonly key: string;
  readonly heading: Bilingual | null;
  readonly entries: readonly SelectedEntry[];
}

const selected = selectAll(content);

@Component({
  selector: 'app-experience-view',
  template: `
    <main>
      <h1>{{ ui.experience.heading[language()] }}</h1>

      @for (section of sections; track section.key) {
        @if (section.heading) {
          <h2>{{ section.heading[language()] }}</h2>
        }

        @for (entry of section.entries; track entry.id) {
          <article>
            <h3>{{ entry.company[language()] }}</h3>
            <p>{{ entry.title[language()] }}</p>
            <p>
              {{ dateRange(entry) }} · {{ location(entry) }} ·
              {{ entry.stack.join(', ') }}
            </p>
            <ul>
              @for (bullet of entry.bullets; track bullet.id) {
                <li>{{ bullet.text[language()] }}</li>
              }
            </ul>
          </article>
        }
      }
    </main>
  `,
})
export class ExperienceView {
  readonly language = input.required<Language>();

  protected readonly ui = ui;
  protected readonly sections: readonly SiteSection[] = [
    { key: 'experience', heading: null, entries: selected.experience },
    {
      key: 'projects',
      heading: ui.projects.heading,
      entries: selected.projects,
    },
  ].filter((section) => section.entries.length > 0);

  dateRange(entry: SelectedEntry): string {
    return formatDateRange(entry, this.language());
  }

  location(entry: SelectedEntry): string {
    return formatLocationModel(entry.locationModel, this.language());
  }
}
