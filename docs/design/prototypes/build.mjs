#!/usr/bin/env node
// Renders the throwaway prototypes from the real career content.
//
//   node docs/design/prototypes/build.mjs
//
// Nothing here runs in the site build and nothing here is imported by the app.
// Once issue #14 picks a direction these files are deleted.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dossier from './build/dossier.mjs';
import * as editorial from './build/editorial.mjs';
import * as terminal from './build/terminal.mjs';

const here = dirname(fileURLToPath(import.meta.url));

const prototypes = [
  {
    dir: 'editorial',
    name: 'A — Editorial',
    summary: 'Typographic minimal, serif display, warm paper, one vermillion accent.',
    home: editorial.home,
    experience: editorial.experiencePage,
  },
  {
    dir: 'terminal',
    name: 'B — Terminal',
    summary: 'Monospace, prompt chrome, paper-printout light theme, phosphor dark theme.',
    home: terminal.home,
    experience: terminal.experiencePage,
  },
  {
    dir: 'dossier',
    name: 'C — Dossier',
    summary: 'Index-first: sticky rail, cards, cool neutrals, one blue accent.',
    home: dossier.home,
    experience: dossier.experiencePage,
  },
];

for (const prototype of prototypes) {
  const target = join(here, prototype.dir);

  writeFileSync(join(target, 'index.html'), prototype.home());
  writeFileSync(join(target, 'experience.html'), prototype.experience());
}

const cards = prototypes
  .map(
    (prototype) => `      <li>
        <h2>${prototype.name}</h2>
        <p>${prototype.summary}</p>
        <iframe src="${prototype.dir}/index.html" title="${prototype.name} home" loading="lazy"></iframe>
        <p class="links">
          <a href="${prototype.dir}/index.html">Home</a>
          <a href="${prototype.dir}/experience.html">Experience</a>
        </p>
      </li>`,
  )
  .join('\n');

writeFileSync(
  join(here, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Visual prototypes — alipadron.dev #13</title>
    <style>
      :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; padding: 2rem; background: #f6f7f9; color: #12161b; }
      @media (prefers-color-scheme: dark) { body { background: #0e1116; color: #e7ebf0; } header p { color: #9aa6b6 !important; } }
      header { max-width: 60rem; margin: 0 auto 2rem; }
      h1 { margin: 0 0 .5rem; font-size: 1.5rem; letter-spacing: -.02em; }
      header p { margin: 0; color: #5b6573; }
      ul { display: grid; grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); gap: 1.5rem; max-width: 80rem; margin: 0 auto; padding: 0; list-style: none; }
      li { border: 1px solid #dde2e8; border-radius: 12px; padding: 1rem; background: #fff; }
      @media (prefers-color-scheme: dark) { li { background: #151a21; border-color: #262e38; } }
      h2 { margin: 0 0 .25rem; font-size: 1rem; }
      li p { margin: 0 0 .75rem; font-size: .875rem; color: #5b6573; }
      @media (prefers-color-scheme: dark) { li p { color: #9aa6b6; } }
      iframe { display: block; width: 100%; height: 34rem; border: 1px solid #dde2e8; border-radius: 8px; background: #fff; }
      .links { display: flex; gap: 1rem; margin: .75rem 0 0; font-size: .875rem; }
      a { color: #1d4ed8; }
      @media (prefers-color-scheme: dark) { a { color: #93b4ff; } }
    </style>
  </head>
  <body>
    <header>
      <h1>Visual prototypes</h1>
      <p>Issue #13. Throwaway direction mocks built from the real English content. Theme follows your OS setting.</p>
    </header>
    <ul>
${cards}
    </ul>
  </body>
</html>
`,
);

console.log(
  `Rendered ${prototypes.length} prototypes: ${prototypes.map((p) => p.dir).join(', ')}`,
);
