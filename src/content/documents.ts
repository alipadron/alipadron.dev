import {
  phoneForOutput,
  publicContactLinks,
  type ContactLink,
  type ContactOptions,
} from './contact';
import { LANGUAGES, type Language } from './language';
import {
  CONCURRENT_LABEL,
  formatDateRange,
  formatLocationModel,
  resolveSummary,
  VARIANT_LABELS,
  type SelectedEntry,
  type VariantCv,
} from './presentation';
import type { Profile, UiStrings } from './schema';
import { CV_VARIANTS, type Variant } from './variants';

/** A CV document is one (variant, language) pair; there are six. */
export interface CvDocument {
  readonly variant: Variant;
  readonly language: Language;
  /** Whether the site links to this document's PDF. */
  readonly published: boolean;
}

/** Every CV document the pipeline builds, in language-major order. */
export const CV_DOCUMENTS: readonly CvDocument[] = LANGUAGES.flatMap(
  (language) =>
    CV_VARIANTS.map((variant) => ({
      variant,
      language,
      published: variant === 'fullstack-ai',
    })),
);

/**
 * The publication rule: only the Full-Stack + AI CVs are downloadable from the
 * site. The other four documents are built locally and never reach site output.
 */
export const PUBLISHED_DOCUMENTS: readonly CvDocument[] = CV_DOCUMENTS.filter(
  (document) => document.published,
);

/** Directory (inside the site output) that holds the downloadable PDFs. */
export const PUBLISHED_CV_DIR = 'cv';

/** `cv-en-fullstack-ai`, used for every file of one document. */
export function cvDocumentBaseName(document: CvDocument): string {
  return `cv-${document.language}-${document.variant}`;
}

/** The site-relative URL of a downloadable PDF. */
export function publishedCvHref(document: CvDocument): string {
  return `/${PUBLISHED_CV_DIR}/${cvDocumentBaseName(document)}.pdf`;
}

/** The published document for one language, or undefined if there is none. */
export function publishedDocumentFor(
  language: Language,
): CvDocument | undefined {
  return PUBLISHED_DOCUMENTS.find(
    (document) => document.language === language,
  );
}

/**
 * One CV document after the variant selection and all localized text have been
 * resolved. The PDF and DOCX renderers both consume this model, so a document's
 * text is defined once and cannot drift between formats.
 */
export interface CvEntryModel {
  readonly company: string;
  readonly title: string;
  /** Date range, location model and stack, already joined for display. */
  readonly details: string;
  readonly concurrent: string | null;
  readonly bullets: readonly string[];
}

export interface CvSectionModel {
  readonly heading: string;
  readonly entries: readonly CvEntryModel[];
}

export interface CvDocumentModel {
  readonly language: Language;
  readonly name: string;
  readonly variantLabel: string;
  readonly contact: readonly ContactLink[];
  /** Already passed through the local/published seam. */
  readonly phone: string | undefined;
  /** The variant's summary, falling back to the master summary. */
  readonly summary: string;
  readonly sections: readonly CvSectionModel[];
}

function entryModel(entry: SelectedEntry, language: Language): CvEntryModel {
  return {
    company: entry.company[language],
    title: entry.title[language],
    details: [
      formatDateRange(entry, language),
      formatLocationModel(entry.locationModel, language),
      entry.stack.join(', '),
    ].join(' · '),
    concurrent: entry.concurrent ? CONCURRENT_LABEL[language] : null,
    bullets: entry.bullets.map((bullet) => bullet.text[language]),
  };
}

function sectionModel(
  heading: string,
  entries: readonly SelectedEntry[],
  language: Language,
): CvSectionModel | null {
  if (entries.length === 0) {
    return null;
  }

  return {
    heading,
    entries: entries.map((entry) => entryModel(entry, language)),
  };
}

/**
 * Build the complete, format-neutral text of one CV document. Both the PDF and
 * the DOCX renderers start here, so they always carry the same content.
 */
export function buildCvDocumentModel(
  cv: VariantCv,
  profile: Profile,
  language: Language,
  ui: UiStrings,
  options: ContactOptions = {},
): CvDocumentModel {
  const sections = [
    sectionModel(ui.experience.heading[language], cv.experience, language),
    sectionModel(ui.projects.heading[language], cv.projects, language),
  ].filter((section): section is CvSectionModel => section !== null);

  return {
    language,
    name: ui.siteName[language],
    variantLabel: VARIANT_LABELS[cv.variant][language],
    contact: publicContactLinks(profile),
    phone: phoneForOutput(options),
    summary: resolveSummary(profile, cv.variant)[language],
    sections,
  };
}
