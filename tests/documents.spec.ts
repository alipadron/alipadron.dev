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

const COMPANY = 'GoFeels';
const EXPECTED = {
  en: {
    title: 'Senior Full-Stack Engineer',
    bullet: 'Built and maintained production web applications used by hotels.',
    experienceHeading: 'Experience',
    present: 'Present',
    location: 'Remote',
  },
  es: {
    title: 'Ingeniero Full-Stack Senior',
    bullet:
      'Construyó y mantuvo aplicaciones web en producción usadas por hoteles.',
    experienceHeading: 'Experiencia',
    present: 'Actualidad',
    location: 'Remoto',
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
  readonly variant: (typeof VARIANTS)[number];
  readonly language: (typeof LANGUAGES)[number];
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

describe('six CV documents', () => {
  beforeAll(() => {
    mkdirSync(ARTIFACTS_DIR, { recursive: true });

    runNpmOrThrow('build');

    for (const { source, artifact: name } of PAGES) {
      copyFileSync(path.join(PUBLIC_DIR, source), artifact(name));
    }

    // A phone is set on purpose: local documents should carry it and the site
    // copies must not.
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
      const text = await pdfText(baseName);

      expect(text).toContain(COMPANY);
      expect(text).toContain(expected.title);
      expect(text).toContain(expected.bullet);
      expect(text).toContain(expected.experienceHeading);
      expect(text).toContain(expected.present);
      expect(text).toContain(expected.location);
    },
  );

  it.each(
    DOCUMENTS.map((document) => ({
      ...document,
      expected: EXPECTED[document.language],
    })),
  )('carries the same text in $baseName.docx', ({ baseName, expected }) => {
    const text = docxText(baseName);

    expect(text).toContain(COMPANY);
    expect(text).toContain(expected.title);
    expect(text).toContain(expected.bullet);
    expect(text).toContain(expected.experienceHeading);
    expect(text).toContain(expected.present);
    expect(text).toContain(expected.location);
  });

  it.each(DOCUMENTS)(
    'keeps the PDF text in reading order ($baseName)',
    async ({ baseName, language }) => {
      const text = await pdfText(baseName);
      const expected = EXPECTED[language];

      expect(text.indexOf(COMPANY)).toBeGreaterThanOrEqual(0);
      expect(text.indexOf(COMPANY)).toBeLessThan(
        text.indexOf(expected.title),
      );
      expect(text.indexOf(expected.title)).toBeLessThan(
        text.indexOf(expected.bullet),
      );
    },
  );

  it.each(DOCUMENTS)(
    'keeps the DOCX text in reading order ($baseName)',
    ({ baseName, language }) => {
      const text = docxText(baseName);
      const expected = EXPECTED[language];

      expect(text.indexOf(COMPANY)).toBeGreaterThanOrEqual(0);
      expect(text.indexOf(COMPANY)).toBeLessThan(text.indexOf(expected.title));
      expect(text.indexOf(expected.title)).toBeLessThan(
        text.indexOf(expected.bullet),
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
        existsSync(
          path.join(PUBLIC_DIR, pdf.href.replace(/^\//, '')),
        ),
        pdf.href,
      ).toBe(true);
    }

    expect(pdfLinks(readPage('home-en.html'))).not.toContain(
      '/cv/cv-en-tech-lead.pdf',
    );
    expect(pdfLinks(readPage('home-en.html'))).not.toContain(
      '/cv/cv-en-freelance.pdf',
    );
    expect(pdfLinks(readPage('home-es.html'))).not.toContain(
      '/cv/cv-es-tech-lead.pdf',
    );
    expect(pdfLinks(readPage('home-es.html'))).not.toContain(
      '/cv/cv-es-freelance.pdf',
    );
  });

  it('injects the phone into local documents but never into published PDFs', async () => {
    for (const document of DOCUMENTS) {
      expect(await pdfText(document.baseName), document.baseName).toContain(
        FAKE_PHONE,
      );
      expect(docxText(document.baseName), document.baseName).toContain(
        FAKE_PHONE,
      );
    }

    for (const pdf of PUBLISHED) {
      const text = await extractPdfText(path.join(PUBLIC_DIR, pdf.file));

      expect(text, pdf.file).not.toContain(FAKE_PHONE);
    }
  });
});
