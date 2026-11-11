import type {
  CvDocumentModel,
  CvEntryModel,
  CvSectionModel,
} from '../src/content/documents';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderContact(document: CvDocumentModel): string {
  const channels = document.contact.map(
    (link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.text)}</a>`,
  );

  if (document.phone) {
    channels.push(`<span class="phone">${escapeHtml(document.phone)}</span>`);
  }

  return channels.join(' · ');
}

function renderEntry(entry: CvEntryModel): string {
  const bullets = entry.bullets
    .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
    .join('\n            ');
  const concurrent = entry.concurrent
    ? `\n        <p class="concurrent">${escapeHtml(entry.concurrent)}</p>`
    : '';
  const bulletList =
    entry.bullets.length > 0
      ? `
        <ul>
            ${bullets}
        </ul>`
      : '';

  return `<section>
        <h3>${escapeHtml(entry.company)}</h3>
        <p><strong>${escapeHtml(entry.title)}</strong></p>
        <p class="entry-meta">${escapeHtml(entry.details)}</p>${concurrent}${bulletList}
      </section>`;
}

function renderSection(section: CvSectionModel): string {
  const renderedEntries = section.entries.map(renderEntry).join('\n      ');

  return `<h2>${escapeHtml(section.heading)}</h2>
      ${renderedEntries}`;
}

/**
 * Single-column, ATS-friendly HTML for one CV document. It is printed to PDF by
 * Playwright. The text comes from the shared document model, so the DOCX renderer
 * carries exactly the same content in the same order.
 */
export function renderCvHtml(document: CvDocumentModel): string {
  const sections = document.sections
    .map(renderSection)
    .join('\n\n      ');

  return `<!doctype html>
<html lang="${document.language}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(document.name)} — ${escapeHtml(document.variantLabel)}</title>
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
        margin-bottom: 0.25rem;
      }

      .contact {
        color: #444;
        font-size: 10pt;
        margin-bottom: 0.75rem;
      }

      .summary {
        margin-bottom: 1.25rem;
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
      <h1>${escapeHtml(document.name)}</h1>
      <p class="variant">${escapeHtml(document.variantLabel)}</p>
      <p class="contact">${renderContact(document)}</p>
      <p class="summary">${escapeHtml(document.summary)}</p>
    </header>

    <main>
      ${sections}
    </main>
  </body>
</html>
`;
}
