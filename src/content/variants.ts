/**
 * The CV variants. Kept in a dependency-free module so content code that runs in
 * the browser can name them without pulling the zod schema into the bundle.
 */
export const CV_VARIANTS = ['fullstack-ai', 'tech-lead', 'freelance'] as const;

export type Variant = (typeof CV_VARIANTS)[number];
