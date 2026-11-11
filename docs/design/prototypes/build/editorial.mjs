// Prototype A — Editorial: type does the work, one accent, hairlines.
import {
  contact,
  cvHref,
  dates,
  en,
  experience,
  location,
  metrics,
  nav,
  profile,
  projects,
  siteName,
} from './content.mjs';
import { page } from './page.mjs';

const label = 'Prototype A — Editorial';

function header(current) {
  const links = nav
    .map(({ label: text, href }) => {
      if (href === null) {
        return `<span class="planned">${text}</span>`;
      }
      const current_ = href === current ? ' aria-current="page"' : '';

      return `<a href="${href}"${current_}>${text}</a>`;
    })
    .join('\n          ');

  return `<p class="proto">${label} · throwaway direction mock, not the site</p>
    <header class="masthead">
      <a class="wordmark" href="index.html">${siteName}</a>
      <nav aria-label="Primary">
          ${links}
      </nav>
    </header>`;
}

function footer() {
  return `<footer class="foot">
      <p class="foot-contact">
        <a href="mailto:${profile.email}">${profile.email}</a>
        <span aria-hidden="true">·</span>
        <a href="${profile.linkedin}">LinkedIn</a>
        <span aria-hidden="true">·</span>
        <a href="${profile.github}">GitHub</a>
      </p>
      <p class="foot-meta">English <span aria-hidden="true">·</span> <span class="planned">Español</span></p>
    </footer>`;
}

function stack(entry) {
  return `<ul class="stack" aria-label="Stack">
                  ${entry.stack.map((item) => `<li>${en(item)}</li>`).join('')}
                </ul>`;
}

function entry(entry, headingLevel) {
  return `<article class="entry">
            <div class="entry-meta">
              <p class="dates">${dates(entry)}</p>
              <p class="place">${location(entry)}</p>
            </div>
            <div class="entry-body">
              <h${headingLevel} class="entry-title">${en(entry.company)}</h${headingLevel}>
              <p class="entry-role">${en(entry.title)}</p>
              ${stack(entry)}
              <ul class="bullets">
                ${entry.bullets
                  .map((bullet) => `<li>${en(bullet.text)}</li>`)
                  .join('\n                ')}
              </ul>
            </div>
          </article>`;
}

export function home() {
  return page({
    title: `${siteName} — ${label}`,
    body: `    ${header('index.html')}

    <main class="wrap">
      <section class="hero">
        <div class="hero-copy">
          <p class="kicker">Remote <span aria-hidden="true">·</span> GMT-4</p>
          <h1>${siteName}</h1>
          <p class="headline">${en(profile.headline)}</p>
          <p class="summary">${en(profile.summary)}</p>
          <p class="actions">
            <a class="button" href="${cvHref}">Download the CV (PDF)</a>
            <a class="link" href="mailto:${profile.email}">Work with me</a>
          </p>
        </div>
        <figure class="portrait">
          <div class="portrait-frame" role="img" aria-label="Photo of Alí Padrón, coming later">
            <span>Photo</span>
          </div>
          <figcaption>Portrait to come.</figcaption>
        </figure>
      </section>

      <section class="numbers" aria-labelledby="numbers-heading">
        <h2 id="numbers-heading" class="section-label">By the numbers</h2>
        <dl>
          ${metrics
            .map(
              ({ value, label: text }) => `<div>
            <dt>${value}</dt>
            <dd>${text}</dd>
          </div>`,
            )
            .join('\n          ')}
        </dl>
      </section>

      <section class="closing">
        <h2 class="section-label">Read on</h2>
        <p class="closing-links">
          <a href="experience.html">The full experience</a>
          <span aria-hidden="true">·</span>
          <a href="${cvHref}">CV, one page</a>
          <span aria-hidden="true">·</span>
          <a href="mailto:${profile.email}">${profile.email}</a>
        </p>
      </section>
    </main>

${footer()}`,
  });
}

export function experiencePage() {
  return page({
    title: `Experience — ${siteName} — ${label}`,
    body: `    ${header('experience.html')}

    <main class="wrap">
      <header class="page-head">
        <p class="kicker">Since 2018</p>
        <h1>Experience</h1>
        <p class="summary">Angular and Laravel, hotels and payments, releases and production. Every role below is work I did, described the way I would defend it in an interview.</p>
      </header>

      <section aria-label="Roles">
        ${experience.map((entry_) => entry(entry_, 2)).join('\n\n        ')}
      </section>

      <section class="projects" aria-labelledby="projects-heading">
        <h2 id="projects-heading" class="section-label">Projects</h2>
        ${projects.map((entry_) => entry(entry_, 3)).join('\n\n        ')}
      </section>

      <section class="closing">
        <h2 class="section-label">Elsewhere</h2>
        <p class="closing-links">
          ${contact
            .map(({ label: text, href }) => `<a href="${href}">${text}</a>`)
            .join('\n          <span aria-hidden="true">·</span>\n          ')}
        </p>
        <p class="closing-links"><a href="${cvHref}">Download the CV (PDF)</a></p>
      </section>
    </main>

${footer()}`,
  });
}
