import type { Profile } from './schema';

/** A contact channel as it appears in a public output (site or PDF). */
export interface ContactLink {
  href: string;
  /** The URL or address without protocol, for display. */
  text: string;
}

/** Build-time contact inputs that are not part of the tracked content. */
export interface ContactOptions {
  /** Phone number from `CV_PHONE`; never part of the tracked content. */
  phone?: string;
  /** Whether this output is published; a published output never shows a phone. */
  published?: boolean;
}

/**
 * The seam between local and published output.
 *
 * `CV_PUBLISHED` marks a build as published. Unset means local, so a local
 * build is the default and only an explicit flag can widen what is shown.
 * Any value other than an explicit false counts as published: a typo must fail
 * closed (no phone) rather than leak a phone number into a published PDF.
 */
export function isPublished(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return !['0', 'false', 'no', 'off'].includes(normalized);
}

/**
 * The phone number that may appear in this output.
 *
 * A phone number is only ever passed in from the environment (`CV_PHONE`); it
 * is never part of the tracked content. Published output drops it even when it
 * is provided, so a published PDF cannot leak it.
 */
export function phoneForOutput(options: ContactOptions): string | undefined {
  if (options.published) {
    return undefined;
  }

  const phone = options.phone?.trim();

  return phone ? phone : undefined;
}

/** The three channels every public output carries. */
export function publicContactLinks(profile: Profile): readonly ContactLink[] {
  return [
    {
      href: `mailto:${profile.email}`,
      text: profile.email,
    },
    {
      href: profile.linkedin,
      text: displayUrl(profile.linkedin),
    },
    {
      href: profile.github,
      text: displayUrl(profile.github),
    },
  ];
}

function displayUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}
