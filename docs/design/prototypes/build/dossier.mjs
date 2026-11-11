// Prototype C — Dossier: index-first. A sticky rail, cards, one blue accent.
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

const label = 'Prototype C — Dossier';

const rail = [
  ...nav.map((item, index) => ({
    ...item,
    number: String(index + 1).padStart(2, '0'),
  })),
];

function header(current) {
  const links = rail
    .map(({ label: text, href, number }) => {
      if (href === null) {
        return `<span class="planned"><span class="n">${number}</span>${text}</span>`;
      }
      const current_ = href === current ? ' aria-current="page"' : '';

      return `<a href="${href}"${current_}><span class="n">${number}</span>${text}</a>`;
    })
    .join('\n        ');

  return `<p class="proto">${label} · throwaway direction mock, not the site</p>

  <div class="shell">
    <aside class="rail">
      <div class="rail-top">
        <a class="brand" href="index.html">${siteName}</a>
        <p class="rail-role">Senior full-stack engineer</p>
      </div>
      <nav aria-label="Primary">
        ${links}
      </nav>
      <div class="rail-foot">
        <p>Remote <span aria-hidden="true">·</span> GMT-4</p>
        <a href="mailto:${profile.email}">${profile.email}</a>
        <p>EN <span aria-hidden="true">·</span> <span class="planned">ES (soon)</span></p>
      </div>
    </aside>

    <main>`;
}

function footer() {
  return `      <footer class="foot">
        ${contact.map(({ label: text, href }) => `<a href="${href}">${text}</a>`).join('\n        ')}
        <p class="foot-note">Throwaway prototype for issue #13.</p>
      </footer>
    </main>
  </div>`;
}

function chips(entry) {
  return `<ul class="chips" aria-label="Stack">
            ${entry.stack.map((item) => `<li>${en(item)}</li>`).join('\n            ')}
          </ul>`;
}

function card(entry, headingLevel) {
  return `<article class="card" id="${entry.id}">
          <div class="card-head">
            <h${headingLevel}>${en(entry.company)}</h${headingLevel}>
            <p class="card-role">${en(entry.title)}</p>
            <p class="card-meta"><span>${dates(entry)}</span><span>${location(entry)}</span></p>
          </div>
          ${chips(entry)}
          <ul class="bullets">
            ${entry.bullets
              .map((bullet) => `<li>${en(bullet.text)}</li>`)
              .join('\n            ')}
          </ul>
        </article>`;
}

export function home() {
  return page({
    title: `${siteName} — ${label}`,
    body: `${header('index.html')}
      <header class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Remote <span aria-hidden="true">·</span> GMT-4</p>
          <h1>${siteName}</h1>
          <p class="headline">${en(profile.headline)}</p>
          <p class="summary">${en(profile.summary)}</p>
          <p class="actions">
            <a class="button" href="${cvHref}">Download the CV (PDF)</a>
            <a class="button button-quiet" href="mailto:${profile.email}">Work with me</a>
          </p>
        </div>
        <div class="portrait" role="img" aria-label="Photo of Alí Padrón, coming later">
          <span>Photo</span>
        </div>
      </header>

      <section class="block" aria-labelledby="numbers-heading">
        <h2 id="numbers-heading">By the numbers</h2>
        <div class="stats">
          ${metrics
            .map(
              ({ value, label: text }) =>
                `<div class="stat"><p class="stat-value">${value}</p><p class="stat-label">${text}</p></div>`,
            )
            .join('\n          ')}
        </div>
      </section>

      <section class="block" aria-labelledby="recent-heading">
        <h2 id="recent-heading">Recent</h2>
        <ul class="recent">
          ${experience
            .slice(0, 3)
            .map(
              (entry) => `<li>
            <a href="experience.html#${entry.id}">
              <span class="recent-top"><strong>${en(entry.company)}</strong><span class="recent-dates">${dates(entry)}</span></span>
              <span class="recent-role">${en(entry.title)}</span>
            </a>
          </li>`,
            )
            .join('\n          ')}
        </ul>
        <p class="more"><a href="experience.html">All roles, 2018 → today</a></p>
      </section>

${footer()}`,
  });
}

export function experiencePage() {
  return page({
    title: `Experience — ${siteName} — ${label}`,
    body: `${header('experience.html')}
      <header class="page-head">
        <p class="eyebrow">Since 2018</p>
        <h1>Experience</h1>
        <p class="summary">Angular and Laravel, hotels and payments, releases and production. Every role below is work I did, described the way I would defend it in an interview.</p>
      </header>

      <section class="entries" aria-label="Roles">
        ${experience.map((entry_) => card(entry_, 2)).join('\n\n        ')}
      </section>

      <section class="block" aria-labelledby="projects-heading">
        <h2 id="projects-heading">Projects</h2>
        <div class="entries">
          ${projects.map((entry_) => card(entry_, 3)).join('\n\n          ')}
        </div>
      </section>

${footer()}`,
  });
}
