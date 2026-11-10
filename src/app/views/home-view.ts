import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ui } from '../../content/index';
import type { Language } from '../../content/language';
import { localizedPath } from '../i18n';

@Component({
  selector: 'app-home-view',
  imports: [RouterLink],
  template: `
    <main>
      <h1>{{ ui.home.heading[language()] }}</h1>
      <p>
        <a [routerLink]="experienceLink()">{{
          ui.home.experienceLink[language()]
        }}</a>
      </p>
    </main>
  `,
})
export class HomeView {
  readonly language = input.required<Language>();

  protected readonly ui = ui;
  protected readonly experienceLink = computed(() =>
    localizedPath('/experience', this.language()),
  );
}
