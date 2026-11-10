import { readFileSync } from 'node:fs';
import path from 'node:path';

import { validateCareer, type Career } from './schema.ts';

const DEFAULT_CONTENT_DIR = 'content';

/**
 * The content directory can be overridden with `CONTENT_DIR` so the build-level
 * tests can point the build at invalid fixtures. Normal builds use `content/`.
 */
export function resolveContentFile(): string {
  const configuredDir = process.env['CONTENT_DIR'];
  const contentDir = configuredDir
    ? path.resolve(configuredDir)
    : path.resolve(process.cwd(), DEFAULT_CONTENT_DIR);

  return path.join(contentDir, 'career.json');
}

export function loadCareer(file = resolveContentFile()): Career {
  let raw: unknown;

  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read content file ${file}: ${reason}`);
  }

  return validateCareer(raw, file);
}
