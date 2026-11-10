import type { Role } from '../src/content/schema';
import {
  formatDateRange,
  formatLocationModel,
  orderedBullets,
} from '../src/content/presentation';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderRole(role: Role): string {
  const bullets = orderedBullets(role)
    .map((bullet) => `<li>${escapeHtml(bullet.text.en)}</li>`)
    .join('\n            ');

  return `<section>
        <h2>${escapeHtml(role.company.en)}</h2>
        <p><strong>${escapeHtml(role.title.en)}</strong></p>
        <p class="role-meta">${escapeHtml(formatDateRange(role))} · ${escapeHtml(formatLocationModel(role.locationModel))} · ${escapeHtml(role.stack.join(', '))}</p>
        <ul>
            ${bullets}
        </ul>
      </section>`;
}

/**
 * Single-column, ATS-friendly HTML for the Full-Stack + AI CV. It is printed to
 * PDF by Playwright; the same content module feeds the site page.
 */
export function renderCvHtml(roles: readonly Role[]): string {
  const renderedRoles = roles.map(renderRole).join('\n      ');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Alí Padrón — Full-Stack + AI</title>
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

      .role-meta {
        color: #444;
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
      <h1>Alí Padrón</h1>
      <p class="variant">Full-Stack + AI</p>
    </header>

    <main>
      <h2>Experience</h2>
      ${renderedRoles}
    </main>
  </body>
</html>
`;
}
