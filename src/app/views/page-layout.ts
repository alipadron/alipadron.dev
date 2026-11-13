import { DOCUMENT } from '@angular/common';
import { Component, inject, input, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { publicContactLinks } from '../../content/contact';
import { content, ui } from '../../content/index';
import type { Language } from '../../content/language';
import { applyPageMetadata } from '../head';
import { localizedPath, type SitePath } from '../routes';
import { pageMetadata } from '../seo';
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
        <a class="wordmark" [routerLink]="pathFor('/')">{{
          ui.siteName[language()]
        }}</a>
        <div class="masthead-links">
          <nav class="primary-nav" [attr.aria-label]="ui.nav.label[language()]">
            <a
              [routerLink]="pathFor('/')"
              [attr.aria-current]="current('/')"
              >{{ ui.nav.home[language()] }}</a
            >
            <a
              [routerLink]="pathFor('/experience')"
              [attr.aria-current]="current('/experience')"
              >{{ ui.experience.heading[language()] }}</a
            >
            <a
              [routerLink]="pathFor('/contact')"
              [attr.aria-current]="current('/contact')"
              >{{ ui.nav.contact[language()] }}</a
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

  readonly #document = inject(DOCUMENT);

  /** The path of a page in the language this layout is rendering. */
  protected pathFor(path: SitePath): string {
    return localizedPath(path, this.language());
  }

  /** `aria-current` for the page that is being rendered, `null` otherwise. */
  protected current(path: SitePath): 'page' | null {
    return this.path() === path ? 'page' : null;
  }

  ngOnInit(): void {
    applyPageMetadata(
      this.#document,
      pageMetadata(this.path(), this.language(), { ui }),
    );
  }
}
