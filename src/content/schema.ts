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

/** `null` end date means the range is current, so it cannot be inverted. */
function isDateRangeInverted(range: {
  readonly startDate: string;
  readonly endDate: string | null;
}): boolean {
  return (
    range.endDate !== null && dateKey(range.endDate) < dateKey(range.startDate)
  );
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

/**
 * A headline figure on the Home page. The value is language-neutral, while the
 * label describes the achievement it comes from.
 */
export const metricSchema = z
  .object({
    id: z.string().trim().min(1),
    value: z.string().trim().min(1),
    label: bilingualSchema,
  })
  .strict();

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
    if (isDateRangeInverted(entry)) {
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
 * A group of skills under one label, for example "Backend" or the AI-native
 * way of working. Items are bilingual too, because some of them are phrases
 * rather than product names.
 */
export const skillGroupSchema = z
  .object({
    id: z.string().trim().min(1),
    label: bilingualSchema,
    items: z.array(bilingualSchema).min(1),
    variants: z.array(variantSchema).min(1).optional(),
  })
  .strict();

export const educationSchema = z
  .object({
    id: z.string().trim().min(1),
    institution: bilingualSchema,
    program: bilingualSchema,
    startDate: monthOrYearSchema,
    endDate: monthOrYearSchema,
  })
  .strict()
  .superRefine((education, context) => {
    if (isDateRangeInverted(education)) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'must not be earlier than startDate',
      });
    }
  });

export const languageEntrySchema = z
  .object({
    id: z.string().trim().min(1),
    name: bilingualSchema,
    level: bilingualSchema,
  })
  .strict();

/**
 * The public contact details. Only these three channels are published; a phone
 * number is deliberately absent because it is injected at build time and never
 * tracked (see `src/content/contact.ts`).
 *
 * The headline and summary carry the Full-Stack + AI narrative. A variant can
 * replace the summary with its own framing; the master summary is the
 * Full-Stack + AI default and the fallback for any variant without one.
 */
export const profileSchema = z
  .object({
    email: z.email(),
    linkedin: z.url(),
    github: z.url(),
    headline: bilingualSchema,
    summary: bilingualSchema,
    summaryByVariant: variantRecord(bilingualSchema).optional(),
  })
  .strict();

export const careerSchema = z
  .object({
    profile: profileSchema,
    metrics: z.array(metricSchema).min(1),
    entries: z.array(entrySchema).min(1),
    skills: z.array(skillGroupSchema).min(1),
    education: z.array(educationSchema).min(1),
    languages: z.array(languageEntrySchema).min(1),
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
    nav: z
      .object({
        label: bilingualSchema,
        home: bilingualSchema,
        howIWork: bilingualSchema,
        workWithMe: bilingualSchema,
        contact: bilingualSchema,
      })
      .strict(),
    home: z
      .object({
        heading: bilingualSchema,
        kicker: bilingualSchema,
        experienceLink: bilingualSchema,
        workWithMe: bilingualSchema,
        metricsHeading: bilingualSchema,
        readOn: bilingualSchema,
        photoPlaceholder: bilingualSchema,
        photoAlt: bilingualSchema,
        photoCaption: bilingualSchema,
      })
      .strict(),
    experience: z
      .object({
        heading: bilingualSchema,
        kicker: bilingualSchema,
        stackLabel: bilingualSchema,
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

/**
 * The long-form pages that are not career data: How I work, Work with me and
 * Contact. Their identifiers are also their routes, so the content key, the
 * page component and the navigation link cannot drift apart.
 */
export const CONTENT_PAGES = [
  'how-i-work',
  'work-with-me',
  'contact',
] as const;

export type ContentPageId = (typeof CONTENT_PAGES)[number];

const contentPageIdSchema = z.enum(CONTENT_PAGES, {
  error: `unknown page; expected one of ${CONTENT_PAGES.join(', ')}`,
});

/**
 * A paragraph of long-form copy. Every block is bilingual, so a page cannot be
 * built with one language missing.
 */
const paragraphSchema = z
  .object({
    type: z.literal('paragraph'),
    text: bilingualSchema,
  })
  .strict();

/** A bullet list, one bilingual item per line. */
const listSchema = z
  .object({
    type: z.literal('list'),
    items: z.array(bilingualSchema).min(1),
  })
  .strict();

/** A named item with a description, rendered as a definition list or a card. */
const termSchema = z
  .object({
    term: bilingualSchema,
    description: bilingualSchema,
  })
  .strict();

const termsSchema = z
  .object({
    type: z.literal('terms'),
    items: z.array(termSchema).min(1),
  })
  .strict();

/** The same shape as `terms`, but the order is meaningful, so it is numbered. */
const stepsSchema = z
  .object({
    type: z.literal('steps'),
    items: z.array(termSchema).min(1),
  })
  .strict();

/**
 * The three public contact channels, resolved from the profile at render time
 * rather than duplicated in the page content.
 */
const contactSchema = z.object({ type: z.literal('contact') }).strict();

/** A link to another page, localized by the renderer. */
const pageLinkSchema = z
  .object({
    type: z.literal('pageLink'),
    label: bilingualSchema,
    page: contentPageIdSchema,
  })
  .strict();

/** A primary action. The only action the site has is writing an email. */
const actionSchema = z
  .object({
    type: z.literal('action'),
    label: bilingualSchema,
  })
  .strict();

const blockSchema = z.discriminatedUnion('type', [
  paragraphSchema,
  listSchema,
  termsSchema,
  stepsSchema,
  contactSchema,
  pageLinkSchema,
  actionSchema,
]);

const sectionSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'must be a lowercase slug (a-z, 0-9, -)'),
    heading: bilingualSchema,
    blocks: z.array(blockSchema).min(1),
  })
  .strict();

const pageSchema = z
  .object({
    kicker: bilingualSchema,
    title: bilingualSchema,
    intro: bilingualSchema,
    sections: z.array(sectionSchema).min(1),
  })
  .strict();

/**
 * The long-form pages. The keys are the English routes, so a page cannot be
 * published without content and every string follows the same `{ en, es }`
 * rule as the rest of the site.
 */
export const pagesSchema = z
  .object({
    'how-i-work': pageSchema,
    'work-with-me': pageSchema,
    contact: pageSchema,
  })
  .strict();

export type Bilingual = z.infer<typeof bilingualSchema>;
export type PageBlock = z.infer<typeof blockSchema>;
export type PageSection = z.infer<typeof sectionSchema>;
export type ContentPage = z.infer<typeof pageSchema>;
export type Pages = z.infer<typeof pagesSchema>;
export type Bullet = z.infer<typeof bulletSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type Profile = z.infer<typeof profileSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Education = z.infer<typeof educationSchema>;
export type LanguageEntry = z.infer<typeof languageEntrySchema>;
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

export function validatePages(input: unknown, source: string): Pages {
  return validate(pagesSchema, input, source);
}
