import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  PROJECT_ROOT,
  extractDocxText,
  extractPdfText,
  runNpmOrThrow,
} from './support/build-harness';

const PUBLIC_DIR = path.join(PROJECT_ROOT, 'dist/analog/public');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');
const ARTIFACTS_DIR = path.join(
  os.tmpdir(),
  `alipadron-t11-${process.pid}`,
);

// Kept as literals on purpose: these tests observe build outputs and never
// import the content module or its schema.
const VARIANTS = ['fullstack-ai', 'tech-lead', 'freelance'] as const;
const LANGUAGES = ['en', 'es'] as const;

type Language = (typeof LANGUAGES)[number];
type Variant = (typeof VARIANTS)[number];

const COMPANY = 'GoFeels';
const EXPECTED = {
  en: {
    title: 'Senior Full-Stack Engineer',
    bullet: 'Built and maintained production web applications used by hotels.',
    details: '2020 – Present · Remote · AngularJS, Laravel',
    experienceHeading: 'Experience',
    projectsHeading: 'Projects',
  },
  es: {
    title: 'Ingeniero Full-Stack Senior',
    bullet:
      'Construyó y mantuvo aplicaciones web en producción usadas por hoteles.',
    details: '2020 – Actualidad · Remoto · AngularJS, Laravel',
    experienceHeading: 'Experiencia',
    projectsHeading: 'Proyectos',
  },
} as const;

const FIXTURE = {
  en: {
    shared: 'Shared engagement bullet shown in every CV.',
    reordered: 'Shared engagement bullet moved first for Tech Lead.',
    freelanceOnly: 'Freelance-only contract audit bullet.',
    techLeadOnly: 'Tech-Lead-only release ownership bullet.',
    concurrent: 'Concurrent engagement',
    techLeadTitle: 'Co-founder & Technical Lead',
    projectsHeading: 'Projects',
  },
  es: {
    shared: 'Viñeta compartida que aparece en todos los CV.',
    reordered: 'Viñeta compartida que pasa primero en Tech Lead.',
    freelanceOnly: 'Viñeta de auditoría de contratos solo para Freelance.',
    techLeadOnly: 'Viñeta de propiedad de releases solo para Tech Lead.',
    concurrent: 'Compromiso simultáneo',
    techLeadTitle: 'Cofundador y líder técnico',
    projectsHeading: 'Proyectos',
  },
} as const;

const FAKE_PHONE = '+1 555 0100';

const PUBLISHED = [
  {
    language: 'en',
    href: '/cv/cv-en-fullstack-ai.pdf',
    file: 'cv/cv-en-fullstack-ai.pdf',
  },
  {
    language: 'es',
    href: '/cv/cv-es-fullstack-ai.pdf',
    file: 'cv/cv-es-fullstack-ai.pdf',
  },
] as const;

interface DocumentCase {
  readonly variant: Variant;
  readonly language: Language;
  readonly baseName: string;
}

const DOCUMENTS: readonly DocumentCase[] = LANGUAGES.flatMap((language) =>
  VARIANTS.map((variant) => ({
    variant,
    language,
    baseName: `cv-${language}-${variant}`,
  })),
);

const PAGES = [
  { source: 'index.html', artifact: 'home-en.html' },
  { source: 'es/index.html', artifact: 'home-es.html' },
];

const VARIANT_FIXTURE_DIR = path.join(PROJECT_ROOT, 'tests/fixtures/variants');
const VARIANT_OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'variant-output');
const VARIANT_SITE_DIR = path.join(ARTIFACTS_DIR, 'variant-site');

function artifact(name: string): string {
  return path.join(ARTIFACTS_DIR, name);
}

function pdfText(name: string): Promise<string> {
  return extractPdfText(artifact(`${name}.pdf`));
}

function docxText(name: string): string {
  return extractDocxText(artifact(`${name}.docx`));
}

function pdfsUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.pdf'))
    .map((entry) =>
      path
        .relative(directory, path.join(entry.parentPath, entry.name))
        .split(path.sep)
        .join('/'),
    )
    .sort();
}

/** The PDF links in a prerendered page, in document order. */
function pdfLinks(html: string): string[] {
  return [...html.matchAll(/href="([^"]+\.pdf)"/g)].map((match) => match[1]);
}

function readPage(name: string): string {
  return readFileSync(artifact(name), 'utf8');
}

/** Assert the role text and its reading order in a PDF or DOCX extraction. */
function expectDocumentText(
  text: string,
  expected: (typeof EXPECTED)[Language],
): void {
  expect(text).toContain(COMPANY);
  expect(text).toContain(expected.title);
  expect(text).toContain(expected.bullet);
  expect(text).toContain(expected.experienceHeading);
  expect(text).toContain(expected.details);

  const heading = text.indexOf(expected.experienceHeading);
  const company = text.indexOf(COMPANY);
  const title = text.indexOf(expected.title);
  const details = text.indexOf(expected.details);
  const bullet = text.indexOf(expected.bullet);

  expect(heading).toBeGreaterThanOrEqual(0);
  expect(heading).toBeLessThan(company);
  expect(company).toBeLessThan(title);
  expect(title).toBeLessThan(details);
  expect(details).toBeLessThan(bullet);
}

/** Assert the variant-specific selection of the fixture content. */
function expectVariantText(
  text: string,
  variant: Variant,
  language: Language,
): void {
  const expected = FIXTURE[language];

  expect(text).toContain(expected.shared);

  if (variant === 'tech-lead') {
    expect(text).toContain(expected.reordered);
    expect(text).toContain(expected.techLeadOnly);
    expect(text).toContain(expected.techLeadTitle);
    expect(text).not.toContain(expected.freelanceOnly);
    expect(text).not.toContain(expected.projectsHeading);
    expect(text).not.toContain(expected.concurrent);
  } else if (variant === 'freelance') {
    expect(text).toContain(expected.reordered);
    expect(text).toContain(expected.freelanceOnly);
    expect(text).toContain(expected.concurrent);
    expect(text).not.toContain(expected.techLeadOnly);
    expect(text).not.toContain(expected.techLeadTitle);
    expect(text).not.toContain(expected.projectsHeading);
  } else {
    expect(text).toContain(expected.reordered);
    expect(text).not.toContain(expected.freelanceOnly);
    expect(text).not.toContain(expected.techLeadOnly);
    expect(text).not.toContain(expected.concurrent);

    // Tuapplicaya is a project only in this variant.
    expect(text.indexOf('Tuapplicaya')).toBeGreaterThan(
      text.indexOf(expected.projectsHeading),
    );
  }
}

describe('six CV documents', () => {
  beforeAll(() => {
    mkdirSync(ARTIFACTS_DIR, { recursive: true });

    runNpmOrThrow('build');

    for (const { source, artifact: name } of PAGES) {
      copyFileSync(path.join(PUBLIC_DIR, source), artifact(name));
    }

    // A phone is set on purpose: local PDFs should carry it and neither DOCX
    // nor the site copies may.
    runNpmOrThrow('documents', { CV_PHONE: FAKE_PHONE });

    for (const document of DOCUMENTS) {
      copyFileSync(
        path.join(OUTPUT_DIR, `${document.baseName}.pdf`),
        artifact(`${document.baseName}.pdf`),
      );
      copyFileSync(
        path.join(OUTPUT_DIR, `${document.baseName}.docx`),
        artifact(`${document.baseName}.docx`),
      );
    }
  });

  afterAll(() => {
    rmSync(ARTIFACTS_DIR, { recursive: true, force: true });
  });

  it('produces a PDF and a DOCX for every variant and language', () => {
    for (const document of DOCUMENTS) {
      expect(
        existsSync(path.join(OUTPUT_DIR, `${document.baseName}.pdf`)),
        `${document.baseName}.pdf`,
      ).toBe(true);
      expect(
        existsSync(path.join(OUTPUT_DIR, `${document.baseName}.docx`)),
        `${document.baseName}.docx`,
      ).toBe(true);
    }
  });

  it.each(
    DOCUMENTS.map((document) => ({
      ...document,
      expected: EXPECTED[document.language],
    })),
  )(
    'carries the role text in $baseName.pdf',
    async ({ baseName, expected }) => {
      expectDocumentText(await pdfText(baseName), expected);
    },
  );

  it.each(
    DOCUMENTS.map((document) => ({
      ...document,
      expected: EXPECTED[document.language],
    })),
  )('carries the same text in $baseName.docx', ({ baseName, expected }) => {
    expectDocumentText(docxText(baseName), expected);
  });

  it.each(DOCUMENTS)(
    'renders $baseName from single-column HTML',
    ({ baseName }) => {
      const html = readFileSync(
        path.join(OUTPUT_DIR, `${baseName}.html`),
        'utf8',
      );

      expect(html).not.toMatch(
        /column-count|column-width|grid-template-columns/,
      );
    },
  );

  it('publishes exactly the two Full-Stack + AI PDFs into the site output', async () => {
    expect(pdfsUnder(PUBLIC_DIR)).toEqual(PUBLISHED.map((pdf) => pdf.file));

    for (const pdf of PUBLISHED) {
      const text = await extractPdfText(path.join(PUBLIC_DIR, pdf.file));

      expect(text, pdf.file).toContain(COMPANY);
      expect(text, pdf.file).toContain(EXPECTED[pdf.language].title);
    }
  });

  it('links only the published PDFs, each language to its own document', () => {
    for (const pdf of PUBLISHED) {
      const page = pdf.language === 'en' ? 'home-en.html' : 'home-es.html';

      expect(pdfLinks(readPage(page)), page).toEqual([pdf.href]);
      expect(
        existsSync(path.join(PUBLIC_DIR, pdf.href.replace(/^\//, ''))),
        pdf.href,
      ).toBe(true);
    }

    const english = pdfLinks(readPage('home-en.html')).join('\n');
    const spanish = pdfLinks(readPage('home-es.html')).join('\n');

    expect(english).not.toContain('tech-lead');
    expect(english).not.toContain('freelance');
    expect(spanish).not.toContain('tech-lead');
    expect(spanish).not.toContain('freelance');
  });

  it('injects the phone into local PDFs but not into DOCX or published PDFs', async () => {
    for (const document of DOCUMENTS) {
      expect(await pdfText(document.baseName), document.baseName).toContain(
        FAKE_PHONE,
      );
      expect(docxText(document.baseName), document.baseName).not.toContain(
        FAKE_PHONE,
      );
    }

    for (const pdf of PUBLISHED) {
      const text = await extractPdfText(path.join(PUBLIC_DIR, pdf.file));

      expect(text, pdf.file).not.toContain(FAKE_PHONE);
    }
  });
});

describe('variant content in all six documents', () => {
  beforeAll(() => {
    mkdirSync(ARTIFACTS_DIR, { recursive: true });

    runNpmOrThrow('documents', {
      CONTENT_DIR: VARIANT_FIXTURE_DIR,
      OUTPUT_DIR: VARIANT_OUTPUT_DIR,
      SITE_DIST_DIR: VARIANT_SITE_DIR,
    });
  });

  afterAll(() => {
    rmSync(ARTIFACTS_DIR, { recursive: true, force: true });
  });

  it.each(
    DOCUMENTS.map((document) => ({
      ...document,
      expected: FIXTURE[document.language],
    })),
  )(
    'selects the $variant entries in $baseName.pdf',
    async ({ baseName, variant, language }) => {
      const text = await extractPdfText(
        path.join(VARIANT_OUTPUT_DIR, `${baseName}.pdf`),
      );

      expectVariantText(text, variant, language);
    },
  );

  it.each(DOCUMENTS)(
    'selects the $variant entries in $baseName.docx',
    ({ baseName, variant, language }) => {
      const text = extractDocxText(
        path.join(VARIANT_OUTPUT_DIR, `${baseName}.docx`),
      );

      expectVariantText(text, variant, language);
    },
  );

  it('respects per-variant bullet order in PDF and DOCX', async () => {
    for (const language of LANGUAGES) {
      const expected = FIXTURE[language];
      const baseName = `cv-${language}-fullstack-ai`;
      const pdf = await extractPdfText(
        path.join(VARIANT_OUTPUT_DIR, `${baseName}.pdf`),
      );
      const docx = extractDocxText(
        path.join(VARIANT_OUTPUT_DIR, `${baseName}.docx`),
      );
      const techLeadPdf = await extractPdfText(
        path.join(VARIANT_OUTPUT_DIR, `cv-${language}-tech-lead.pdf`),
      );
      const techLeadDocx = extractDocxText(
        path.join(VARIANT_OUTPUT_DIR, `cv-${language}-tech-lead.docx`),
      );

      expect(pdf.indexOf(expected.shared)).toBeLessThan(
        pdf.indexOf(expected.reordered),
      );
      expect(docx.indexOf(expected.shared)).toBeLessThan(
        docx.indexOf(expected.reordered),
      );
      expect(techLeadPdf.indexOf(expected.reordered)).toBeLessThan(
        techLeadPdf.indexOf(expected.shared),
      );
      expect(techLeadDocx.indexOf(expected.reordered)).toBeLessThan(
        techLeadDocx.indexOf(expected.shared),
      );
    }
  });

  it('publishes the Full-Stack + AI selection, not another variant', async () => {
    expect(pdfsUnder(VARIANT_SITE_DIR)).toEqual(PUBLISHED.map((pdf) => pdf.file));

    for (const pdf of PUBLISHED) {
      const text = await extractPdfText(
        path.join(VARIANT_SITE_DIR, pdf.file),
      );

      expectVariantText(text, 'fullstack-ai', pdf.language);
    }
  });
});
