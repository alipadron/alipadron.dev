import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  PROJECT_ROOT,
  extractPdfText,
  runNpmOrThrow,
  runNpmScript,
} from './support/build-harness';

const PRERENDER_DIR = path.join(PROJECT_ROOT, 'dist/analog/public');
const ARTIFACTS_DIR = path.join(os.tmpdir(), `alipadron-variants-${process.pid}`);
const VARIANT_FIXTURE_DIR = path.join(PROJECT_ROOT, 'tests/fixtures/variants');
const VARIANT_OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'variant-fixture');

const CV_VARIANTS = ['fullstack-ai', 'tech-lead', 'freelance'] as const;
type CvVariant = (typeof CV_VARIANTS)[number];

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

const FIXTURE_TEXT = {
  shared: 'Shared engagement bullet shown in every CV.',
  reordered: 'Shared engagement bullet moved first for Tech Lead.',
  freelanceOnly: 'Freelance-only contract audit bullet.',
  techLeadOnly: 'Tech-Lead-only release ownership bullet.',
  concurrent: 'Concurrent venture bullet.',
  tuapplicaya: 'Tuapplicaya pre-launch bullet.',
  taggedEntry: 'Tagged Only Company',
  techLeadTitle: 'Co-founder & Technical Lead',
  concurrentLabel: 'Concurrent engagement',
};

/** Prerendered pages, copied out of `dist/` before the fixtures rebuild it. */
const PAGES = [
  { source: 'index.html', artifact: 'home-en.html' },
  { source: 'es/index.html', artifact: 'home-es.html' },
  { source: 'experience/index.html', artifact: 'experience-en.html' },
  { source: 'es/experience/index.html', artifact: 'experience-es.html' },
];

type NpmResult = ReturnType<typeof runNpmScript>;

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

function artifactPdfText(name: string): Promise<string> {
  return extractPdfText(path.join(ARTIFACTS_DIR, name));
}

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

function expectFailure(result: NpmResult): void {
  expect(result.status, result.output).not.toBe(0);
  expect(result.output).toContain('Invalid content in');
  expect(result.output).toContain('career.json');
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

    for (const variant of CV_VARIANTS) {
      copyFileSync(
        path.join(PROJECT_ROOT, `output/cv-en-${variant}.pdf`),
        path.join(ARTIFACTS_DIR, `cv-en-${variant}.pdf`),
      );
    }

    copyFileSync(
      path.join(PROJECT_ROOT, 'output/cv-es-fullstack-ai.pdf'),
      path.join(ARTIFACTS_DIR, 'cv-es-fullstack-ai.pdf'),
    );
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

  it('produces the three English CVs from the same content', async () => {
    for (const variant of CV_VARIANTS) {
      const text = await artifactPdfText(`cv-en-${variant}.pdf`);

      expect(text, variant).toContain(EXPECTED.company);
      expect(text, variant).toContain(EXPECTED.en.title);
      expect(text, variant).toContain(EXPECTED.en.bullet);
    }
  });

  it('produces the English Full-Stack + AI PDF with the role text', async () => {
    const text = await artifactPdfText('cv-en-fullstack-ai.pdf');

    expect(text).toContain(EXPECTED.company);
    expect(text).toContain(EXPECTED.en.title);
    expect(text).toContain(EXPECTED.en.bullet);
    expect(text).toContain(EXPECTED.en.experienceHeading);
    expect(text).toContain(EXPECTED.en.present);
    expect(text).toContain(EXPECTED.en.location);
  });

  it('produces the Spanish Full-Stack + AI PDF with the role text', async () => {
    const text = await artifactPdfText('cv-es-fullstack-ai.pdf');

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
    {
      fixture: 'unknown-variant',
      expectedFile: 'career.json',
      expectedDetail: 'entries.0.variants.0',
      expectedMessage: 'unknown variant',
    },
    {
      fixture: 'mismatched-override',
      expectedFile: 'career.json',
      expectedDetail: 'entries.0.placementByVariant.fullstack-ai',
      expectedMessage: 'must belong to one of the entry variants',
    },
  ])(
    'fails the build with a clear message for the $fixture fixture',
    ({ fixture, expectedFile, expectedDetail, expectedMessage }) => {
      const result = runNpmScript('build', {
        CONTENT_DIR: path.join(PROJECT_ROOT, 'tests/fixtures', fixture),
      });

      expect(result.status, result.output).not.toBe(0);
      expect(result.output).toContain('Invalid content in');
      expect(result.output).toContain(expectedFile);
      expect(result.output).toContain(expectedDetail);
      expect(result.output).toContain(expectedMessage);
    },
  );
});

describe('variant engine with fixture content', () => {
  const pdfTexts = {} as Record<CvVariant, string>;

  beforeAll(async () => {
    runNpmOrThrow('pdf', {
      CONTENT_DIR: VARIANT_FIXTURE_DIR,
      OUTPUT_DIR: VARIANT_OUTPUT_DIR,
    });

    for (const variant of CV_VARIANTS) {
      pdfTexts[variant] = await extractPdfText(
        path.join(VARIANT_OUTPUT_DIR, `cv-en-${variant}.pdf`),
      );
    }
  });

  it('includes entries and bullets without a variants field in every variant', () => {
    for (const variant of CV_VARIANTS) {
      expect(pdfTexts[variant], variant).toContain(EXPECTED.company);
      expect(pdfTexts[variant], variant).toContain(FIXTURE_TEXT.shared);
      expect(pdfTexts[variant], variant).toContain(FIXTURE_TEXT.concurrent);
    }
  });

  it('includes tagged entries only in the variants they name', () => {
    expect(pdfTexts['tech-lead']).toContain(FIXTURE_TEXT.taggedEntry);
    expect(pdfTexts['fullstack-ai']).not.toContain(FIXTURE_TEXT.taggedEntry);
    expect(pdfTexts.freelance).not.toContain(FIXTURE_TEXT.taggedEntry);
  });

  it('includes tagged bullets only in the variants they name', () => {
    expect(pdfTexts.freelance).toContain(FIXTURE_TEXT.freelanceOnly);
    expect(pdfTexts['fullstack-ai']).not.toContain(FIXTURE_TEXT.freelanceOnly);
    expect(pdfTexts['tech-lead']).not.toContain(FIXTURE_TEXT.freelanceOnly);

    expect(pdfTexts['tech-lead']).toContain(FIXTURE_TEXT.techLeadOnly);
    expect(pdfTexts['fullstack-ai']).not.toContain(FIXTURE_TEXT.techLeadOnly);
    expect(pdfTexts.freelance).not.toContain(FIXTURE_TEXT.techLeadOnly);
  });

  it('places Tuapplicaya as a project in Full-Stack + AI and an experience elsewhere', () => {
    const fullstack = pdfTexts['fullstack-ai'];
    expect(fullstack.indexOf('Projects')).toBeGreaterThanOrEqual(0);
    expect(fullstack.indexOf('Tuapplicaya')).toBeGreaterThan(
      fullstack.indexOf('Projects'),
    );

    for (const variant of ['tech-lead', 'freelance'] as const) {
      const text = pdfTexts[variant];
      expect(text, variant).not.toContain('Projects');
      expect(text.indexOf('Tuapplicaya'), variant).toBeGreaterThan(
        text.indexOf('Experience'),
      );
    }
  });

  it('applies per-variant role titles', () => {
    expect(pdfTexts['tech-lead']).toContain(FIXTURE_TEXT.techLeadTitle);
    expect(pdfTexts['fullstack-ai']).not.toContain(
      FIXTURE_TEXT.techLeadTitle,
    );
    expect(pdfTexts.freelance).not.toContain(FIXTURE_TEXT.techLeadTitle);
  });

  it('renders the concurrent engagement label only in Freelance', () => {
    expect(pdfTexts.freelance).toContain(FIXTURE_TEXT.concurrentLabel);
    expect(pdfTexts['fullstack-ai']).not.toContain(
      FIXTURE_TEXT.concurrentLabel,
    );
    expect(pdfTexts['tech-lead']).not.toContain(FIXTURE_TEXT.concurrentLabel);
  });

  it('respects per-variant bullet order without duplicating text', () => {
    const fullstack = pdfTexts['fullstack-ai'];
    expect(fullstack.indexOf(FIXTURE_TEXT.shared)).toBeLessThan(
      fullstack.indexOf(FIXTURE_TEXT.reordered),
    );

    const techLead = pdfTexts['tech-lead'];
    expect(techLead.indexOf(FIXTURE_TEXT.reordered)).toBeLessThan(
      techLead.indexOf(FIXTURE_TEXT.shared),
    );

    for (const variant of CV_VARIANTS) {
      expect(
        countOccurrences(pdfTexts[variant], FIXTURE_TEXT.shared),
        variant,
      ).toBe(1);
      expect(
        countOccurrences(pdfTexts[variant], FIXTURE_TEXT.reordered),
        variant,
      ).toBe(1);
    }
  });
});
