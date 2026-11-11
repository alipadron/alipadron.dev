import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Language } from '../../content/language';
import { ui } from '../../content/index';
import { languageName, otherLanguage } from '../i18n';
import { localizedPath, type SitePath } from '../routes';

/**
 * Links to the equivalent page in the other language. The page passes its
 * canonical (English) path, so the switcher never has to parse the current URL.
 */
@Component({
  selector: 'app-language-switcher',
  imports: [RouterLink],
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .language-switcher {
        display: inline-flex;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      a:hover {
        color: var(--accent);
      }
    `,
  ],
  template: `
    <nav
      class="language-switcher"
      [attr.aria-label]="ui.languageSwitcher.label[language()]"
    >
      <a
        [routerLink]="targetPath()"
        [attr.hreflang]="targetLanguage()"
        [attr.lang]="targetLanguage()"
        [attr.aria-label]="switchLabel()"
        >{{ languageName(targetLanguage()) }}</a
      >
    </nav>
  `,
})
export class LanguageSwitcher {
  readonly path = input.required<SitePath>();
  readonly language = input.required<Language>();

  protected readonly ui = ui;
  protected readonly languageName = languageName;
  protected readonly targetLanguage = computed(() =>
    otherLanguage(this.language()),
  );
  protected readonly targetPath = computed(() =>
    localizedPath(this.path(), this.targetLanguage()),
  );
  protected readonly switchLabel = computed(
    () =>
      `${ui.languageSwitcher.switchTo[this.language()]} ${languageName(this.targetLanguage())}`,
  );
}
