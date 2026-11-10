import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { publicContactLinks } from '../../content/contact';
import { content, ui } from '../../content/index';
import type { Language } from '../../content/language';
import { localizedPath } from '../routes';

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
      <p class="contact">
        @for (link of contact; track link.href) {
          <a [href]="link.href">{{ link.text }}</a>
          @if (!$last) {
            <span aria-hidden="true"> · </span>
          }
        }
      </p>
    </main>
  `,
})
export class HomeView {
  readonly language = input.required<Language>();

  protected readonly ui = ui;
  protected readonly contact = publicContactLinks(content.profile);
  protected readonly experienceLink = computed(() =>
    localizedPath('/experience', this.language()),
  );
}
