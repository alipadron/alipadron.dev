import { career as validatedCareer } from 'virtual:career';
import { ui as validatedUi } from 'virtual:ui';

import type { Career, Role, UiStrings } from './schema';

export type { Bullet, Career, Role, UiStrings, Variant } from './schema';

/**
 * The content module used by the site. The virtual modules are produced at
 * build time by the content Vite plugin, which loads and validates the same
 * career data that the PDF pipeline consumes.
 */
export const content: Career = validatedCareer;
export const ui: UiStrings = validatedUi;

export const roles: readonly Role[] = content.roles;
