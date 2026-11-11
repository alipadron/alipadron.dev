/**
 * The case studies the site publishes. The id is also the last segment of the
 * page URL, so the routes and the content are derived from the same list and a
 * study cannot exist in one place without the other.
 */
export const CASE_STUDY_IDS = [
  'gofeels',
  'car-log',
  'medication-manager',
] as const;

export type CaseStudyId = (typeof CASE_STUDY_IDS)[number];
