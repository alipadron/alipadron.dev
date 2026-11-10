import { career as validatedCareer } from 'virtual:career';

import type { Career, Role } from './schema';

export type { Bullet, Career, Role, Variant } from './schema';

/**
 * The content module used by the site. The virtual module is produced at build
 * time by the career-content Vite plugin, which loads and validates the same
 * career data that the PDF pipeline consumes.
 */
export const content: Career = validatedCareer;

export const roles: readonly Role[] = content.roles;
