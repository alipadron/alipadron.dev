import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { publicContactLinks } from '../../content/contact';
import { content, pages } from '../../content/index';
import type { Language } from '../../content/language';
import type { ContentPageId } from '../../content/schema';
import { localizedPath, type SitePath } from '../routes';

/**
 * Renders one of the long-form pages: How I work, Work with me or Contact.
 *
 * The page content is validated data, not markup, so both languages come from
 * the same structure and a missing translation fails the build. Blocks are a
 * small closed vocabulary; this component is the only place that decides how
 * each one looks.
 */
@Component({
  selector: 'app-document-view',
  imports: [RouterLink],
  styleUrl: './document-view.css',
  template: `
    <main class="wrap">
      <header class="page-head">
        <p class="kicker">{{ pageContent().kicker[language()] }}</p>
        <h1 class="page-title">{{ pageContent().title[language()] }}</h1>
        <p class="intro">{{ pageContent().intro[language()] }}</p>
      </header>

      @for (section of pageContent().sections; track section.id) {
        <section
          class="doc-section"
          [attr.aria-labelledby]="section.id + '-heading'"
        >
          <h2 [id]="section.id + '-heading'" class="section-label">
            {{ section.heading[language()] }}
          </h2>

          @for (block of section.blocks; track $index) {
            @switch (block.type) {
              @case ('paragraph') {
                <p class="prose">{{ block.text[language()] }}</p>
              }
              @case ('list') {
                <ul class="prose-list">
                  @for (item of block.items; track $index) {
                    <li>{{ item[language()] }}</li>
                  }
                </ul>
              }
              @case ('terms') {
                <dl class="terms">
                  @for (item of block.items; track $index) {
                    <div class="term">
                      <dt>{{ item.term[language()] }}</dt>
                      <dd>{{ item.description[language()] }}</dd>
                    </div>
                  }
                </dl>
              }
              @case ('steps') {
                <ol class="steps">
                  @for (item of block.items; track $index) {
                    <li>
                      <div>
                        <h3 class="step-title">{{ item.term[language()] }}</h3>
                        <p class="step-text">
                          {{ item.description[language()] }}
                        </p>
                      </div>
                    </li>
                  }
                </ol>
              }
              @case ('contact') {
                <ul class="contact-list">
                  @for (link of contactLinks; track link.href) {
                    <li><a [href]="link.href">{{ link.text }}</a></li>
                  }
                </ul>
              }
              @case ('pageLink') {
                <p class="prose">
                  <a [routerLink]="pageHref(block.page)">{{
                    block.label[language()]
                  }}</a>
                </p>
              }
              @case ('action') {
                <p class="actions">
                  <a class="button" [href]="emailHref">{{
                    block.label[language()]
                  }}</a>
                </p>
              }
            }
          }
        </section>
      }
    </main>
  `,
})
export class DocumentView {
  readonly page = input.required<ContentPageId>();
  readonly language = input.required<Language>();

  protected readonly pageContent = computed(() => pages[this.page()]);
  protected readonly contactLinks = publicContactLinks(content.profile);
  protected readonly emailHref = `mailto:${content.profile.email}`;

  protected pageHref(page: ContentPageId): string {
    // The content page ids are routes: `/how-i-work`, `/work-with-me`, …
    return localizedPath(`/${page}` as SitePath, this.language());
  }
}
