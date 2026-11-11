// Prototype B — Terminal: one monospace face, prompt chrome, a paper printout.
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

const label = 'Prototype B — Terminal';

function header(current, path) {
  const links = nav
    .map(({ label: text, href }) => {
      if (href === null) {
        return `<span class="planned">${text}</span>`;
      }
      const current_ = href === current ? ' aria-current="page"' : '';

      return `<a href="${href}"${current_}>${text}</a>`;
    })
    .join('\n        ');

  return `<p class="proto">${label} · throwaway direction mock, not the site</p>

    <div class="window">
      <div class="topbar">
        <span class="dots" aria-hidden="true"></span>
        <span class="host">alipadron@dev</span>
        <span class="lang">en</span>
      </div>

      <nav class="tabs" aria-label="Primary">
        ${links}
      </nav>

      <main>
        <p class="prompt">alipadron@dev:<span class="path">~/${path}</span><span class="dollar">$</span></p>`;
}

function footer() {
  return `      </main>

      <footer class="status">
        <span>${contact.map(({ label: text, href }) => `<a href="${href}">${text}</a>`).join(' <span aria-hidden="true">·</span> ')}</span>
        <span>remote <span aria-hidden="true">·</span> GMT-4 <span aria-hidden="true">·</span> <span class="planned">ES (soon)</span></span>
      </footer>
    </div>`;
}

function promptLine(command, comment) {
  return `<p class="prompt"><span class="dollar">$</span> <span class="cmd">${command}</span>${
    comment ? ` <span class="comment"># ${comment}</span>` : ''
  }</p>`;
}

function stack(entry) {
  return `<p class="stack"><span class="key">stack:</span> ${entry.stack
    .map((item) => en(item))
    .join(', ')}</p>`;
}

function entry(entry, headingLevel, index) {
  return `<article class="entry">
          <p class="entry-meta">
            <span class="idx">#${String(index).padStart(2, '0')}</span>
            <span>${dates(entry)}</span>
            <span class="dim">${location(entry)}</span>
          </p>
          <h${headingLevel} class="entry-title">${en(entry.company)}</h${headingLevel}>
          <p class="entry-role">${en(entry.title)}</p>
          ${stack(entry)}
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
    body: `${header('index.html', 'home')}

        <h1>${siteName}</h1>
        <p class="headline">${en(profile.headline)}</p>
        <p class="summary">${en(profile.summary)}</p>

        <p class="call"><span class="dollar">$</span> ./work-with-me <a class="button" href="mailto:${profile.email}">hire --remote</a> <a class="button" href="${cvHref}">cv.pdf</a></p>

        ${promptLine('cat metrics.txt')}
        <dl class="metrics">
          ${metrics
            .map(
              ({ value, label: text }) =>
                `<div><dt>${value}</dt><dd>${text}</dd></div>`,
            )
            .join('\n          ')}
        </dl>

        ${promptLine('ls')}
        <ul class="ls">
          <li><a href="experience.html">experience/</a><span class="comment"># roles, 2018 → today</span></li>
          <li><a href="${cvHref}">cv-en-fullstack-ai.pdf</a></li>
          <li><a href="mailto:${profile.email}">${profile.email}</a></li>
        </ul>

        <p class="prompt"><span class="dollar">$</span> <span class="cursor" aria-hidden="true">▌</span></p>
${footer()}`,
  });
}

export function experiencePage() {
  return page({
    title: `Experience — ${siteName} — ${label}`,
    body: `${header('experience.html', 'experience')}

        <h1>Experience</h1>

        ${promptLine('cat experience.log', 'current first')}
        <section aria-label="Roles">
        ${experience.map((entry_, index) => entry(entry_, 2, index + 1)).join('\n\n        ')}
        </section>

        ${promptLine('cat projects.log')}
        <section aria-label="Projects">
        ${projects.map((entry_, index) => entry(entry_, 3, index + 1)).join('\n\n        ')}
        </section>

        <p class="prompt"><span class="dollar">$</span> <span class="cursor" aria-hidden="true">▌</span></p>
${footer()}`,
  });
}
