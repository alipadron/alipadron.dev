import { z } from 'zod';

/**
 * The CV variants. A content entry without `variants` belongs to every variant.
 */
export const variantSchema = z.enum(['fullstack-ai', 'tech-lead', 'freelance']);
export type Variant = z.infer<typeof variantSchema>;

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

export const bulletSchema = z
  .object({
    id: z.string().trim().min(1),
    order: z.number().int().nonnegative(),
    text: bilingualSchema,
    variants: z.array(variantSchema).min(1).optional(),
  })
  .strict();

export const roleSchema = z
  .object({
    id: z.string().trim().min(1),
    company: bilingualSchema,
    title: bilingualSchema,
    startDate: monthOrYearSchema,
    /** `null` means the role is current. */
    endDate: monthOrYearSchema.nullable(),
    locationModel: z.enum(['remote', 'hybrid', 'onsite']),
    stack: z.array(z.string().trim().min(1)).min(1),
    bullets: z.array(bulletSchema).min(1),
    variants: z.array(variantSchema).min(1).optional(),
  })
  .strict()
  .superRefine((role, context) => {
    if (
      role.endDate !== null &&
      dateKey(role.endDate) < dateKey(role.startDate)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'must not be earlier than startDate',
      });
    }
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
    roles: z.array(roleSchema).min(1),
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
    languageSwitcher: z
      .object({
        label: bilingualSchema,
        switchTo: bilingualSchema,
      })
      .strict(),
    cv: z
      .object({
        variantName: bilingualSchema,
      })
      .strict(),
  })
  .strict();

export type Bilingual = z.infer<typeof bilingualSchema>;
export type Bullet = z.infer<typeof bulletSchema>;
export type Role = z.infer<typeof roleSchema>;
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
