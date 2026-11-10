import type { Language } from '../content/language';

/**
 * Every page the site publishes, identified by its English path. A page is
 * always published in both languages: the Spanish version lives under `/es`.
 */
export const SITE_PAGES = ['/', '/experience'] as const;

export type SitePath = (typeof SITE_PAGES)[number];

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
