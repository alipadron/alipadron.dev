import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  PROJECT_ROOT,
  extractPdfText,
  runNpmOrThrow,
  runNpmScript,
} from './support/build-harness';
import { CV_SUMMARIES, CV_TITLES } from './support/cv-expectations';

const PRERENDER_DIR = path.join(PROJECT_ROOT, 'dist/analog/public');
const ARTIFACTS_DIR = path.join(os.tmpdir(), `alipadron-variants-${process.pid}`);
const VARIANT_FIXTURE_DIR = path.join(PROJECT_ROOT, 'tests/fixtures/variants');
const VARIANT_OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'variant-fixture');

const CV_VARIANTS = ['fullstack-ai', 'tech-lead', 'freelance'] as const;
type CvVariant = (typeof CV_VARIANTS)[number];

// Kept as literals on purpose: these tests observe build outputs and never
// import the content module or its schema.
const EXPECTED = {
  company: 'GoFeels',
  en: {
    title: 'Senior Full-Stack Engineer / Tech Lead',
    bullet:
      'Contribute to the full-stack development of a hotel PMS built with AngularJS and Laravel, as part of a small team; it is used by +150 hotels with +2,000 rooms.',
    releaseBullet: 'Cut release time from 30+ minutes to about 7',
    growthBullet: 'past +750k reservations in total',
    paymentsBullet:
      'Built the online payments (Webpay, Stripe, PayPal) for the booking engine',
    techLeadBullet: 'Act as technical lead',
    warehouseBullet: 'Built a warehouse and package-tracking system',
    experienceHeading: 'Experience',
    present: 'Present',
    location: 'Remote',
    homeLink: 'Read the experience',
    headline:
      'Senior Full-Stack Engineer · Angular &amp; Laravel · AI-native delivery',
    summary: 'AI agents are part of how I work every day',
    contact: 'Contact',
    contactHref: '/contact',
  },
  es: {
    title: 'Ingeniero Full-Stack Senior / Líder técnico',
    bullet:
      'Contribuyo al desarrollo full-stack de un PMS hotelero construido con AngularJS y Laravel, como parte de un equipo pequeño; lo usan más de 150 hoteles con más de 2.000 habitaciones.',
    releaseBullet: 'Reduje el tiempo de lanzamiento de más de 30 minutos a unos 7',
    growthBullet: 'hasta superar las 750.000 reservas acumuladas',
    paymentsBullet: 'Implementé los pagos en línea (Webpay, Stripe, PayPal)',
    experienceHeading: 'Experiencia',
    present: 'Actualidad',
    location: 'Remoto',
    homeLink: 'Leer la experiencia',
    headline:
      'Ingeniero Full-Stack Senior · Angular y Laravel · entrega con IA nativa',
    summary: 'Trabajo con agentes de IA en el día a día',
    contact: 'Contacto',
    contactHref: '/es/contact',
  },
};

const FIXTURE_TEXT = {
  shared: 'Shared engagement bullet shown in every CV.',
  reordered: 'Shared engagement bullet moved first for Tech Lead.',
  freelanceOnly: 'Freelance-only contract audit bullet.',
  techLeadOnly: 'Tech-Lead-only release ownership bullet.',
  concurrent: 'Concurrent venture bullet.',
  tuapplicaya: 'Tuapplicaya pre-launch bullet.',
  taggedEntry: 'Tagged Only Company',
  techLeadTitle: 'Co-founder & Technical Lead',
  concurrentLabel: 'Concurrent engagement',
};

// The rest of the English master content, asserted through the page the site
// renders from it. Apostrophes are avoided because the markup escapes them.
const MASTER_CONTENT = {
  en: [
    'Built a real-time market-data and news platform',
    'PayGoLatam, a USD-to-VES remittance platform',
    'articles from RSS feeds, scrapers and third-party APIs',
    'used by dozens of business customers',
    'migrating a construction ERP from Silverlight to Angular',
    'Google Maps geolocation module',
    'Co-founded Tuapplicaya and lead its technical side',
    'Caracol de Tinta (literary magazine)',
    'Americas Quarterly: built interactive maps',
    'Offline-first vehicle maintenance PWA',
    'Household medication PWA',
  ],
  es: [
    'una plataforma de datos de mercado y noticias en tiempo real',
    'PayGoLatam, una plataforma de remesas de USD a VES',
    'artículos de fuentes RSS, scrapers y APIs de terceros',
    'decenas de clientes empresariales',
    'un ERP de construcción de Silverlight a Angular',
    'módulo de geolocalización con Google Maps',
    'Cofundé Tuapplicaya y dirijo su área técnica',
    'Caracol de Tinta (revista literaria)',
    'Americas Quarterly: construí mapas interactivos',
    'PWA de mantenimiento de vehículos con soporte offline',
    'PWA de gestión de medicamentos para el hogar',
  ],
};

/**
 * The long-form pages. Each one is asserted through the text a reader sees, so
 * the test does not care how the page is composed.
 */
const DOCUMENT_PAGES = {
  en: {
    contact: {
      kicker: 'Contact',
      title: 'Contact',
      intro: 'Email is the fastest way to reach me',
      sections: ['Direct', 'What to send', 'For recruiters', 'Freelance work'],
    },
  },
  es: {
    contact: {
      kicker: 'Contacto',
      title: 'Contacto',
      intro: 'La forma más rápida de llegar a mí es el correo',
      sections: ['Directo', 'Qué contar', 'Para reclutadores', 'Trabajo freelance'],
    },
  },
} as const;

/** Prerendered pages, copied out of `dist/` before the fixtures rebuild it. */
const PAGES = [
  { source: 'index.html', artifact: 'home-en.html', path: '/', language: 'en' },
  {
    source: 'es/index.html',
    artifact: 'home-es.html',
    path: '/',
    language: 'es',
  },
  {
    source: 'experience/index.html',
    artifact: 'experience-en.html',
    path: '/experience',
    language: 'en',
  },
  {
    source: 'es/experience/index.html',
    artifact: 'experience-es.html',
    path: '/experience',
    language: 'es',
  },
  {
    source: 'contact/index.html',
    artifact: 'contact-en.html',
    path: '/contact',
    language: 'en',
  },
  {
    source: 'es/contact/index.html',
    artifact: 'contact-es.html',
    path: '/contact',
    language: 'es',
  },
] as const;

/**
 * The title and description each page ships in its head. Kept as literals on
 * purpose: these tests observe prerendered HTML, and a copy change that reaches
 * the site without reaching here should be a failing test, not a silent update.
 */
const PAGE_SEO: Record<string, { title: string; description: string }> = {
  'home-en.html': {
    title: 'Alí Padrón — Senior Full-Stack Engineer, Angular &amp; Laravel',
    description:
      'Senior full-stack engineer working remotely in Angular and Laravel, with AI agents as part of my daily work.',
  },
  'home-es.html': {
    title: 'Alí Padrón — Ingeniero Full-Stack Senior, Angular y Laravel',
    description:
      'Ingeniero full-stack senior, remoto, en Angular y Laravel, con agentes de IA como parte de mi trabajo diario.',
  },
  'experience-en.html': {
    title: 'Experience — Alí Padrón',
    description:
      'Roles at GoFeels, Tuapplicaya and more: a hotel PMS used by +150 hotels, freelance work for independent clients, and earlier frontend and full-stack roles.',
  },
  'experience-es.html': {
    title: 'Experiencia — Alí Padrón',
    description:
      'Roles en GoFeels, Tuapplicaya y más: un PMS hotelero usado por más de 150 hoteles, trabajo freelance para clientes independientes y roles anteriores de frontend y full-stack.',
  },
  'contact-en.html': {
    title: 'Contact — Alí Padrón',
    description:
      'The fastest way to reach Alí Padrón is email. LinkedIn and GitHub are here too, plus freelance work.',
  },
  'contact-es.html': {
    title: 'Contacto — Alí Padrón',
    description:
      'La forma más rápida de llegar a Alí Padrón es el correo. También LinkedIn, GitHub y trabajo freelance.',
  },
};

const SITE_ORIGIN = 'https://alipadron.dev';
const OG_IMAGE_URL = `${SITE_ORIGIN}/og-image.png`;

type NpmResult = ReturnType<typeof runNpmScript>;

function readArtifact(name: string): string {
  return readFileSync(path.join(ARTIFACTS_DIR, name), 'utf8');
}

/** The switcher's href, read from the prerendered markup of one page. */
function switcherHref(html: string): string {
  const switcher = html.match(
    /<app-language-switcher[\s\S]*?<\/app-language-switcher>/,
  );

  if (!switcher) {
    throw new Error('language switcher not found in page');
  }

  const href = switcher[0].match(/href="([^"]+)"/);

  if (!href) {
    throw new Error('language switcher has no link');
  }

  return href[1];
}

/** Resolves a site path to the HTML file a static host would serve for it. */
function prerenderedFile(href: string): string {
  const cleanPath = href.split('#')[0].split('?')[0];
  const relative = cleanPath.replace(/^\/|\/$/g, '');

  return path.join(PRERENDER_DIR, relative, 'index.html');
}

/** The absolute URL a page publishes in its canonical and sharing tags. */
function localizedUrl(sitePath: string, language: 'en' | 'es'): string {
  if (language === 'en') {
    return `${SITE_ORIGIN}${sitePath}`;
  }

  return `${SITE_ORIGIN}/es${sitePath === '/' ? '' : sitePath}`;
}

/** The attributes of every `<tag …>` in a fragment, for head assertions. */
function htmlTags(html: string, tag: string): Map<string, string>[] {
  const found: Map<string, string>[] = [];

  for (const match of html.matchAll(new RegExp(`<${tag}\\s[^>]*>`, 'g'))) {
    const attributes = new Map<string, string>();

    for (const attribute of match[0].matchAll(/([\w:-]+)="([^"]*)"/g)) {
      attributes.set(attribute[1], attribute[2]);
    }

    found.push(attributes);
  }

  return found;
}

function metaContent(
  html: string,
  attribute: 'name' | 'property',
  key: string,
): string | undefined {
  return htmlTags(html, 'meta')
    .find((meta) => meta.get(attribute) === key)
    ?.get('content');
}

function linkHref(
  html: string,
  attributes: Record<string, string>,
): string | undefined {
  return htmlTags(html, 'link')
    .find((link) =>
      Object.entries(attributes).every(([key, value]) => link.get(key) === value),
    )
    ?.get('href');
}

function pageTitle(html: string): string | undefined {
  return html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
}

function sitemapBlock(xml: string, url: string): string {
  return (
    xml
      .split('</url>')
      .find((block) => block.includes(`<loc>${url}</loc>`)) ?? ''
  );
}

/** The links in the primary navigation, in the order a reader sees them. */
function primaryNavHrefs(html: string): readonly string[] {
  const nav = html.match(
    /<nav[^>]*class="primary-nav"[^>]*>([\s\S]*?)<\/nav>/,
  );

  if (!nav) {
    throw new Error('primary navigation not found in page');
  }

  return [...nav[1].matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
}

function artifactPdfText(name: string): Promise<string> {
  return extractPdfText(path.join(ARTIFACTS_DIR, name));
}

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

function expectFailure(result: NpmResult): void {
  expect(result.status, result.output).not.toBe(0);
  expect(result.output).toContain('Invalid content in');
  expect(result.output).toContain('career.json');
}

describe('build-level outputs', () => {
  beforeAll(() => {
    mkdirSync(ARTIFACTS_DIR, { recursive: true });

    runNpmOrThrow('build');

    for (const { source, artifact } of PAGES) {
      copyFileSync(
        path.join(PRERENDER_DIR, source),
        path.join(ARTIFACTS_DIR, artifact),
      );
    }

    for (const file of ['sitemap.xml', 'robots.txt']) {
      copyFileSync(
        path.join(PRERENDER_DIR, file),
        path.join(ARTIFACTS_DIR, file),
      );
    }

    runNpmOrThrow('pdf');

    for (const variant of CV_VARIANTS) {
      copyFileSync(
        path.join(PROJECT_ROOT, `output/cv-en-${variant}.pdf`),
        path.join(ARTIFACTS_DIR, `cv-en-${variant}.pdf`),
      );
    }

    copyFileSync(
      path.join(PROJECT_ROOT, 'output/cv-es-fullstack-ai.pdf'),
      path.join(ARTIFACTS_DIR, 'cv-es-fullstack-ai.pdf'),
    );
  });

  afterAll(() => {
    rmSync(ARTIFACTS_DIR, { recursive: true, force: true });

    // Fixture builds above write into the real dist/ directory, so the last
    // fixture would be what a local preview or a deploy sees. Restore the real
    // content once the assertions are done.
    runNpmScript('build');
  });

  it('prerenders the English Experience page from the content', () => {
    const html = readArtifact('experience-en.html');

    expect(html).toContain('<html lang="en">');
    expect(html).toContain(EXPECTED.company);
    expect(html).toContain(EXPECTED.en.title);
    expect(html).toContain(EXPECTED.en.bullet);
    expect(html).toContain(EXPECTED.en.growthBullet);
    expect(html).toContain(EXPECTED.en.releaseBullet);
    expect(html).toContain(EXPECTED.en.paymentsBullet);
    expect(html).toContain(EXPECTED.en.experienceHeading);
    expect(html).toContain(EXPECTED.en.present);
  });

  it('prerenders the Spanish Experience page from the same content', () => {
    const html = readArtifact('experience-es.html');

    expect(html).toContain('<html lang="es">');
    expect(html).toContain(EXPECTED.company);
    expect(html).toContain(EXPECTED.es.title);
    expect(html).toContain(EXPECTED.es.bullet);
    expect(html).toContain(EXPECTED.es.growthBullet);
    expect(html).toContain(EXPECTED.es.releaseBullet);
    expect(html).toContain(EXPECTED.es.paymentsBullet);
    expect(html).toContain(EXPECTED.es.experienceHeading);
    expect(html).toContain(EXPECTED.es.present);
    expect(html).toContain('Remoto');
  });

  it('prerenders every non-GoFeels role from the content', () => {
    const english = readArtifact('experience-en.html');
    const spanish = readArtifact('experience-es.html');

    for (const snippet of MASTER_CONTENT.en) {
      expect(english, snippet).toContain(snippet);
    }

    for (const snippet of MASTER_CONTENT.es) {
      expect(spanish, snippet).toContain(snippet);
    }
  });

  it('prerenders both Home pages with language-specific links', () => {
    const english = readArtifact('home-en.html');
    const spanish = readArtifact('home-es.html');

    expect(english).toContain('<html lang="en">');
    expect(english).toContain(`href="/experience"`);
    expect(english).toContain(EXPECTED.en.homeLink);

    expect(spanish).toContain('<html lang="es">');
    expect(spanish).toContain(`href="/es/experience"`);
    expect(spanish).toContain(EXPECTED.es.homeLink);
  });

  it('prerenders the Home value proposition and CTAs in both languages', () => {
    const english = readArtifact('home-en.html');
    const spanish = readArtifact('home-es.html');

    for (const [html, expected] of [
      [english, EXPECTED.en],
      [spanish, EXPECTED.es],
    ] as const) {
      expect(html).toContain(expected.headline);
      expect(html).toContain(expected.summary);
      expect(html).toContain(
        `class="link" href="${expected.contactHref}"`,
      );
      expect(html).toContain(`>${expected.contact}</a>`);
      expect(html).toContain(`href="mailto:hola@alipadron.dev"`);
      expect(html).not.toContain('app-portrait');
      expect(html).not.toContain('portrait-frame');
    }

    expect(english).toContain('href="/cv/cv-en-fullstack-ai.pdf"');
    expect(spanish).toContain('href="/cv/cv-es-fullstack-ai.pdf"');
  });

  it('prerenders Contact in both languages with only the three channels', () => {
    for (const [language, artifact] of [
      ['en', 'contact-en.html'],
      ['es', 'contact-es.html'],
    ] as const) {
      const html = readArtifact(artifact);
      const expected = DOCUMENT_PAGES[language].contact;

      expect(html).toContain(`<html lang="${language}">`);
      expect(html).toContain(expected.kicker);
      expect(html).toContain(expected.title);
      expect(html).toContain(expected.intro);

      for (const section of expected.sections) {
        expect(html, section).toContain(section);
      }

      expect(html).toContain('mailto:hola@alipadron.dev');
      expect(html).toContain('linkedin.com/in/alipadron');
      expect(html).toContain('github.com/alipadron');
      expect(html).not.toMatch(/<form/i);
      expect(html).not.toMatch(/href="tel:/);
    }
  });

  it('links every page from the primary navigation in both languages', () => {
    for (const [artifact, expected] of [
      ['home-en.html', ['/', '/experience', '/contact']],
      ['home-es.html', ['/es', '/es/experience', '/es/contact']],
    ] as const) {
      expect(primaryNavHrefs(readArtifact(artifact))).toEqual(expected);
    }
  });

  it.each([
    { page: 'experience-en.html', expectedHref: '/experience' },
    { page: 'experience-es.html', expectedHref: '/es/experience' },
    { page: 'contact-en.html', expectedHref: '/contact' },
    { page: 'contact-es.html', expectedHref: '/es/contact' },
  ])(
    'marks $expectedHref as the current page in the primary navigation on $page',
    ({ page, expectedHref }) => {
      const current = readArtifact(page).match(
        /<a[^>]*aria-current="page"[^>]*href="([^"]+)"/,
      );

      expect(current?.[1]).toBe(expectedHref);
    },
  );

  it('every primary navigation link resolves to a prerendered page', () => {
    for (const { artifact } of PAGES) {
      for (const href of primaryNavHrefs(readArtifact(artifact))) {
        expect(existsSync(prerenderedFile(href)), `${artifact} -> ${href}`).toBe(
          true,
        );
      }
    }
  });

  it.each([
    { page: 'home-en.html', expectedHref: '/es' },
    { page: 'home-es.html', expectedHref: '/' },
    { page: 'experience-en.html', expectedHref: '/es/experience' },
    { page: 'experience-es.html', expectedHref: '/experience' },
    { page: 'contact-en.html', expectedHref: '/es/contact' },
    { page: 'contact-es.html', expectedHref: '/contact' },
  ])(
    'the language switcher on $page links to the equivalent page ($expectedHref)',
    ({ page, expectedHref }) => {
      expect(switcherHref(readArtifact(page))).toBe(expectedHref);
    },
  );

  it('every language switcher link resolves to a prerendered page', () => {
    for (const { artifact } of PAGES) {
      const href = switcherHref(readArtifact(artifact));

      expect(existsSync(prerenderedFile(href)), `${artifact} -> ${href}`).toBe(
        true,
      );
    }
  });

  it('gives every prerendered page its own title, description and canonical URL', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const page of PAGES) {
      const html = readArtifact(page.artifact);
      const seo = PAGE_SEO[page.artifact];

      expect(seo, page.artifact).toBeDefined();
      expect(pageTitle(html), page.artifact).toBe(seo.title);
      expect(
        metaContent(html, 'name', 'description'),
        page.artifact,
      ).toBe(seo.description);
      expect(linkHref(html, { rel: 'canonical' }), page.artifact).toBe(
        localizedUrl(page.path, page.language),
      );

      titles.add(seo.title);
      descriptions.add(seo.description);
    }

    // A shared title or description would mean a copy-paste page, not a page.
    expect(titles.size).toBe(PAGES.length);
    expect(descriptions.size).toBe(PAGES.length);
  });

  it('declares each page as the English and Spanish pair, with x-default on English', () => {
    for (const page of PAGES) {
      const html = readArtifact(page.artifact);
      const english = localizedUrl(page.path, 'en');
      const spanish = localizedUrl(page.path, 'es');

      expect(
        linkHref(html, { rel: 'alternate', hreflang: 'en' }),
        page.artifact,
      ).toBe(english);
      expect(
        linkHref(html, { rel: 'alternate', hreflang: 'es' }),
        page.artifact,
      ).toBe(spanish);

      if (page.language === 'en') {
        expect(
          linkHref(html, { rel: 'alternate', hreflang: 'x-default' }),
          page.artifact,
        ).toBe(english);
      } else {
        expect(
          linkHref(html, { rel: 'alternate', hreflang: 'x-default' }),
          page.artifact,
        ).toBeUndefined();
      }
    }
  });

  it('shares every page with Open Graph and Twitter card metadata', () => {
    for (const page of PAGES) {
      const html = readArtifact(page.artifact);
      const seo = PAGE_SEO[page.artifact];
      const imageAlt =
        page.language === 'en'
          ? 'Alí Padrón, Senior Full-Stack Engineer'
          : 'Alí Padrón, Ingeniero Full-Stack Senior';
      const [locale, alternateLocale] =
        page.language === 'en' ? ['en_US', 'es_ES'] : ['es_ES', 'en_US'];

      const expectedMeta: [string, 'name' | 'property', string][] = [
        ['og:type', 'property', 'website'],
        ['og:site_name', 'property', 'Alí Padrón'],
        ['og:title', 'property', seo.title],
        ['og:description', 'property', seo.description],
        ['og:url', 'property', localizedUrl(page.path, page.language)],
        ['og:image', 'property', OG_IMAGE_URL],
        ['og:image:width', 'property', '1200'],
        ['og:image:height', 'property', '630'],
        ['og:image:alt', 'property', imageAlt],
        ['og:locale', 'property', locale],
        ['og:locale:alternate', 'property', alternateLocale],
        ['twitter:card', 'name', 'summary_large_image'],
        ['twitter:title', 'name', seo.title],
        ['twitter:description', 'name', seo.description],
        ['twitter:image', 'name', OG_IMAGE_URL],
        ['twitter:image:alt', 'name', imageAlt],
      ];

      for (const [key, attribute, value] of expectedMeta) {
        expect(metaContent(html, attribute, key), `${page.artifact}: ${key}`).toBe(
          value,
        );
      }
    }
  });

  it('ships a 1200×630 Open Graph image that every page points at', () => {
    const file = path.join(PRERENDER_DIR, 'og-image.png');
    const png = readFileSync(file);

    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });

  it('publishes a sitemap with every route in both languages and its alternates', () => {
    const xml = readArtifact('sitemap.xml');
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    const expected = PAGES.map((page) =>
      localizedUrl(page.path, page.language),
    );

    expect(urls).toHaveLength(PAGES.length);
    expect(new Set(urls)).toEqual(new Set(expected));

    for (const page of PAGES) {
      const url = localizedUrl(page.path, page.language);
      const block = sitemapBlock(xml, url);

      expect(block, url).not.toBe('');
      expect(block, url).toContain(
        `hreflang="en" href="${localizedUrl(page.path, 'en')}"`,
      );
      expect(block, url).toContain(
        `hreflang="es" href="${localizedUrl(page.path, 'es')}"`,
      );
      expect(block, url).toContain(
        `hreflang="x-default" href="${localizedUrl(page.path, 'en')}"`,
      );
    }
  });

  it('points crawlers at the sitemap', () => {
    expect(readArtifact('robots.txt')).toContain(
      `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    );
  });

  it('produces the three English CVs from the same content', async () => {
    for (const variant of CV_VARIANTS) {
      const text = await artifactPdfText(`cv-en-${variant}.pdf`);

      expect(text, variant).toContain(EXPECTED.company);
      expect(text, variant).toContain(CV_TITLES.en[variant]);
      expect(text, variant).toContain(CV_SUMMARIES.en[variant]);
      expect(text, variant).toContain(EXPECTED.en.bullet);
      expect(text, variant).toContain(EXPECTED.en.releaseBullet);
    }
  });

  it('gives each English CV its own summary and only Tech Lead its own title', async () => {
    const documents = Object.fromEntries(
      await Promise.all(
        CV_VARIANTS.map(async (variant) => [
          variant,
          await artifactPdfText(`cv-en-${variant}.pdf`),
        ]),
      ),
    );

    for (const variant of CV_VARIANTS) {
      for (const other of CV_VARIANTS) {
        if (other === variant) {
          continue;
        }

        expect(documents[variant], `${variant} vs ${other}`).not.toContain(
          CV_SUMMARIES.en[other],
        );
      }
    }

    for (const variant of ['fullstack-ai', 'freelance'] as const) {
      expect(documents[variant], variant).not.toContain(
        CV_TITLES.en['tech-lead'],
      );
    }
  });

  it('produces the English Full-Stack + AI PDF with the role text', async () => {
    const text = await artifactPdfText('cv-en-fullstack-ai.pdf');

    expect(text).toContain(EXPECTED.company);
    expect(text).toContain(CV_TITLES.en['fullstack-ai']);
    expect(text).toContain(CV_SUMMARIES.en['fullstack-ai']);
    expect(text).toContain(EXPECTED.en.bullet);
    expect(text).toContain(EXPECTED.en.growthBullet);
    expect(text).toContain(EXPECTED.en.experienceHeading);
    expect(text).toContain(EXPECTED.en.present);
    expect(text).toContain(EXPECTED.en.location);
  });

  it('produces the Spanish Full-Stack + AI PDF with the role text', async () => {
    const text = await artifactPdfText('cv-es-fullstack-ai.pdf');

    expect(text).toContain(EXPECTED.company);
    expect(text).toContain(CV_TITLES.es['fullstack-ai']);
    expect(text).toContain(CV_SUMMARIES.es['fullstack-ai']);
    expect(text).toContain(EXPECTED.es.bullet);
    expect(text).toContain(EXPECTED.es.growthBullet);
    expect(text).toContain(EXPECTED.es.releaseBullet);
    expect(text).toContain(EXPECTED.es.experienceHeading);
    expect(text).toContain(EXPECTED.es.present);
    expect(text).toContain(EXPECTED.es.location);
  });

  it('keeps the warehouse bullet in Freelance only, while the site shows it', async () => {
    expect(readArtifact('experience-en.html')).toContain(
      EXPECTED.en.warehouseBullet,
    );
    expect(await artifactPdfText('cv-en-freelance.pdf')).toContain(
      EXPECTED.en.warehouseBullet,
    );
    expect(await artifactPdfText('cv-en-fullstack-ai.pdf')).not.toContain(
      EXPECTED.en.warehouseBullet,
    );
    expect(await artifactPdfText('cv-en-tech-lead.pdf')).not.toContain(
      EXPECTED.en.warehouseBullet,
    );
  });

  it('puts leadership, payments and releases first in Tech Lead and leadership and releases first in Freelance', async () => {
    const techLead = await artifactPdfText('cv-en-tech-lead.pdf');

    for (const bullet of [
      EXPECTED.en.techLeadBullet,
      EXPECTED.en.paymentsBullet,
      EXPECTED.en.releaseBullet,
    ]) {
      expect(techLead.indexOf(bullet), bullet).toBeLessThan(
        techLead.indexOf(EXPECTED.en.bullet),
      );
    }

    const freelance = await artifactPdfText('cv-en-freelance.pdf');

    for (const bullet of [
      EXPECTED.en.techLeadBullet,
      EXPECTED.en.releaseBullet,
    ]) {
      expect(freelance.indexOf(bullet), bullet).toBeLessThan(
        freelance.indexOf(EXPECTED.en.bullet),
      );
    }
  });

  it('accepts mixed year and month date granularity', () => {
    const result = runNpmScript('build', {
      CONTENT_DIR: path.join(
        PROJECT_ROOT,
        'tests/fixtures/valid-mixed-dates',
      ),
    });

    expect(result.status, result.output).toBe(0);
  });

  it.each([
    {
      fixture: 'invalid-date',
      expectedFile: 'career.json',
      expectedDetails: ['startDate'],
      expectedMessage: 'must be a year (YYYY) or a month (YYYY-MM)',
    },
    {
      fixture: 'invalid-translation',
      expectedFile: 'career.json',
      expectedDetails: ['title.es'],
      expectedMessage: 'missing Spanish translation',
    },
    {
      fixture: 'invalid-ui-translation',
      expectedFile: 'ui.json',
      expectedDetails: ['home.experienceLink.es'],
      expectedMessage: 'missing Spanish translation',
    },
    {
      fixture: 'invalid-pages-translation',
      expectedFile: 'pages.json',
      expectedDetails: ['contact.intro.es'],
      expectedMessage: 'missing Spanish translation',
    },
    {
      fixture: 'invalid-seo-translation',
      expectedFile: 'ui.json',
      expectedDetails: ['seo.pages.experience.description.es'],
      expectedMessage: 'missing Spanish translation',
    },
    {
      fixture: 'unknown-variant',
      expectedFile: 'career.json',
      expectedDetails: ['entries.0.variants.0'],
      expectedMessage: 'unknown variant',
    },
    {
      fixture: 'mismatched-override',
      expectedFile: 'career.json',
      expectedDetails: ['entries.0.placementByVariant.fullstack-ai'],
      expectedMessage: 'must belong to one of the entry variants',
    },
    {
      fixture: 'invalid-education-date',
      expectedFile: 'career.json',
      expectedDetails: ['education.0.endDate'],
      expectedMessage: 'must not be earlier than startDate',
    },
    {
      // The fixture drops all three sections the schema requires, so every
      // missing section has to be named in the error.
      fixture: 'missing-sections',
      expectedFile: 'career.json',
      expectedDetails: ['skills', 'education', 'languages'],
      expectedMessage: 'expected array',
    },
  ])(
    'fails the build with a clear message for the $fixture fixture',
    ({ fixture, expectedFile, expectedDetails, expectedMessage }) => {
      const result = runNpmScript('build', {
        CONTENT_DIR: path.join(PROJECT_ROOT, 'tests/fixtures', fixture),
      });

      expect(result.status, result.output).not.toBe(0);
      expect(result.output).toContain('Invalid content in');
      expect(result.output).toContain(expectedFile);

      for (const detail of expectedDetails) {
        expect(result.output, detail).toContain(detail);
      }

      expect(result.output).toContain(expectedMessage);
    },
  );
});

describe('variant engine with fixture content', () => {
  const pdfTexts = {} as Record<CvVariant, string>;

  beforeAll(async () => {
    runNpmOrThrow('pdf', {
      CONTENT_DIR: VARIANT_FIXTURE_DIR,
      OUTPUT_DIR: VARIANT_OUTPUT_DIR,
    });

    for (const variant of CV_VARIANTS) {
      pdfTexts[variant] = await extractPdfText(
        path.join(VARIANT_OUTPUT_DIR, `cv-en-${variant}.pdf`),
      );
    }
  });

  it('includes entries and bullets without a variants field in every variant', () => {
    for (const variant of CV_VARIANTS) {
      expect(pdfTexts[variant], variant).toContain(EXPECTED.company);
      expect(pdfTexts[variant], variant).toContain(FIXTURE_TEXT.shared);
      expect(pdfTexts[variant], variant).toContain(FIXTURE_TEXT.concurrent);
    }
  });

  it('includes tagged entries only in the variants they name', () => {
    expect(pdfTexts['tech-lead']).toContain(FIXTURE_TEXT.taggedEntry);
    expect(pdfTexts['fullstack-ai']).not.toContain(FIXTURE_TEXT.taggedEntry);
    expect(pdfTexts.freelance).not.toContain(FIXTURE_TEXT.taggedEntry);
  });

  it('includes tagged bullets only in the variants they name', () => {
    expect(pdfTexts.freelance).toContain(FIXTURE_TEXT.freelanceOnly);
    expect(pdfTexts['fullstack-ai']).not.toContain(FIXTURE_TEXT.freelanceOnly);
    expect(pdfTexts['tech-lead']).not.toContain(FIXTURE_TEXT.freelanceOnly);

    expect(pdfTexts['tech-lead']).toContain(FIXTURE_TEXT.techLeadOnly);
    expect(pdfTexts['fullstack-ai']).not.toContain(FIXTURE_TEXT.techLeadOnly);
    expect(pdfTexts.freelance).not.toContain(FIXTURE_TEXT.techLeadOnly);
  });

  it('places Tuapplicaya as a project in Full-Stack + AI and an experience elsewhere', () => {
    const fullstack = pdfTexts['fullstack-ai'];
    expect(fullstack.indexOf('Projects')).toBeGreaterThanOrEqual(0);
    expect(fullstack.indexOf('Tuapplicaya')).toBeGreaterThan(
      fullstack.indexOf('Projects'),
    );

    for (const variant of ['tech-lead', 'freelance'] as const) {
      const text = pdfTexts[variant];
      expect(text, variant).not.toContain('Projects');
      expect(text.indexOf('Tuapplicaya'), variant).toBeGreaterThan(
        text.indexOf('Experience'),
      );
    }
  });

  it('applies per-variant summaries and falls back to the master summary', () => {
    expect(pdfTexts['fullstack-ai']).toContain('Fixture summary.');
    expect(pdfTexts['fullstack-ai']).not.toContain(
      'Fixture tech lead summary.',
    );
    expect(pdfTexts['fullstack-ai']).not.toContain(
      'Fixture freelance summary.',
    );

    expect(pdfTexts['tech-lead']).toContain('Fixture tech lead summary.');
    expect(pdfTexts['tech-lead']).not.toContain('Fixture freelance summary.');

    expect(pdfTexts.freelance).toContain('Fixture freelance summary.');
    expect(pdfTexts.freelance).not.toContain('Fixture tech lead summary.');
  });

  it('applies per-variant role titles', () => {
    expect(pdfTexts['tech-lead']).toContain(FIXTURE_TEXT.techLeadTitle);
    expect(pdfTexts['fullstack-ai']).not.toContain(
      FIXTURE_TEXT.techLeadTitle,
    );
    expect(pdfTexts.freelance).not.toContain(FIXTURE_TEXT.techLeadTitle);
  });

  it('renders the concurrent engagement label only in Freelance', () => {
    expect(pdfTexts.freelance).toContain(FIXTURE_TEXT.concurrentLabel);
    expect(pdfTexts['fullstack-ai']).not.toContain(
      FIXTURE_TEXT.concurrentLabel,
    );
    expect(pdfTexts['tech-lead']).not.toContain(FIXTURE_TEXT.concurrentLabel);
  });

  it('respects per-variant bullet order without duplicating text', () => {
    const fullstack = pdfTexts['fullstack-ai'];
    expect(fullstack.indexOf(FIXTURE_TEXT.shared)).toBeLessThan(
      fullstack.indexOf(FIXTURE_TEXT.reordered),
    );

    const techLead = pdfTexts['tech-lead'];
    expect(techLead.indexOf(FIXTURE_TEXT.reordered)).toBeLessThan(
      techLead.indexOf(FIXTURE_TEXT.shared),
    );

    for (const variant of CV_VARIANTS) {
      expect(
        countOccurrences(pdfTexts[variant], FIXTURE_TEXT.shared),
        variant,
      ).toBe(1);
      expect(
        countOccurrences(pdfTexts[variant], FIXTURE_TEXT.reordered),
        variant,
      ).toBe(1);
    }
  });
});
