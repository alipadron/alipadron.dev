import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, input, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ui } from '../../content/index';
import type { Language } from '../../content/language';
import { localizedPath, type SitePath } from '../routes';
import { LanguageSwitcher } from '../components/language-switcher';

/**
 * Shared chrome for every page: the brand link, the language switcher and the
 * document language. Pages render their own `<main>` through content
 * projection.
 */
@Component({
  selector: 'app-page-layout',
  imports: [RouterLink, LanguageSwitcher],
  template: `
    <header>
      <nav>
        <a [routerLink]="homePath()">{{ ui.siteName[language()] }}</a>
      </nav>
      <app-language-switcher [path]="path()" [language]="language()" />
    </header>
    <ng-content />
  `,
})
export class PageLayout implements OnInit {
  readonly path = input.required<SitePath>();
  readonly language = input.required<Language>();

  protected readonly ui = ui;
  protected readonly homePath = computed(() =>
    localizedPath('/', this.language()),
  );

  readonly #document = inject(DOCUMENT);

  ngOnInit(): void {
    this.#document.documentElement.lang = this.language();
  }
}
