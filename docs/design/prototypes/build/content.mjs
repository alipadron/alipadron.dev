// Real English content for the throwaway prototypes. Nothing here is imported
// by the app: this reads the same career.json the site reads, so the mocks say
// what the site will say.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..', '..');

const career = JSON.parse(readFileSync(join(root, 'content/career.json'), 'utf8'));

export const profile = career.profile;
export const siteName = 'Alí Padrón';

export const contact = [
  { label: profile.email, href: `mailto:${profile.email}` },
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'GitHub', href: profile.github },
];

/** Navigation the spec promises. Only Home and Experience exist as mocks. */
export const nav = [
  { label: 'Home', href: 'index.html' },
  { label: 'Experience', href: 'experience.html' },
  { label: 'Case studies', href: null },
  { label: 'How I work', href: null },
  { label: 'Work with me', href: null },
  { label: 'Contact', href: null },
];

export const cvHref = '/cv/cv-en-fullstack-ai.pdf';

/** Headline numbers lifted from the career descriptions. */
export const metrics = [
  { value: '+150', label: 'hotels on the hotel PMS' },
  { value: '+750k', label: 'room reservations' },
  { value: '~13×', label: 'yearly reservations, 2020 → 2025' },
  { value: '7 min', label: 'release, down from 30+' },
];

const byOrder = (left, right) => left.order - right.order;
const placement = (entry) => entry.placement ?? 'experience';

export const experience = career.entries
  .filter((entry) => placement(entry) === 'experience')
  .map((entry) => ({ ...entry, bullets: [...entry.bullets].sort(byOrder) }));

export const projects = career.entries
  .filter((entry) => placement(entry) === 'project')
  .map((entry) => ({ ...entry, bullets: [...entry.bullets].sort(byOrder) }));

export function dates(entry) {
  return `${entry.startDate} – ${entry.endDate ?? 'Present'}`;
}

const LOCATION = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' };

export function location(entry) {
  return LOCATION[entry.locationModel];
}

export function esc(value) {
  return String(value).replace(
    /[&<>"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char],
  );
}

export function en(value) {
  return esc(typeof value === 'string' ? value : value.en);
}
