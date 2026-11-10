import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { chromium, type Browser } from 'playwright';

import { isPublished } from '../src/content/contact';
import { LANGUAGES } from '../src/content/language';
import { loadCareer, loadUi, resolveContentFile } from '../src/content/load';
import { renderCvHtml } from './cv-html';

const OUTPUT_DIR = path.resolve('output');

const career = loadCareer(resolveContentFile());
const ui = loadUi();
const contact = {
  phone: process.env['CV_PHONE'],
  published: isPublished(process.env['CV_PUBLISHED']),
};

mkdirSync(OUTPUT_DIR, { recursive: true });

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
  const page = await browser.newPage();

  for (const language of LANGUAGES) {
    const baseName = `cv-${language}-fullstack-ai`;
    const htmlPath = path.join(OUTPUT_DIR, `${baseName}.html`);
    const pdfPath = path.join(OUTPUT_DIR, `${baseName}.pdf`);

    const html = renderCvHtml(career, language, ui, contact);
    writeFileSync(htmlPath, html);

    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
    });

    console.log(`PDF written: ${pdfPath}`);
    console.log(`HTML written: ${htmlPath}`);
  }
} finally {
  await browser.close();
}
