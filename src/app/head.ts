import type { PageMetadata } from './seo';

/**
 * Set on every element this module creates, so a later navigation can find and
 * replace it instead of appending a second copy.
 */
const GENERATED = 'data-seo';

type MetaTag = readonly [
  attribute: 'name' | 'property',
  key: string,
  value: (metadata: PageMetadata) => string,
];

/** The meta tags every page carries, in the order they are written. */
const META_TAGS: readonly MetaTag[] = [
  ['name', 'description', (metadata) => metadata.description],
  ['property', 'og:type', (metadata) => metadata.ogType],
  ['property', 'og:site_name', (metadata) => metadata.siteName],
  ['property', 'og:title', (metadata) => metadata.title],
  ['property', 'og:description', (metadata) => metadata.description],
  ['property', 'og:url', (metadata) => metadata.canonical],
  ['property', 'og:image', (metadata) => metadata.ogImage],
  ['property', 'og:image:width', () => '1200'],
  ['property', 'og:image:height', () => '630'],
  ['property', 'og:image:alt', (metadata) => metadata.imageAlt],
  ['property', 'og:locale', (metadata) => metadata.ogLocale],
  ['property', 'og:locale:alternate', (metadata) => metadata.ogLocaleAlternate],
  ['name', 'twitter:card', () => 'summary_large_image'],
  ['name', 'twitter:title', (metadata) => metadata.title],
  ['name', 'twitter:description', (metadata) => metadata.description],
  ['name', 'twitter:image', (metadata) => metadata.ogImage],
  ['name', 'twitter:image:alt', (metadata) => metadata.imageAlt],
];

function setMeta(
  document: Document,
  attribute: 'name' | 'property',
  key: string,
  content: string,
): void {
  const existing = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (existing) {
    existing.content = content;
    return;
  }

  const meta = document.createElement('meta');
  meta.setAttribute(attribute, key);
  meta.content = content;
  meta.setAttribute(GENERATED, key);
  document.head.appendChild(meta);
}

function setLink(
  document: Document,
  rel: string,
  href: string,
  hreflang?: string,
): void {
  const selector =
    hreflang === undefined
      ? `link[rel="${rel}"]`
      : `link[rel="${rel}"][hreflang="${hreflang}"]`;

  let link = document.head.querySelector<HTMLLinkElement>(selector);

  if (!link) {
    link = document.createElement('link');
    link.rel = rel;

    if (hreflang !== undefined) {
      link.hreflang = hreflang;
    }

    link.setAttribute(GENERATED, hreflang ?? rel);
    document.head.appendChild(link);
  }

  link.href = href;
}

/**
 * Writes a page's metadata into the document head. The tags are upserted by
 * identity, so prerendering, hydration and client-side navigation all end up
 * with exactly one canonical, one pair of alternates and one set of sharing
 * tags. Called during prerendering, which is what puts the tags in the static
 * HTML a crawler or a link preview reads.
 */
export function applyPageMetadata(
  document: Document,
  metadata: PageMetadata,
): void {
  document.title = metadata.title;
  document.documentElement.lang = metadata.language;

  for (const [attribute, key, value] of META_TAGS) {
    setMeta(document, attribute, key, value(metadata));
  }

  setLink(document, 'canonical', metadata.canonical);
  setLink(document, 'alternate', metadata.alternates.en, 'en');
  setLink(document, 'alternate', metadata.alternates.es, 'es');

  // `x-default` names the page for a visitor whose language is none of the
  // published ones, so it belongs to the English page only.
  if (metadata.language === 'en') {
    setLink(document, 'alternate', metadata.alternates.xDefault, 'x-default');
  } else {
    document.head
      .querySelector('link[rel="alternate"][hreflang="x-default"]')
      ?.remove();
  }
}
