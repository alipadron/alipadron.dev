# alipadron.dev

Personal site and CV for Alí Padrón. A single content source builds the bilingual site (EN + `/es`) and the CV variants (Full-Stack + AI, Tech Lead, Freelance) as PDF/DOCX.

## Commands

Prerequisites: Node.js >= 22.22.3 and npm. Install once with `npm install`.
PDF generation needs Chromium: `npx playwright install chromium`.

- `npm run dev` — Analog dev server (Vite) at `http://localhost:5173`.
- `npm run build` — validates the career, UI and page content and prerenders
  every route into `dist/analog/public`: Home, Experience, How I work, Work
  with me and Contact, in English at the root and in Spanish under `/es`.
  Every page exists in both languages.
- `npm run test` — build-level tests. They run the build and the document
  pipeline and assert on the generated HTML, PDF and DOCX text; invalid-content
  fixtures must fail the build.
- `npm run documents` — the one command that writes all six CV documents
  (`fullstack-ai`, `tech-lead`, `freelance` × `en`, `es`) to `output/` as PDF,
  DOCX and HTML intermediates. It then renders the two Full-Stack + AI PDFs
  again into `dist/analog/public/cv/`, which is the site output, so the
  published copies never inherit a local phone number. Run `npm run build`
  first so the site pages and their links are present.
- `npm run pdf` — the same six PDFs and their HTML intermediates, without DOCX
  and without publishing, for quick local iteration. Set
  `CONTENT_DIR`/`OUTPUT_DIR` to build fixtures into another directory, and
  `SITE_DIST_DIR` to publish into a site output other than `dist/analog/public`.
- `npm run og-image` — regenerates `public/og-image.png`, the 1200×630 Open
  Graph image, from the site's own design tokens. Needs Chromium. The PNG is
  committed, so the site build never depends on a browser.
- `npm run typecheck` — TypeScript checks for the app, scripts and tests.
- `npm run build && npm run documents && npx wrangler@4.160.0 pages deploy
  dist/analog/public --project-name=alipadron-dev --branch=main` — deploys
  manually to the Cloudflare Pages project `alipadron-dev`
  (`https://alipadron-dev.pages.dev`). Needs `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID` in the environment.

CI (`.github/workflows/ci.yml`) runs typecheck, build and tests on every push
and pull request.

`Deploy` (`.github/workflows/deploy.yml`) publishes every push to `main` to the
Cloudflare Pages project `alipadron-dev`, whose production branch is `main`. It
is a direct-upload project: the build commands (`npm run build`, then
`npm run documents`) and output directory (`dist/analog/public`) live in that
workflow, not in the Cloudflare dashboard. It authenticates with the repository
secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. DNS and custom
domains are out of its scope.

## Documents and publication

The six CV documents are `(variant, language)` pairs: `fullstack-ai`,
`tech-lead` and `freelance`, each in English and Spanish. Every document is
built from the same content module (`src/content/documents.ts`) and rendered
once into a format-neutral model, so the PDF and the DOCX carry the same text in
the same reading order. The PDF layout is single-column and ATS-friendly.

Only the Full-Stack + AI PDFs (`cv-en-fullstack-ai`, `cv-es-fullstack-ai`) are
public. `npm run documents` renders exactly those two into
`dist/analog/public/cv/` and the site links each language's home page to its own
copy. Tech Lead and Freelance exist only in `output/`. The published copies are
always rendered as published output, so a phone number from `CV_PHONE` can never
reach the site. A DOCX is editable and may be forwarded, so it never carries the
build-time phone at all; only local PDFs do.

## Content

Everything the site and the CVs render lives under `content/`: `career.json`
for structured career data, `ui.json` for site labels, and `pages.json` for the
long-form pages (How I work, Work with me, Contact). All three are bilingual
`{ en, es }` and validated at build time, so a missing translation fails the
build naming the entry (for example `home.experienceLink.es` or
`work-with-me.intro.es`).

The long-form pages are typed data, not markup: each page is a title, an intro
and a list of sections whose blocks are a closed vocabulary (paragraph, list,
terms, steps, contact channels, page link, email action). The schema is in
`src/content/schema.ts` and the one renderer is `src/app/views/long-form-view.ts`,
so both languages come from the same structure and no page can ship with only
one translation.

## SEO and sharing

Every prerendered page carries its own `<title>`, meta description, canonical
URL, an `hreflang` pair pointing at the same page in the other language, and
`x-default` on the English page. Open Graph and Twitter card tags share the same
copy and point at `public/og-image.png`.

The search and sharing copy is part of the content module: `content/ui.json`
holds one title and description per page under `seo.pages`, and case study pages
use the study's own title and summary. A missing translation fails the build
like any other content. `src/app/seo.ts` resolves the copy and builds every URL
from `SITE_PAGES`; `src/app/head.ts` writes the tags, and `PageLayout` applies
them, so the prerendered head and a client-side navigation agree.

`npm run build` also writes `sitemap.xml` and `robots.txt` into
`dist/analog/public` after the prerender, through `scripts/build-site-files.ts`.
Both come from the same `SITE_PAGES` route table as the prerender list, so they
cannot list a page that is not built. `tests/build.spec.ts` asserts the head of
every page, the sharing tags, the image and the sitemap.

## Contact policy and privacy

Public output — the site HTML and any published PDF — carries exactly three
contact channels from `content/career.json`: `hola@alipadron.dev`, LinkedIn and
GitHub. The site build never reads the variables below, so a phone number cannot
reach the site.

A phone number is injected only at PDF build time, and only from the
environment. It is never part of the tracked content: the strict content schema
rejects a `phone` field. The only tracked phone-looking value is the reserved
fictional number in the rejection fixture under
`tests/fixtures/content-with-phone/`.

- `CV_PHONE` — the phone number to print in a local PDF. Unset means no phone
  anywhere. DOCX documents never show it.
- `CV_PUBLISHED` — the seam between local and published output. Unset (the
  default) means local. Any other value except `0`, `false`, `no` or `off`
  marks the build as published, so a typo fails closed; a published PDF drops
  `CV_PHONE` even when it is set.

```sh
# Local copy you send yourself, with the phone number
CV_PHONE="+1 555 0100" npm run pdf

# PDF for public download, never with the phone number
CV_PUBLISHED=true CV_PHONE="+1 555 0100" npm run pdf
```

`tests/contact-privacy.spec.ts` exercises both sides of the seam and asserts the
phone never reaches site HTML or a published PDF.

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
