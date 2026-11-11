import { career as validatedCareer } from 'virtual:career';
import { ui as validatedUi } from 'virtual:ui';

import type { Career, UiStrings } from './schema';

export type {
  Bilingual,
  Bullet,
  Career,
  Education,
  Entry,
  LanguageEntry,
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
