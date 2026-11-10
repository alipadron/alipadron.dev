import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  PROJECT_ROOT,
  extractPdfText,
  normalize,
  runNpmOrThrow,
  runNpmScript,
} from './support/build-harness';

const PRERENDER_DIR = path.join(PROJECT_ROOT, 'dist/analog/public');
const ARTIFACTS_DIR = path.join(os.tmpdir(), `alipadron-bilingual-${process.pid}`);

// Kept as literals on purpose: these tests observe build outputs and never
// import the content module or its schema.
const EXPECTED = {
  company: 'GoFeels',
  en: {
    title: 'Senior Full-Stack Engineer',
    bullet: 'Built and maintained production web applications used by hotels.',
    experienceHeading: 'Experience',
    present: 'Present',
    location: 'Remote',
    homeLink: 'Read the experience',
  },
  es: {
    title: 'Ingeniero Full-Stack Senior',
    bullet: 'Construyó y mantuvo aplicaciones web en producción usadas por hoteles.',
    experienceHeading: 'Experiencia',
    present: 'Actualidad',
    location: 'Remoto',
    homeLink: 'Leer la experiencia',
  },
};

/** Prerendered pages, copied out of `dist/` before the fixtures rebuild it. */
const PAGES = [
  { source: 'index.html', artifact: 'home-en.html' },
  { source: 'es/index.html', artifact: 'home-es.html' },
  { source: 'experience/index.html', artifact: 'experience-en.html' },
  { source: 'es/experience/index.html', artifact: 'experience-es.html' },
];

function readArtifact(name: string): string {
  return readFileSync(path.join(ARTIFACTS_DIR, name), 'utf8');
}

/** The switcher's href, read from the prerendered markup of one page. */
function switcherHref(html: string): string {
  const switcher = html.match(
    /<app-language-switcher[\s\S]*?<\/app-language-switcher>/,
  );

  if (!switcher) {
    throw new Error('language switcher not found in page');
  }

  const href = switcher[0].match(/href="([^"]+)"/);

  if (!href) {
    throw new Error('language switcher has no link');
  }

  return href[1];
}

/** Resolves a site path to the HTML file a static host would serve for it. */
function prerenderedFile(href: string): string {
  const cleanPath = href.split('#')[0].split('?')[0];
  const relative = cleanPath.replace(/^\/|\/$/g, '');

  return path.join(PRERENDER_DIR, relative, 'index.html');
}

describe('build-level outputs', () => {
  beforeAll(() => {
    mkdirSync(ARTIFACTS_DIR, { recursive: true });

    runNpmOrThrow('build');

    for (const { source, artifact } of PAGES) {
      copyFileSync(
        path.join(PRERENDER_DIR, source),
        path.join(ARTIFACTS_DIR, artifact),
      );
    }

    runNpmOrThrow('pdf');

    for (const language of ['en', 'es']) {
      copyFileSync(
        path.join(PROJECT_ROOT, `output/cv-${language}-fullstack-ai.pdf`),
        path.join(ARTIFACTS_DIR, `cv-${language}-fullstack-ai.pdf`),
      );
    }
  });

  afterAll(() => {
    rmSync(ARTIFACTS_DIR, { recursive: true, force: true });

    // Fixture builds above write into the real dist/ directory, so the last
    // fixture would be what a local preview or a deploy sees. Restore the real
    // content once the assertions are done.
    runNpmScript('build');
  });

  it('prerenders the English Experience page from the content', () => {
    const html = readArtifact('experience-en.html');

    expect(html).toContain('<html lang="en">');
    expect(html).toContain(EXPECTED.company);
    expect(html).toContain(EXPECTED.en.title);
    expect(html).toContain(EXPECTED.en.bullet);
    expect(html).toContain(EXPECTED.en.experienceHeading);
    expect(html).toContain(EXPECTED.en.present);
  });

  it('prerenders the Spanish Experience page from the same content', () => {
    const html = readArtifact('experience-es.html');

    expect(html).toContain('<html lang="es">');
    expect(html).toContain(EXPECTED.company);
    expect(html).toContain(EXPECTED.es.title);
    expect(html).toContain(EXPECTED.es.bullet);
    expect(html).toContain(EXPECTED.es.experienceHeading);
    expect(html).toContain(EXPECTED.es.present);
    expect(html).toContain('Remoto');
  });

  it('prerenders both Home pages with language-specific links', () => {
    const english = readArtifact('home-en.html');
    const spanish = readArtifact('home-es.html');

    expect(english).toContain('<html lang="en">');
    expect(english).toContain(`href="/experience"`);
    expect(english).toContain(EXPECTED.en.homeLink);

    expect(spanish).toContain('<html lang="es">');
    expect(spanish).toContain(`href="/es/experience"`);
    expect(spanish).toContain(EXPECTED.es.homeLink);
  });

  it.each([
    { page: 'home-en.html', expectedHref: '/es' },
    { page: 'home-es.html', expectedHref: '/' },
    { page: 'experience-en.html', expectedHref: '/es/experience' },
    { page: 'experience-es.html', expectedHref: '/experience' },
  ])(
    'the language switcher on $page links to the equivalent page ($expectedHref)',
    ({ page, expectedHref }) => {
      expect(switcherHref(readArtifact(page))).toBe(expectedHref);
    },
  );

  it('every language switcher link resolves to a prerendered page', () => {
    for (const { artifact } of PAGES) {
      const href = switcherHref(readArtifact(artifact));

      expect(existsSync(prerenderedFile(href)), `${artifact} -> ${href}`).toBe(
        true,
      );
    }
  });

  it('produces the English Full-Stack + AI PDF with the role text', async () => {
    const text = await extractPdfText(
      path.join(ARTIFACTS_DIR, 'cv-en-fullstack-ai.pdf'),
    );

    expect(text).toContain(EXPECTED.company);
    expect(text).toContain(EXPECTED.en.title);
    expect(text).toContain(EXPECTED.en.bullet);
    expect(text).toContain(EXPECTED.en.experienceHeading);
    expect(text).toContain(EXPECTED.en.present);
    expect(text).toContain(EXPECTED.en.location);
  });

  it('produces the Spanish Full-Stack + AI PDF with the role text', async () => {
    const text = await extractPdfText(
      path.join(ARTIFACTS_DIR, 'cv-es-fullstack-ai.pdf'),
    );

    expect(text).toContain(EXPECTED.company);
    expect(text).toContain(EXPECTED.es.title);
    expect(text).toContain(EXPECTED.es.bullet);
    expect(text).toContain(EXPECTED.es.experienceHeading);
    expect(text).toContain(EXPECTED.es.present);
    expect(text).toContain(EXPECTED.es.location);
  });

  it('accepts mixed year and month date granularity', () => {
    const result = runNpmScript('build', {
      CONTENT_DIR: path.join(
        PROJECT_ROOT,
        'tests/fixtures/valid-mixed-dates',
      ),
    });

    expect(result.status, result.output).toBe(0);
  });

  it.each([
    {
      fixture: 'invalid-date',
      expectedFile: 'career.json',
      expectedDetail: 'startDate',
      expectedMessage: 'must be a year (YYYY) or a month (YYYY-MM)',
    },
    {
      fixture: 'invalid-translation',
      expectedFile: 'career.json',
      expectedDetail: 'title.es',
      expectedMessage: 'missing Spanish translation',
    },
    {
      fixture: 'invalid-ui-translation',
      expectedFile: 'ui.json',
      expectedDetail: 'home.experienceLink.es',
      expectedMessage: 'missing Spanish translation',
    },
  ])(
    'fails the build with a clear message for the $fixture fixture',
    ({ fixture, expectedFile, expectedDetail, expectedMessage }) => {
      const result = runNpmScript('build', {
        CONTENT_DIR: path.join(PROJECT_ROOT, 'tests/fixtures', fixture),
      });

      expect(result.status).not.toBe(0);
      expect(result.output).toContain('Invalid content in');
      expect(result.output).toContain(expectedFile);
      expect(result.output).toContain(expectedDetail);
      expect(result.output).toContain(expectedMessage);
    },
  );
});
