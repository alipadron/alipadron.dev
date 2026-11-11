import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Portrait } from '../components/portrait';
import {
  publishedCvHref,
  publishedDocumentFor,
} from '../../content/documents';
import { content, ui } from '../../content/index';
import type { Language } from '../../content/language';
import { localizedPath } from '../routes';

@Component({
  selector: 'app-home-view',
  imports: [RouterLink, Portrait],
  styleUrl: './home-view.css',
  template: `
    <main class="wrap">
      <section class="hero">
        <div class="hero-copy">
          <p class="kicker">{{ ui.home.kicker[language()] }}</p>
          <h1 class="display">{{ ui.home.heading[language()] }}</h1>
          <p class="headline">{{ content.profile.headline[language()] }}</p>
          <p class="summary">{{ content.profile.summary[language()] }}</p>
          <p class="actions">
            @if (cvHref(); as href) {
              <a class="button" [href]="href" download>{{
                ui.cv.download[language()]
              }}</a>
            }
            <a class="link" [href]="workWithMeHref()">{{
              ui.home.workWithMe[language()]
            }}</a>
          </p>
        </div>
        <app-portrait
          [src]="photoSrc"
          [alt]="ui.home.photoAlt[language()]"
          [caption]="ui.home.photoCaption[language()]"
          [placeholder]="ui.home.photoPlaceholder[language()]"
        />
      </section>

      <section class="numbers" aria-labelledby="numbers-heading">
        <h2 id="numbers-heading" class="section-label">
          {{ ui.home.metricsHeading[language()] }}
        </h2>
        <dl>
          @for (metric of content.metrics; track metric.id) {
            <div>
              <dt>{{ metric.value }}</dt>
              <dd>{{ metric.label[language()] }}</dd>
            </div>
          }
        </dl>
      </section>

      <section class="closing" aria-labelledby="read-on-heading">
        <h2 id="read-on-heading" class="section-label">
          {{ ui.home.readOn[language()] }}
        </h2>
        <p class="closing-links">
          <a [routerLink]="experienceLink()">{{
            ui.home.experienceLink[language()]
          }}</a>
          <a [href]="workWithMeHref()">{{ content.profile.email }}</a>
        </p>
      </section>
    </main>
  `,
})
export class HomeView {
  readonly language = input.required<Language>();

  protected readonly content = content;
  protected readonly ui = ui;

  /**
   * Replace with the public path of a real photo (for example
   * `/img/ali-padron.jpg`). The Portrait component reserves the frame either
   * way, so the layout does not shift when the image arrives.
   */
  protected readonly photoSrc: string | null = null;

  protected readonly experienceLink = computed(() =>
    localizedPath('/experience', this.language()),
  );
  protected readonly cvHref = computed(() => {
    const document = publishedDocumentFor(this.language());

    return document ? publishedCvHref(document) : null;
  });
  protected readonly workWithMeHref = computed(
    () => `mailto:${content.profile.email}`,
  );
}
