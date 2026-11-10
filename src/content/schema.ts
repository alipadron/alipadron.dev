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
    if (role.endDate !== null && role.endDate < role.startDate) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'must not be earlier than startDate',
      });
    }
  });

export const careerSchema = z
  .object({
    roles: z.array(roleSchema).min(1),
  })
  .strict();

export type Bilingual = z.infer<typeof bilingualSchema>;
export type Bullet = z.infer<typeof bulletSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Career = z.infer<typeof careerSchema>;

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
 * Validate raw content and return the typed career model. Both the site build
 * and the PDF pipeline go through this function; neither reads raw files.
 */
export function validateCareer(input: unknown, source: string): Career {
  const result = careerSchema.safeParse(input);

  if (!result.success) {
    throw new ContentValidationError(source, result.error.issues);
  }

  return result.data;
}
