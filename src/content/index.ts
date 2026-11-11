import { career as validatedCareer } from 'virtual:career';
import { pages as validatedPages } from 'virtual:pages';
import { ui as validatedUi } from 'virtual:ui';

import type { Career, Pages, UiStrings } from './schema';

export type {
  Bilingual,
  Bullet,
  Career,
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
 * career data that the PDF pipeline consumes.
 */
export const content: Career = validatedCareer;
export const ui: UiStrings = validatedUi;
export const pages: Pages = validatedPages;
