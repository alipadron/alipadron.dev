import type { Role } from './schema';

const PRESENT_LABEL = {
  en: 'Present',
  es: 'Actualidad',
} as const;

const LOCATION_LABEL = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
} as const;

export type ContentLanguage = keyof typeof PRESENT_LABEL;

/**
 * Presentation selectors shared by the site page and the PDF renderer so both
 * outputs order and label the same content identically.
 */
export function orderedBullets(role: Role) {
  return [...role.bullets].sort((left, right) => left.order - right.order);
}

export function formatDateRange(
  role: Role,
  language: ContentLanguage = 'en',
): string {
  return `${role.startDate} – ${role.endDate ?? PRESENT_LABEL[language]}`;
}

export function formatLocationModel(locationModel: Role['locationModel']): string {
  return LOCATION_LABEL[locationModel];
}
