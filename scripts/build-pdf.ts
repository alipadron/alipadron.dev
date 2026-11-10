import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { chromium, type Browser } from 'playwright';

import { isPublished } from '../src/content/contact';
import { LANGUAGES, type Language } from '../src/content/language';
import { loadCareer, loadUi, resolveContentFile } from '../src/content/load';
import {
  selectVariant,
  VARIANT_LABELS,
} from '../src/content/presentation';
import { CV_VARIANTS, type Variant } from '../src/content/schema';
import { renderCvHtml } from './cv-html';

const OUTPUT_DIR = path.resolve(process.env['OUTPUT_DIR'] ?? 'output');

// Every English variant is built; Spanish currently covers the published
// Full-Stack + AI document. Later tickets add the other Spanish variants.
const VARIANTS_BY_LANGUAGE: Record<Language, readonly Variant[]> = {
  en: CV_VARIANTS,
  es: ['fullstack-ai'],
};

const career = loadCareer(resolveContentFile());
const ui = loadUi();

// The local/published seam is per invocation, so every document in one run
// shares it. The phone is never part of the tracked content.
const contact = {
  phone: process.env['CV_PHONE'],
  published: isPublished(process.env['CV_PUBLISHED']),
};

mkdirSync(OUTPUT_DIR, { recursive: true });

const documents = LANGUAGES.flatMap((language) =>
  VARIANTS_BY_LANGUAGE[language].map((variant) => {
    const baseName = `cv-${language}-${variant}`;
    const htmlPath = path.join(OUTPUT_DIR, `${baseName}.html`);
    const pdfPath = path.join(OUTPUT_DIR, `${baseName}.pdf`);
    const html = renderCvHtml(
      selectVariant(career, variant),
      career.profile,
      language,
      ui,
      contact,
    );

    writeFileSync(htmlPath, html);

    return { language, variant, htmlPath, pdfPath, html };
  }),
);

let browser: Browser;
try {
  browser = await chromium.launch();
} catch (error) {
  console.error(
    'Could not launch Chromium. Install it with: npx playwright install chromium',
  );
  throw error;
}

try {
  for (const document of documents) {
    const page = await browser.newPage();
    await page.setContent(document.html, { waitUntil: 'load' });
    await page.pdf({
      path: document.pdfPath,
      format: 'A4',
      printBackground: true,
    });
    await page.close();

    console.log(
      `PDF written: ${document.pdfPath} (${VARIANT_LABELS[document.variant][document.language]})`,
    );
    console.log(`HTML written: ${document.htmlPath}`);
  }
} finally {
  await browser.close();
}
