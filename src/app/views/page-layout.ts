import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, input, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { publicContactLinks } from '../../content/contact';
import { content, ui } from '../../content/index';
import type { Language } from '../../content/language';
import { localizedPath, type SitePath } from '../routes';
import { LanguageSwitcher } from '../components/language-switcher';

/**
 * Shared chrome for every page: the masthead, the language switcher and the
 * contact footer. Pages render their own `<main>` through content projection.
 */
@Component({
  selector: 'app-page-layout',
  imports: [RouterLink, LanguageSwitcher],
  styleUrl: './page-layout.css',
  template: `
    <header class="masthead">
      <div class="wrap masthead-inner">
        <a class="wordmark" [routerLink]="homePath()">{{
          ui.siteName[language()]
        }}</a>
        <div class="masthead-links">
          <nav class="primary-nav" [attr.aria-label]="ui.nav.label[language()]">
            <a
              [routerLink]="homePath()"
              [attr.aria-current]="isHome() ? 'page' : null"
              >{{ ui.nav.home[language()] }}</a
            >
            <a
              [routerLink]="experiencePath()"
              [attr.aria-current]="isExperience() ? 'page' : null"
              >{{ ui.experience.heading[language()] }}</a
            >
          </nav>
          <app-language-switcher [path]="path()" [language]="language()" />
        </div>
      </div>
    </header>
    <ng-content />
    <footer class="foot">
      <div class="wrap foot-inner">
        <p class="foot-name">{{ ui.siteName[language()] }}</p>
        <p class="foot-contact">
          @for (link of contact; track link.href) {
            <a [href]="link.href">{{ link.text }}</a>
          }
        </p>
      </div>
    </footer>
  `,
})
export class PageLayout implements OnInit {
  readonly path = input.required<SitePath>();
  readonly language = input.required<Language>();

  protected readonly ui = ui;
  protected readonly contact = publicContactLinks(content.profile);
  protected readonly homePath = computed(() =>
    localizedPath('/', this.language()),
  );
  protected readonly experiencePath = computed(() =>
    localizedPath('/experience', this.language()),
  );
  protected readonly isHome = computed(() => this.path() === '/');
  protected readonly isExperience = computed(
    () => this.path() === '/experience',
  );

  readonly #document = inject(DOCUMENT);

  ngOnInit(): void {
    this.#document.documentElement.lang = this.language();
  }
}
