import type { Language } from '../content/language';
import type { UiStrings } from '../content/schema';
import { otherLanguage } from './i18n';
import { SITE_PAGES, localizedPath, type SitePath } from './routes';

/**
 * The public origin. Canonical, sharing and sitemap URLs always use it, even
 * when the page is served from a preview deployment.
 */
export const SITE_URL = 'https://alipadron.dev';

/**
 * The sharing image, committed under `public/` and regenerated from the site's
 * own tokens with `npm run og-image`.
 */
export const OG_IMAGE_PATH = '/og-image.png';

/**
 * Open Graph locales are `language_TERRITORY`. The site's Spanish is neutral,
 * so Spain is only the reference territory, not a promise of one variant.
 */
const OG_LOCALES: Record<Language, string> = {
  en: 'en_US',
  es: 'es_ES',
};

/** The page whose copy a route uses. */
export type SeoPageKey = keyof UiStrings['seo']['pages'];

/** The URLs of one page in every language it is published in. */
export interface PageAlternates {
  readonly en: string;
  readonly es: string;
  /** The English URL, which is the default for a language-agnostic visitor. */
  readonly xDefault: string;
}

/** Everything a page needs to describe itself in a search result or a share. */
export interface PageMetadata {
  readonly language: Language;
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly alternates: PageAlternates;
  readonly ogType: 'website';
  readonly ogImage: string;
  readonly imageAlt: string;
  readonly siteName: string;
  readonly ogLocale: string;
  readonly ogLocaleAlternate: string;
}

/** An absolute URL for a site path, so every canonical agrees on the origin. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

/**
 * The alternate URLs of a canonical page. They come from the same route table
 * as the prerender list, so a page cannot point at a language it never builds.
 */
export function pageAlternates(path: SitePath): PageAlternates {
  const en = absoluteUrl(localizedPath(path, 'en'));
  const es = absoluteUrl(localizedPath(path, 'es'));

  return { en, es, xDefault: en };
}

function seoKey(path: SitePath): SeoPageKey {
  switch (path) {
    case '/':
      return 'home';
    case '/experience':
      return 'experience';
    case '/contact':
      return 'contact';
  }
}

/**
 * The title and description of a page in one language. Both come from the
 * validated content module, so a missing translation fails the build before a
 * page can ship with empty metadata.
 */
function pageCopy(
  path: SitePath,
  language: Language,
  ui: UiStrings,
): { title: string; description: string } {
  const page = ui.seo.pages[seoKey(path)];

  return {
    title: page.title[language],
    description: page.description[language],
  };
}

export function pageMetadata(
  path: SitePath,
  language: Language,
  content: { readonly ui: UiStrings },
): PageMetadata {
  const { ui } = content;
  const copy = pageCopy(path, language, ui);
  const alternates = pageAlternates(path);

  return {
    language,
    title: copy.title,
    description: copy.description,
    canonical: language === 'en' ? alternates.en : alternates.es,
    alternates,
    ogType: 'website',
    ogImage: absoluteUrl(OG_IMAGE_PATH),
    imageAlt: ui.seo.imageAlt[language],
    siteName: ui.siteName[language],
    ogLocale: OG_LOCALES[language],
    ogLocaleAlternate: OG_LOCALES[otherLanguage(language)],
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * Every URL the site publishes, in both languages, each carrying the same
 * language alternates the pages declare. The route list is `SITE_PAGES`, the
 * same one the prerenderer consumes, so the sitemap cannot list a page that is
 * not built or miss one that is.
 */
export function sitemapXml(): string {
  const urls = SITE_PAGES.flatMap((path) => {
    const alternates = pageAlternates(path);
    const links = [
      ['en', alternates.en],
      ['es', alternates.es],
      ['x-default', alternates.xDefault],
    ]
      .map(
        ([hreflang, href]) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}" />`,
      )
      .join('\n');

    return [alternates.en, alternates.es].map(
      (loc) =>
        `  <url>\n    <loc>${escapeXml(loc)}</loc>\n${links}\n  </url>`,
    );
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

/** Points crawlers at the sitemap. The host comes from the same constant. */
export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}
