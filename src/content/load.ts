import { existsSync, readFileSync } from 'node:fs';
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
 * tests can point the build at invalid fixtures. Normal builds use `content/`.
 */
function configuredContentDir(): string | undefined {
  const configuredDir = process.env['CONTENT_DIR'];
  return configuredDir ? path.resolve(configuredDir) : undefined;
}

export function resolveContentFile(): string {
  const contentDir =
    configuredContentDir() ?? path.resolve(process.cwd(), DEFAULT_CONTENT_DIR);

  return path.join(contentDir, 'career.json');
}

/**
 * The UI strings follow `CONTENT_DIR` when that directory provides a `ui.json`
 * of its own. Fixtures that only replace the career file keep the real UI
 * strings; a fixture that ships `ui.json` replaces them too.
 */
export function resolveUiFile(): string {
  const overrideDir = configuredContentDir();

  if (overrideDir) {
    const candidate = path.join(overrideDir, 'ui.json');

    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(path.resolve(process.cwd(), DEFAULT_CONTENT_DIR), 'ui.json');
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
