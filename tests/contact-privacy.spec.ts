import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  PROJECT_ROOT,
  extractPdfText,
  runNpmOrThrow,
  runNpmScript,
} from './support/build-harness';

const ARTIFACTS_DIR = path.join(os.tmpdir(), `alipadron-t5-${process.pid}`);
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'dist/analog/public');

// A reserved fictional number (555-0100 range), never a real phone number.
const FAKE_PHONE = '+1 555 0100';

// Kept as literals on purpose: these tests observe build outputs and never
// import the content module or its schema.
const PUBLIC_CONTACT = [
  'hola@alipadron.dev',
  'linkedin.com/in/alipadron',
  'github.com/alipadron',
];

function pdf(language: 'en' | 'es'): string {
  return path.join(PROJECT_ROOT, `output/cv-${language}-fullstack-ai.pdf`);
}

function pdfHtml(language: 'en' | 'es'): string {
  return path.join(PROJECT_ROOT, `output/cv-${language}-fullstack-ai.html`);
}

function expectPublicContacts(output: string): void {
  for (const contact of PUBLIC_CONTACT) {
    expect(output).toContain(contact);
  }
}

function readPublicOutput(): string {
  return readdirSync(PUBLIC_DIR, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      readFileSync(path.join(entry.parentPath, entry.name), 'utf8'),
    )
    .join('\n');
}

function keep(artifact: string, name: string): string {
  const destination = path.join(ARTIFACTS_DIR, name);
  copyFileSync(artifact, destination);

  return destination;
}

describe('contact policy and privacy', () => {
  beforeAll(() => {
    mkdirSync(ARTIFACTS_DIR, { recursive: true });
  });

  afterAll(() => {
    rmSync(ARTIFACTS_DIR, { recursive: true, force: true });

    // The fixture build writes into the real dist/ directory; restore the real
    // content so a local preview or deploy never sees the fixture.
    runNpmScript('build');
  });

  it('publishes only email, LinkedIn and GitHub on the site, even when a phone is provided', () => {
    runNpmOrThrow('build', { CV_PHONE: FAKE_PHONE });

    const site = readPublicOutput();

    expectPublicContacts(site);
    expect(site).not.toContain(FAKE_PHONE);
  });

  it('injects the phone into a local PDF when the phone variable is set', async () => {
    runNpmOrThrow('pdf', { CV_PHONE: FAKE_PHONE, CV_PUBLISHED: 'false' });

    const html = readFileSync(
      keep(pdfHtml('en'), 'local-with-phone.html'),
      'utf8',
    );
    const text = await extractPdfText(keep(pdf('en'), 'local-with-phone.pdf'));
    const spanish = await extractPdfText(
      keep(pdf('es'), 'local-with-phone-es.pdf'),
    );

    expectPublicContacts(html);
    expectPublicContacts(text);
    expectPublicContacts(spanish);
    expect(html).toContain(FAKE_PHONE);
    expect(text).toContain(FAKE_PHONE);
    expect(spanish).toContain(FAKE_PHONE);
  });

  it('keeps the phone out of a published PDF even when the phone variable is set', async () => {
    runNpmOrThrow('pdf', { CV_PHONE: FAKE_PHONE, CV_PUBLISHED: 'true' });

    const html = readFileSync(
      keep(pdfHtml('en'), 'published-with-phone.html'),
      'utf8',
    );
    const text = await extractPdfText(
      keep(pdf('en'), 'published-with-phone.pdf'),
    );
    const spanish = await extractPdfText(
      keep(pdf('es'), 'published-with-phone-es.pdf'),
    );

    expectPublicContacts(html);
    expectPublicContacts(text);
    expectPublicContacts(spanish);
    expect(html).not.toContain(FAKE_PHONE);
    expect(text).not.toContain(FAKE_PHONE);
    expect(spanish).not.toContain(FAKE_PHONE);
  });

  it('treats any non-false published value as published, so a typo cannot leak', async () => {
    runNpmOrThrow('pdf', { CV_PHONE: FAKE_PHONE, CV_PUBLISHED: 'enabled' });

    const html = readFileSync(
      keep(pdfHtml('en'), 'unexpected-published-value.html'),
      'utf8',
    );
    const text = await extractPdfText(
      keep(pdf('en'), 'unexpected-published-value.pdf'),
    );
    const spanish = await extractPdfText(
      keep(pdf('es'), 'unexpected-published-value-es.pdf'),
    );

    expectPublicContacts(text);
    expectPublicContacts(spanish);
    expect(html).not.toContain(FAKE_PHONE);
    expect(text).not.toContain(FAKE_PHONE);
    expect(spanish).not.toContain(FAKE_PHONE);
  });

  it('leaves the phone out when the phone variable is unset', async () => {
    runNpmOrThrow('pdf');

    const html = readFileSync(keep(pdfHtml('en'), 'no-phone.html'), 'utf8');
    const text = await extractPdfText(keep(pdf('en'), 'no-phone.pdf'));
    const spanish = await extractPdfText(keep(pdf('es'), 'no-phone-es.pdf'));

    expectPublicContacts(html);
    expectPublicContacts(text);
    expectPublicContacts(spanish);
    expect(html).not.toContain(FAKE_PHONE);
    expect(text).not.toContain(FAKE_PHONE);
    expect(spanish).not.toContain(FAKE_PHONE);
  });

  it('rejects a phone number stored in the tracked content', () => {
    const result = runNpmScript('build', {
      CONTENT_DIR: path.join(PROJECT_ROOT, 'tests/fixtures/content-with-phone'),
    });

    expect(result.status).not.toBe(0);
    expect(result.output).toContain('Invalid content in');
    expect(result.output).toContain('phone');
    expect(result.output).toContain('Unrecognized key');
  });
});
