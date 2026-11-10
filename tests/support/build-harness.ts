import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { strFromU8, unzipSync } from 'fflate';
import { extractText, getDocumentProxy } from 'unpdf';

export const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');

/**
 * Run an npm script exactly like CI. Vitest sets VITEST/NODE_ENV=test and
 * Analog disables prerendering in that mode, and inherited build knobs would
 * leak between suites, so the environment is reset here.
 */
export function runNpmScript(
  script: string,
  extraEnv: Record<string, string> = {},
) {
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

export function runNpmOrThrow(
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

export function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export async function extractPdfText(file: string): Promise<string> {
  const pdf = new Uint8Array(readFileSync(file));
  const document = await getDocumentProxy(pdf);
  const { text } = await extractText(document, { mergePages: true });

  return normalize(text);
}

function decodeXmlEntities(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

/**
 * The text of a DOCX file as a reader would see it. A DOCX is a ZIP whose
 * `word/document.xml` holds every paragraph; stripping the WordprocessingML
 * tags keeps the paragraph text in reading order.
 */
export function extractDocxText(file: string): string {
  const archive = unzipSync(new Uint8Array(readFileSync(file)));
  const xml = strFromU8(archive['word/document.xml']);

  const text = xml
    .replaceAll('</w:p>', '\n')
    .replaceAll('<w:tab/>', '\t')
    .replace(/<[^>]+>/g, '');

  return normalize(decodeXmlEntities(text));
}
