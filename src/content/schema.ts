import { z } from 'zod';

import { CV_VARIANTS, type Variant } from './variants';

/**
 * The CV variants. A content entry without `variants` belongs to every variant.
 */
export { CV_VARIANTS, type Variant } from './variants';

export const variantSchema = z.enum(CV_VARIANTS, {
  error: `unknown variant; expected one of ${CV_VARIANTS.join(', ')}`,
});

/** How an entry is presented in a CV. */
export const placementSchema = z.enum(['experience', 'project']);
export type Placement = z.infer<typeof placementSchema>;

const monthOrYearSchema = z
  .string()
  .regex(
    /^\d{4}(-(0[1-9]|1[0-2]))?$/,
    'must be a year (YYYY) or a month (YYYY-MM)',
  );

/** Sortable month index; a year-only date means January of that year. */
function dateKey(value: string): number {
  const [year, month = '01'] = value.split('-');
  return Number(year) * 12 + Number(month) - 1;
}

const bilingualSchema = z
  .object({
    en: z.string().trim().min(1, 'missing English translation'),
    es: z.string().trim().min(1, 'missing Spanish translation'),
  })
  .strict();

/**
 * A per-variant value. Unknown variant keys are rejected by `partialRecord`, so
 * a typo such as `techlead` fails the build instead of silently doing nothing.
 */
function variantRecord<T extends z.ZodType>(value: T) {
  return z.partialRecord(variantSchema, value);
}

export const bulletSchema = z
  .object({
    id: z.string().trim().min(1),
    order: z.number().int().nonnegative(),
    text: bilingualSchema,
    variants: z.array(variantSchema).min(1).optional(),
    /** Reorders this bullet in specific variants without duplicating its text. */
    orderByVariant: variantRecord(z.number().int().nonnegative()).optional(),
  })
  .strict();

export const entrySchema = z
  .object({
    id: z.string().trim().min(1),
    company: bilingualSchema,
    title: bilingualSchema,
    /** A role title that changes between CV variants. */
    titleByVariant: variantRecord(bilingualSchema).optional(),
    startDate: monthOrYearSchema,
    /** `null` means the entry is current. */
    endDate: monthOrYearSchema.nullable(),
    locationModel: z.enum(['remote', 'hybrid', 'onsite']),
    stack: z.array(z.string().trim().min(1)).min(1),
    bullets: z.array(bulletSchema).min(1),
    variants: z.array(variantSchema).min(1).optional(),
    /** Where the entry belongs by default. */
    placement: placementSchema.optional(),
    /** An entry can be an experience in some variants and a project in others. */
    placementByVariant: variantRecord(placementSchema).optional(),
    /**
     * Variants in which the entry is labelled a "concurrent engagement".
     * A per-variant override, like `placementByVariant` and `titleByVariant`.
     */
    concurrentIn: z.array(variantSchema).min(1).optional(),
  })
  .strict()
  .superRefine((entry, context) => {
    if (
      entry.endDate !== null &&
      dateKey(entry.endDate) < dateKey(entry.startDate)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'must not be earlier than startDate',
      });
    }

    if (entry.variants !== undefined) {
      for (const variant of CV_VARIANTS) {
        if (
          entry.titleByVariant?.[variant] !== undefined &&
          !entry.variants.includes(variant)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['titleByVariant', variant],
            message: 'must belong to one of the entry variants',
          });
        }

        if (
          entry.placementByVariant?.[variant] !== undefined &&
          !entry.variants.includes(variant)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['placementByVariant', variant],
            message: 'must belong to one of the entry variants',
          });
        }

        if (
          entry.concurrentIn?.includes(variant) === true &&
          !entry.variants.includes(variant)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['concurrentIn', variant],
            message: 'must belong to one of the entry variants',
          });
        }
      }
    }

    entry.bullets.forEach((bullet, index) => {
      const bulletVariants = bullet.variants ?? entry.variants;

      if (bulletVariants === undefined) {
        return;
      }

      for (const variant of CV_VARIANTS) {
        if (
          bullet.orderByVariant?.[variant] !== undefined &&
          !bulletVariants.includes(variant)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['bullets', index, 'orderByVariant', variant],
            message: 'must belong to one of the bullet variants',
          });
        }
      }
    });
  });

/**
 * The public contact details. Only these three channels are published; a phone
 * number is deliberately absent because it is injected at build time and never
 * tracked (see `src/content/contact.ts`).
 */
export const profileSchema = z
  .object({
    email: z.email(),
    linkedin: z.url(),
    github: z.url(),
  })
  .strict();

export const careerSchema = z
  .object({
    profile: profileSchema,
    entries: z.array(entrySchema).min(1),
  })
  .strict();

/**
 * Site chrome that is not tied to a career entry. Every user-facing string is
 * bilingual, so `content/ui.json` follows the same `{ en, es }` shape as the
 * career content and a missing translation names its own entry.
 */
export const uiSchema = z
  .object({
    siteName: bilingualSchema,
    home: z
      .object({
        heading: bilingualSchema,
        experienceLink: bilingualSchema,
      })
      .strict(),
    experience: z
      .object({
        heading: bilingualSchema,
      })
      .strict(),
    projects: z
      .object({
        heading: bilingualSchema,
      })
      .strict(),
    languageSwitcher: z
      .object({
        label: bilingualSchema,
        switchTo: bilingualSchema,
      })
      .strict(),
    cv: z
      .object({
        variantName: bilingualSchema,
        download: bilingualSchema,
      })
      .strict(),
  })
  .strict();

export type Bilingual = z.infer<typeof bilingualSchema>;
export type Bullet = z.infer<typeof bulletSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Career = z.infer<typeof careerSchema>;
export type UiStrings = z.infer<typeof uiSchema>;

export class ContentValidationError extends Error {
  constructor(
    readonly source: string,
    readonly issues: readonly z.core.$ZodIssue[],
  ) {
    const details = issues
      .map(
        (issue) =>
          `  - ${issue.path.length > 0 ? issue.path.join('.') : '(root)'}: ${issue.message}`,
      )
      .join('\n');

    super(`Invalid content in ${source}:\n${details}`);
    this.name = 'ContentValidationError';
  }
}

/**
 * Validate raw content and return the typed model. Both the site build and the
 * PDF pipeline go through this function; neither reads raw files.
 */
function validate<T>(schema: z.ZodType<T>, input: unknown, source: string): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new ContentValidationError(source, result.error.issues);
  }

  return result.data;
}

export function validateCareer(input: unknown, source: string): Career {
  return validate(careerSchema, input, source);
}

export function validateUi(input: unknown, source: string): UiStrings {
  return validate(uiSchema, input, source);
}
