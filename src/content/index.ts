import { career as validatedCareer } from 'virtual:career';
import { caseStudies as validatedCaseStudies } from 'virtual:case-studies';
import { pages as validatedPages } from 'virtual:pages';
import { ui as validatedUi } from 'virtual:ui';

import type { Career, CaseStudies, Pages, UiStrings } from './schema';

export type {
  Bilingual,
  Bullet,
  Career,
  CaseStudy,
  CaseStudySection,
  CaseStudies,
  ContentPage,
  ContentPageId,
  Education,
  Entry,
  LanguageEntry,
  Metric,
  PageBlock,
  PageSection,
  Pages,
  Placement,
  Profile,
  SkillGroup,
  UiStrings,
  Variant,
} from './schema';

/**
 * The content module used by the site. The virtual modules are produced at
 * build time by the content Vite plugin, which loads and validates the same
 * content the PDF pipeline consumes.
 */
export const content: Career = validatedCareer;
export const ui: UiStrings = validatedUi;
export const caseStudies: CaseStudies = validatedCaseStudies;
export const pages: Pages = validatedPages;
