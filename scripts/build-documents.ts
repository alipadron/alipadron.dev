import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { chromium, type Browser } from 'playwright';

import { isPublished } from '../src/content/contact';
import {
  buildCvDocumentModel,
  CV_DOCUMENTS,
  cvDocumentBaseName,
  PUBLISHED_CV_DIR,
  PUBLISHED_DOCUMENTS,
  type CvDocument,
} from '../src/content/documents';
import { loadCareer, loadUi, resolveContentFile } from '../src/content/load';
import { selectVariant } from '../src/content/presentation';
import { renderCvDocx } from './cv-docx';
import { renderCvHtml } from './cv-html';

const OUTPUT_DIR = path.resolve(process.env['OUTPUT_DIR'] ?? 'output');
const SITE_DIST_DIR = path.resolve(
  process.env['SITE_DIST_DIR'] ?? 'dist/analog/public',
);

const args = new Set(process.argv.slice(2));
const pdfOnly = args.has('--pdf-only');
const publish = args.has('--publish');

const career = loadCareer(resolveContentFile());
const ui = loadUi();

// The local/published seam is per invocation, so every local document in one
// run shares it. The phone is never part of the tracked content.
const contact = {
  phone: process.env['CV_PHONE'],
  published: isPublished(process.env['CV_PUBLISHED']),
};

function modelFor(
  document: CvDocument,
  options: typeof contact,
): ReturnType<typeof buildCvDocumentModel> {
  return buildCvDocumentModel(
    selectVariant(career, document.variant),
    career.profile,
    document.language,
    ui,
    options,
  );
}

async function writePdf(
  browser: Browser,
  html: string,
  pdfPath: string,
): Promise<void> {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await page.close();
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const documents = CV_DOCUMENTS.map((document) => {
  const model = modelFor(document, contact);
  const baseName = cvDocumentBaseName(document);
  const htmlPath = path.join(OUTPUT_DIR, `${baseName}.html`);
  const pdfPath = path.join(OUTPUT_DIR, `${baseName}.pdf`);
  const docxPath = path.join(OUTPUT_DIR, `${baseName}.docx`);
  const html = renderCvHtml(model);

  writeFileSync(htmlPath, html);

  return { model, baseName, htmlPath, pdfPath, docxPath, html };
});

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
  for (const item of documents) {
    await writePdf(browser, item.html, item.pdfPath);

    console.log(
      `PDF written: ${item.pdfPath} (${item.model.variantLabel})`,
    );
    console.log(`HTML written: ${item.htmlPath}`);

    if (!pdfOnly) {
      writeFileSync(item.docxPath, await renderCvDocx(item.model));
      console.log(`DOCX written: ${item.docxPath}`);
    }
  }

  if (publish) {
    const publishedDir = path.join(SITE_DIST_DIR, PUBLISHED_CV_DIR);

    // Site output must carry exactly the published documents, so stale copies
    // of any PDF (including retired variants) are removed first.
    rmSync(publishedDir, { recursive: true, force: true });
    mkdirSync(publishedDir, { recursive: true });

    for (const document of PUBLISHED_DOCUMENTS) {
      // Published copies are rendered again without the phone, even when this
      // run builds local PDFs with one: site output is public output.
      const model = modelFor(document, { phone: undefined, published: true });
      const pdfPath = path.join(
        publishedDir,
        `${cvDocumentBaseName(document)}.pdf`,
      );

      await writePdf(browser, renderCvHtml(model), pdfPath);
      console.log(`Published: ${pdfPath}`);
    }
  }
} finally {
  await browser.close();
}
