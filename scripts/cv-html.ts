import type { Language } from '../src/content/language';
import {
  CONCURRENT_LABEL,
  formatDateRange,
  formatLocationModel,
  VARIANT_LABELS,
  type SelectedEntry,
  type VariantCv,
} from '../src/content/presentation';
import type { UiStrings } from '../src/content/schema';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderEntry(entry: SelectedEntry, language: Language): string {
  const bullets = entry.bullets
    .map((bullet) => `<li>${escapeHtml(bullet.text[language])}</li>`)
    .join('\n            ');
  const concurrent = entry.concurrent
    ? `\n        <p class="concurrent">${escapeHtml(CONCURRENT_LABEL[language])}</p>`
    : '';
  const bulletList =
    entry.bullets.length > 0
      ? `
        <ul>
            ${bullets}
        </ul>`
      : '';

  return `<section>
        <h3>${escapeHtml(entry.company[language])}</h3>
        <p><strong>${escapeHtml(entry.title[language])}</strong></p>
        <p class="entry-meta">${escapeHtml(formatDateRange(entry, language))} · ${escapeHtml(formatLocationModel(entry.locationModel, language))} · ${escapeHtml(entry.stack.join(', '))}</p>${concurrent}${bulletList}
      </section>`;
}

function renderSection(
  title: string,
  entries: readonly SelectedEntry[],
  language: Language,
): string {
  const renderedEntries = entries
    .map((entry) => renderEntry(entry, language))
    .join('\n      ');
  return `<h2>${escapeHtml(title)}</h2>
      ${renderedEntries}`;
}

/**
 * Single-column, ATS-friendly HTML for one CV document. It is printed to PDF by
 * Playwright; the same selected content feeds the site pages.
 */
export function renderCvHtml(
  cv: VariantCv,
  language: Language,
  ui: UiStrings,
): string {
  const variantLabel = VARIANT_LABELS[cv.variant][language];
  const sections = [
    ...(cv.experience.length > 0
      ? [
          renderSection(
            ui.experience.heading[language],
            cv.experience,
            language,
          ),
        ]
      : []),
    ...(cv.projects.length > 0
      ? [renderSection(ui.projects.heading[language], cv.projects, language)]
      : []),
  ].join('\n\n      ');

  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(ui.siteName[language])} — ${escapeHtml(variantLabel)}</title>
    <style>
      @page {
        margin: 18mm;
      }

      body {
        color: #111;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11pt;
        line-height: 1.45;
      }

      h1 {
        font-size: 22pt;
        margin: 0 0 0.25rem;
      }

      h2 {
        font-size: 14pt;
        margin: 1.25rem 0 0.5rem;
      }

      h3 {
        font-size: 13pt;
        margin: 0 0 0.15rem;
      }

      p {
        margin: 0.15rem 0;
      }

      .variant {
        color: #444;
        font-size: 12pt;
        margin-bottom: 1.5rem;
      }

      .entry-meta,
      .concurrent {
        color: #444;
      }

      .entry-meta {
        margin-bottom: 0.5rem;
      }

      section + section {
        margin-top: 1rem;
      }

      ul {
        margin: 0.4rem 0 0;
        padding-left: 1.2rem;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>${escapeHtml(ui.siteName[language])}</h1>
      <p class="variant">${escapeHtml(variantLabel)}</p>
    </header>

    <main>
      ${sections}
    </main>
  </body>
</html>
`;
}
