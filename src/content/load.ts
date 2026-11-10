import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  validateCareer,
  validateUi,
  type Career,
  type UiStrings,
} from './schema.ts';

const DEFAULT_CONTENT_DIR = 'content';

/**
 * The content directory can be overridden with `CONTENT_DIR` so the build-level
 * tests can point the build at fixtures. Normal builds use `content/`.
 */
export function resolveContentDir(): string {
  const configuredDir = process.env['CONTENT_DIR'];

  return configuredDir
    ? path.resolve(configuredDir)
    : path.resolve(process.cwd(), DEFAULT_CONTENT_DIR);
}

/**
 * A fixture directory is a complete content snapshot: it provides both
 * `career.json` and `ui.json`, so testing one file never silently falls back to
 * the real content.
 */
export function resolveContentFile(): string {
  return path.join(resolveContentDir(), 'career.json');
}

export function resolveUiFile(): string {
  return path.join(resolveContentDir(), 'ui.json');
}

function readJson<T>(
  file: string,
  validate: (input: unknown, source: string) => T,
): T {
  let raw: unknown;

  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read content file ${file}: ${reason}`);
  }

  return validate(raw, file);
}

export function loadCareer(file = resolveContentFile()): Career {
  return readJson(file, validateCareer);
}

export function loadUi(file = resolveUiFile()): UiStrings {
  return readJson(file, validateUi);
}
