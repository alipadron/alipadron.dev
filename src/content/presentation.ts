import type { Language } from './language';
import type {
  Bilingual,
  Bullet,
  Career,
  Entry,
  Placement,
  Profile,
  Variant,
} from './schema';

const PRESENT_LABEL: Bilingual = {
  en: 'Present',
  es: 'Actualidad',
};

const LOCATION_LABEL: Record<Entry['locationModel'], Bilingual> = {
  remote: { en: 'Remote', es: 'Remoto' },
  hybrid: { en: 'Hybrid', es: 'Híbrido' },
  onsite: { en: 'On-site', es: 'Presencial' },
};

export const VARIANT_LABELS: Record<Variant, Bilingual> = {
  'fullstack-ai': { en: 'Full-Stack + AI', es: 'Full-Stack + AI' },
  'tech-lead': { en: 'Tech Lead', es: 'Tech Lead' },
  freelance: { en: 'Freelance', es: 'Freelance' },
};

export const CONCURRENT_LABEL: Bilingual = {
  en: 'Concurrent engagement',
  es: 'Compromiso simultáneo',
};

/** An entry after the variant filters, overrides and ordering have been applied. */
export type SelectedEntry = Omit<
  Entry,
  | 'variants'
  | 'titleByVariant'
  | 'placement'
  | 'placementByVariant'
  | 'concurrentIn'
  | 'bullets'
> & {
  readonly bullets: readonly Bullet[];
  readonly concurrent: boolean;
};

/** The entries for one section, already filtered and placed. */
export interface SelectedContent {
  readonly experience: readonly SelectedEntry[];
  readonly projects: readonly SelectedEntry[];
}

/** One CV document's content: the same entry can land in either section. */
export interface VariantCv extends SelectedContent {
  readonly variant: Variant;
}

/** An entry without `variants` belongs to every variant. */
function belongsToVariant(
  variants: readonly Variant[] | undefined,
  variant: Variant,
): boolean {
  return variants === undefined || variants.includes(variant);
}

function sortBullets(
  bullets: readonly Bullet[],
  orderOf: (bullet: Bullet) => number,
): Bullet[] {
  return [...bullets].sort((left, right) => orderOf(left) - orderOf(right));
}

function orderedBullets(entry: Entry, variant: Variant): Bullet[] {
  return sortBullets(
    entry.bullets.filter((bullet) =>
      belongsToVariant(bullet.variants, variant),
    ),
    (bullet) => bullet.orderByVariant?.[variant] ?? bullet.order,
  );
}

function allBullets(entry: Entry): Bullet[] {
  return sortBullets(entry.bullets, (bullet) => bullet.order);
}

function resolveTitle(entry: Entry, variant: Variant): Bilingual {
  return entry.titleByVariant?.[variant] ?? entry.title;
}

/**
 * The summary for one variant. The master summary is the Full-Stack + AI
 * default, so variants that do not need their own framing keep it.
 */
export function resolveSummary(profile: Profile, variant: Variant): Bilingual {
  return profile.summaryByVariant?.[variant] ?? profile.summary;
}

function resolvePlacement(entry: Entry, variant?: Variant): Placement {
  if (variant === undefined) {
    return entry.placement ?? 'experience';
  }

  return entry.placementByVariant?.[variant] ?? entry.placement ?? 'experience';
}

function selectEntry(entry: Entry, variant?: Variant): SelectedEntry {
  const variantSpecific = variant ?? null;

  return {
    id: entry.id,
    company: entry.company,
    title:
      variantSpecific === null
        ? entry.title
        : resolveTitle(entry, variantSpecific),
    startDate: entry.startDate,
    endDate: entry.endDate,
    locationModel: entry.locationModel,
    stack: entry.stack,
    bullets:
      variantSpecific === null
        ? allBullets(entry)
        : orderedBullets(entry, variantSpecific),
    concurrent:
      variantSpecific !== null &&
      entry.concurrentIn?.includes(variantSpecific) === true,
  };
}

function placeEntries(career: Career, variant?: Variant): SelectedContent {
  const experience: SelectedEntry[] = [];
  const projects: SelectedEntry[] = [];

  for (const entry of career.entries) {
    if (variant !== undefined && !belongsToVariant(entry.variants, variant)) {
      continue;
    }

    const selected = selectEntry(entry, variant);
    if (resolvePlacement(entry, variant) === 'project') {
      projects.push(selected);
    } else {
      experience.push(selected);
    }
  }

  return { experience, projects };
}

/**
 * Filter, place and order the shared content for one CV variant. The site and
 * the PDF renderer both consume this function rather than reading raw entries.
 */
export function selectVariant(career: Career, variant: Variant): VariantCv {
  return { variant, ...placeEntries(career, variant) };
}

/**
 * The site's full experience: every entry and bullet, with the base title and
 * placement. Variant tailoring only affects the CV documents.
 */
export function selectAll(career: Career): SelectedContent {
  return placeEntries(career);
}

export function formatDateRange(
  entry: Pick<SelectedEntry, 'startDate' | 'endDate'>,
  language: Language = 'en',
): string {
  return `${entry.startDate} – ${entry.endDate ?? PRESENT_LABEL[language]}`;
}

export function formatLocationModel(
  locationModel: Entry['locationModel'],
  language: Language = 'en',
): string {
  return LOCATION_LABEL[locationModel][language];
}
