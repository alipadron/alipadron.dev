import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { CaseStudyId } from '../../content/case-studies';
import { caseStudies, ui } from '../../content/index';
import type { Language } from '../../content/language';
import { caseStudyPath, localizedPath } from '../routes';

/** The index: every case study as a title, a summary and its stack. */
@Component({
  selector: 'app-case-studies-view',
  imports: [RouterLink],
  styleUrl: './case-studies-view.css',
  template: `
    <main class="wrap">
      <header class="page-head">
        <p class="kicker">{{ ui.caseStudies.kicker[language()] }}</p>
        <h1 class="page-title">{{ ui.caseStudies.heading[language()] }}</h1>
        <p class="summary">{{ ui.caseStudies.intro[language()] }}</p>
      </header>

      <ul class="study-list">
        @for (study of studies; track study.id) {
          <li>
            <article class="study">
              <h2 class="study-title">
                <a [routerLink]="pathOf(study.id)">{{ study.title[language()] }}</a>
              </h2>
              <p class="study-summary">{{ study.summary[language()] }}</p>
              <ul
                class="stack"
                [attr.aria-label]="ui.experience.stackLabel[language()]"
              >
                @for (item of study.stack; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
              <a class="link" [routerLink]="pathOf(study.id)">{{
                ui.caseStudies.readStudy[language()]
              }}</a>
            </article>
          </li>
        }
      </ul>
    </main>
  `,
})
export class CaseStudiesView {
  readonly language = input.required<Language>();

  protected readonly ui = ui;
  protected readonly studies = caseStudies.caseStudies;

  protected pathOf(id: CaseStudyId): string {
    return localizedPath(caseStudyPath(id), this.language());
  }
}
