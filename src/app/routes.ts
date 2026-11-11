import { CASE_STUDY_IDS, type CaseStudyId } from '../content/case-studies';
import type { Language } from '../content/language';
import type { ContentPageId } from '../content/schema';

export const CASE_STUDIES_PATH = '/case-studies' as const;

/** The page of one case study: `/case-studies/<id>`. */
export type CaseStudyPath = `${typeof CASE_STUDIES_PATH}/${CaseStudyId}`;

export function caseStudyPath(id: CaseStudyId): CaseStudyPath {
  return `${CASE_STUDIES_PATH}/${id}`;
}

/**
 * Every page the site publishes, identified by its English path. A page is
 * always published in both languages: the Spanish version lives under `/es`.
 * The case studies come from the same id list as the content, so an index entry
 * and its page cannot drift apart.
 */
export const SITE_PAGES: readonly (
  | '/'
  | '/experience'
  | '/how-i-work'
  | '/work-with-me'
  | '/contact'
  | typeof CASE_STUDIES_PATH
  | CaseStudyPath
)[] = [
  '/',
  '/experience',
  CASE_STUDIES_PATH,
  ...CASE_STUDY_IDS.map(caseStudyPath),
  '/how-i-work',
  '/work-with-me',
  '/contact',
];

export type SitePath = (typeof SITE_PAGES)[number];

/**
 * The route of every long-form content page. The `Record` is exhaustive, so a
 * new page in `content/pages.json` fails the typecheck until it has a route,
 * and the `SitePath` values fail it until that route is prerendered.
 */
export const CONTENT_PAGE_ROUTES = {
  'how-i-work': '/how-i-work',
  'work-with-me': '/work-with-me',
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
