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
      <section class="hero" [class.with-photo]="photoSrc">
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
            <a class="link" [routerLink]="contactLink()">{{
              ui.home.contact[language()]
            }}</a>
          </p>
        </div>
        @if (photoSrc; as src) {
          <app-portrait [src]="src" [alt]="ui.home.photoAlt[language()]" />
        }
      </section>

      <section class="closing" aria-labelledby="read-on-heading">
        <h2 id="read-on-heading" class="section-label">
          {{ ui.home.readOn[language()] }}
        </h2>
        <p class="closing-links">
          <a [routerLink]="experienceLink()">{{
            ui.home.experienceLink[language()]
          }}</a>
          <a [href]="emailHref">{{ content.profile.email }}</a>
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
   * Set to the public path of a real photo (for example `/img/ali-padron.jpg`)
   * to show the portrait. While it is null the hero is a single column with no
   * placeholder.
   */
  protected readonly photoSrc: string | null = null;

  protected readonly experienceLink = computed(() =>
    localizedPath('/experience', this.language()),
  );
  protected readonly contactLink = computed(() =>
    localizedPath('/contact', this.language()),
  );
  protected readonly cvHref = computed(() => {
    const document = publishedDocumentFor(this.language());

    return document ? publishedCvHref(document) : null;
  });
  protected readonly emailHref = `mailto:${content.profile.email}`;
}
