/**
 * The languages the site and the CV documents are published in. English lives
 * at the root of the site; Spanish lives under `/es`.
 */
export const LANGUAGES = ['en', 'es'] as const;

export type Language = (typeof LANGUAGES)[number];
