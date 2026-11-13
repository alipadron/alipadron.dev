import type { Language } from '../content/language';
import type { ContentPageId } from '../content/schema';

/**
 * Every page the site publishes, identified by its English path. A page is
 * always published in both languages: the Spanish version lives under `/es`.
 */
export const SITE_PAGES: readonly ('/' | '/experience' | '/contact')[] = [
  '/',
  '/experience',
  '/contact',
];

export type SitePath = (typeof SITE_PAGES)[number];

/**
 * The route of every long-form content page. The `Record` is exhaustive, so a
 * new page in `content/pages.json` fails the typecheck until it has a route,
 * and the `SitePath` values fail it until that route is prerendered.
 */
export const CONTENT_PAGE_ROUTES = {
  contact: '/contact',
} as const satisfies Record<ContentPageId, SitePath>;

/**
 * Maps a canonical page to its path in one language: the Spanish page of
 * `/experience` is `/es/experience`, and the Spanish home page is `/es`.
 */
export function localizedPath(path: SitePath, language: Language): string {
  if (language === 'en') {
    return path;
  }

  return path === '/' ? '/es' : `/es${path}`;
}

/** The prerender list: every page in both languages, derived from SITE_PAGES. */
export function siteRoutes(): string[] {
  return SITE_PAGES.flatMap((path) => [
    localizedPath(path, 'en'),
    localizedPath(path, 'es'),
  ]);
}
