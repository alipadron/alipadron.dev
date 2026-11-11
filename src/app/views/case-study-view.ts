import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CaseStudySection } from '../components/case-study-section';
import { caseStudies, ui } from '../../content/index';
import type { CaseStudyId } from '../../content/case-studies';
import type { Language } from '../../content/language';
import { localizedPath } from '../routes';

/**
 * One case study, always in the same order: problem, decisions, result. The
 * page passes the id from its own route, so the URL and the content cannot
 * disagree.
 */
@Component({
  selector: 'app-case-study-view',
  imports: [RouterLink, CaseStudySection],
  styleUrl: './case-study-view.css',
  template: `
    <main class="wrap">
      <p class="back">
        <a [routerLink]="indexPath()">{{
          ui.caseStudies.backToIndex[language()]
        }}</a>
      </p>

      <header class="page-head">
        <p class="kicker">{{ study().meta[language()] }}</p>
        <h1 class="page-title">{{ study().title[language()] }}</h1>
        <p class="summary">{{ study().summary[language()] }}</p>
        <ul class="stack" [attr.aria-label]="ui.experience.stackLabel[language()]">
          @for (item of study().stack; track item) {
            <li>{{ item }}</li>
          }
        </ul>
        @if (repository(); as href) {
          <p class="repository">
            <span>{{ ui.caseStudies.repository[language()] }}:</span>
            <a [href]="href">{{ href }}</a>
          </p>
        }
        @if (study().confidentiality; as note) {
          <p class="note">{{ note[language()] }}</p>
        }
      </header>

      <div class="body">
        <app-case-study-section
          [heading]="ui.caseStudies.problem[language()]"
          [section]="study().problem"
          [language]="language()"
        />
        <app-case-study-section
          [heading]="ui.caseStudies.decisions[language()]"
          [section]="study().decisions"
          [language]="language()"
        />
        <app-case-study-section
          [heading]="ui.caseStudies.result[language()]"
          [section]="study().result"
          [language]="language()"
        />
      </div>
    </main>
  `,
})
export class CaseStudyView {
  readonly id = input.required<CaseStudyId>();
  readonly language = input.required<Language>();

  protected readonly ui = ui;
  protected readonly study = computed(() => {
    const study = caseStudies.caseStudies.find((entry) => entry.id === this.id());

    if (study === undefined) {
      throw new Error(`Unknown case study: ${this.id()}`);
    }

    return study;
  });
  protected readonly repository = computed(() => this.study().repository ?? null);
  protected readonly indexPath = computed(() =>
    localizedPath('/case-studies', this.language()),
  );
}
