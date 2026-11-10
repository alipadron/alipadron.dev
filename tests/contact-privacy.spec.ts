import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { extractText, getDocumentProxy } from 'unpdf';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..');
const ARTIFACTS_DIR = path.join(os.tmpdir(), `alipadron-t5-${process.pid}`);

// A reserved fictional number (555-0100 range), never a real phone number.
const FAKE_PHONE = '+1 555 0100';

// Kept as literals on purpose: these tests observe build outputs and never
// import the content module or its schema.
const PUBLIC_CONTACT = ['hola@alipadron.dev', 'linkedin.com/in/alipadron', 'github.com/alipadron'];

const SITE_HOME = path.join(PROJECT_ROOT, 'dist/analog/public/index.html');
const SITE_EXPERIENCE = path.join(
  PROJECT_ROOT,
  'dist/analog/public/experience/index.html',
);
const PDF = path.join(PROJECT_ROOT, 'output/cv-en-fullstack-ai.pdf');
const PDF_HTML = path.join(PROJECT_ROOT, 'output/cv-en-fullstack-ai.html');

function runNpmScript(script: string, extraEnv: Record<string, string> = {}) {
  // Vitest sets VITEST/NODE_ENV=test, and Analog disables prerendering in that
  // mode. Child builds must behave exactly like CI builds.
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
    ...extraEnv,
  };
  delete env['VITEST'];
  delete env['CONTENT_DIR'];
  delete env['CV_PHONE'];
  delete env['CV_PUBLISHED'];
  Object.assign(env, extraEnv);

  const result = spawnSync('npm', ['run', script], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    env,
    timeout: 240_000,
  });

  return {
    status: result.status,
    output: `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim(),
    error: result.error,
  };
}

function runNpmOrThrow(
  script: string,
  extraEnv: Record<string, string> = {},
): void {
  const result = runNpmScript(script, extraEnv);

  if (result.status !== 0) {
    throw new Error(
      `npm run ${script} failed with status ${result.status}${result.error ? ` (${result.error.message})` : ''}:\n${result.output}`,
    );
  }
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

async function extractPdfText(file: string): Promise<string> {
  const pdf = new Uint8Array(readFileSync(file));
  const document = await getDocumentProxy(pdf);
  const { text } = await extractText(document, { mergePages: true });

  return normalize(text);
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

    const home = readFileSync(keep(SITE_HOME, 'home.html'), 'utf8');
    const experience = readFileSync(
      keep(SITE_EXPERIENCE, 'experience.html'),
      'utf8',
    );

    for (const contact of PUBLIC_CONTACT) {
      expect(home).toContain(contact);
    }

    expect(home).not.toContain(FAKE_PHONE);
    expect(experience).not.toContain(FAKE_PHONE);
  });

  it('injects the phone into a local PDF when the phone variable is set', async () => {
    runNpmOrThrow('pdf', { CV_PHONE: FAKE_PHONE });

    const html = readFileSync(
      keep(PDF_HTML, 'local-with-phone.html'),
      'utf8',
    );
    const text = await extractPdfText(keep(PDF, 'local-with-phone.pdf'));

    for (const contact of PUBLIC_CONTACT) {
      expect(html).toContain(contact);
      expect(text).toContain(contact);
    }

    expect(html).toContain(FAKE_PHONE);
    expect(text).toContain(FAKE_PHONE);
  });

  it('keeps the phone out of a published PDF even when the phone variable is set', async () => {
    runNpmOrThrow('pdf', { CV_PHONE: FAKE_PHONE, CV_PUBLISHED: 'true' });

    const html = readFileSync(
      keep(PDF_HTML, 'published-with-phone.html'),
      'utf8',
    );
    const text = await extractPdfText(keep(PDF, 'published-with-phone.pdf'));

    for (const contact of PUBLIC_CONTACT) {
      expect(html).toContain(contact);
      expect(text).toContain(contact);
    }

    expect(html).not.toContain(FAKE_PHONE);
    expect(text).not.toContain(FAKE_PHONE);
  });

  it('leaves the phone out when the phone variable is unset', async () => {
    runNpmOrThrow('pdf');

    const html = readFileSync(keep(PDF_HTML, 'no-phone.html'), 'utf8');
    const text = await extractPdfText(keep(PDF, 'no-phone.pdf'));

    for (const contact of PUBLIC_CONTACT) {
      expect(html).toContain(contact);
      expect(text).toContain(contact);
    }

    expect(html).not.toContain(FAKE_PHONE);
    expect(text).not.toContain(FAKE_PHONE);
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
