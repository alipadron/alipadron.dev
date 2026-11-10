import type { Language } from './language';
import type { Role } from './schema';

const PRESENT_LABEL: Record<Language, string> = {
  en: 'Present',
  es: 'Actualidad',
};

const LOCATION_LABEL: Record<Role['locationModel'], Record<Language, string>> = {
  remote: { en: 'Remote', es: 'Remoto' },
  hybrid: { en: 'Hybrid', es: 'Híbrido' },
  onsite: { en: 'On-site', es: 'Presencial' },
};

/**
 * Presentation selectors shared by the site page and the PDF renderer so both
 * outputs order and label the same content identically.
 */
export function orderedBullets(role: Role) {
  return [...role.bullets].sort((left, right) => left.order - right.order);
}

export function formatDateRange(
  role: Role,
  language: Language = 'en',
): string {
  return `${role.startDate} – ${role.endDate ?? PRESENT_LABEL[language]}`;
}

export function formatLocationModel(
  locationModel: Role['locationModel'],
  language: Language = 'en',
): string {
  return LOCATION_LABEL[locationModel][language];
}
