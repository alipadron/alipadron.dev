import { Component, input } from '@angular/core';

import type { Language } from '../../content/language';
import type { CaseStudySection as CaseStudySectionContent } from '../../content/schema';

/**
 * One part of a case study (problem, decisions or result). The study page
 * supplies the heading, so the order and wording stay in one place.
 */
@Component({
  selector: 'app-case-study-section',
  styleUrl: './case-study-section.css',
  template: `
    <section class="part">
      <h2 class="section-label">{{ heading() }}</h2>
      @for (paragraph of section().paragraphs; track $index) {
        <p class="paragraph">{{ paragraph[language()] }}</p>
      }
      @if (section().bullets; as bullets) {
        <ul class="points">
          @for (bullet of bullets; track $index) {
            <li>{{ bullet[language()] }}</li>
          }
        </ul>
      }
    </section>
  `,
})
export class CaseStudySection {
  readonly heading = input.required<string>();
  readonly section = input.required<CaseStudySectionContent>();
  readonly language = input.required<Language>();
}
