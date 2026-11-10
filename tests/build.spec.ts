import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { extractText, getDocumentProxy } from 'unpdf';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..');
const ARTIFACTS_DIR = path.join(os.tmpdir(), `alipadron-t2-${process.pid}`);

// Kept as literals on purpose: these tests observe build outputs and never
// import the content module or its schema.
const EXPECTED_ROLE = {
  company: 'GoFeels',
  title: 'Senior Full-Stack Engineer',
  bullet: 'Built and maintained production web applications used by hotels.',
};

function runNpm(script: string, extraEnv: Record<string, string> = {}) {
  // Vitest sets VITEST/NODE_ENV=test, and Analog disables prerendering in that
  // mode. Child builds must behave exactly like CI builds.
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
    ...extraEnv,
  };
  delete env['VITEST'];

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

function runNpmOrThrow(script: string) {
  const result = runNpm(script);

  if (result.status !== 0) {
    throw new Error(
      `npm run ${script} failed with status ${result.status}${result.error ? ` (${result.error.message})` : ''}:\n${result.output}`,
    );
  }
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('build-level outputs', () => {
  beforeAll(() => {
    mkdirSync(ARTIFACTS_DIR, { recursive: true });

    runNpmOrThrow('build');

    copyFileSync(
      path.join(PROJECT_ROOT, 'dist/analog/public/experience/index.html'),
      path.join(ARTIFACTS_DIR, 'experience.html'),
    );

    runNpmOrThrow('pdf');

    copyFileSync(
      path.join(PROJECT_ROOT, 'output/cv-en-fullstack-ai.pdf'),
      path.join(ARTIFACTS_DIR, 'cv-en-fullstack-ai.pdf'),
    );
  });

  afterAll(() => {
    rmSync(ARTIFACTS_DIR, { recursive: true, force: true });
  });

  it('prerenders the Experience page with the role', () => {
    const html = readFileSync(
      path.join(ARTIFACTS_DIR, 'experience.html'),
      'utf8',
    );

    expect(html).toContain(EXPECTED_ROLE.company);
    expect(html).toContain(EXPECTED_ROLE.title);
    expect(html).toContain(EXPECTED_ROLE.bullet);
  });

  it('produces the Full-Stack + AI PDF with the role text', async () => {
    const pdf = new Uint8Array(
      readFileSync(path.join(ARTIFACTS_DIR, 'cv-en-fullstack-ai.pdf')),
    );
    const document = await getDocumentProxy(pdf);
    const { text } = await extractText(document, { mergePages: true });
    const normalized = normalize(text);

    expect(normalized).toContain(EXPECTED_ROLE.company);
    expect(normalized).toContain(EXPECTED_ROLE.title);
    expect(normalized).toContain(EXPECTED_ROLE.bullet);
  });

  it.each([
    {
      fixture: 'invalid-date',
      expectedDetail: 'startDate',
    },
    {
      fixture: 'invalid-translation',
      expectedDetail: 'title.es',
    },
  ])(
    'fails the build with a clear message for the $fixture fixture',
    ({ fixture, expectedDetail }) => {
      const result = runNpm('build', {
        CONTENT_DIR: path.join(PROJECT_ROOT, 'tests/fixtures', fixture),
      });

      expect(result.status).not.toBe(0);
      expect(result.output).toContain('Invalid content in');
      expect(result.output).toContain('career.json');
      expect(result.output).toContain(expectedDetail);
    },
  );
});
