import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { chromium, type Browser } from 'playwright';

import { loadCareer, resolveContentFile } from '../src/content/load';
import { renderCvHtml } from './cv-html';

const OUTPUT_DIR = path.resolve('output');
const HTML_PATH = path.join(OUTPUT_DIR, 'cv-en-fullstack-ai.html');
const PDF_PATH = path.join(OUTPUT_DIR, 'cv-en-fullstack-ai.pdf');

const contentFile = resolveContentFile();
const career = loadCareer(contentFile);
const role = career.roles[0];

if (!role) {
  throw new Error(`No roles found in ${contentFile}`);
}

const html = renderCvHtml(role);

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, html);

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
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: PDF_PATH,
    format: 'A4',
    printBackground: true,
  });
} finally {
  await browser.close();
}

console.log(`PDF written: ${PDF_PATH}`);
console.log(`HTML written: ${HTML_PATH}`);
