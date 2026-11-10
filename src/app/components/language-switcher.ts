import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Language } from '../../content/language';
import { ui } from '../../content/index';
import { languageName, localizedPath, otherLanguage } from '../i18n';

/**
 * Links to the equivalent page in the other language. The page passes its
 * canonical (English) path, so the switcher never has to parse the current URL.
 */
@Component({
  selector: 'app-language-switcher',
  imports: [RouterLink],
  template: `
    <nav [attr.aria-label]="ui.languageSwitcher.label[language()]">
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
  readonly path = input.required<string>();
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
