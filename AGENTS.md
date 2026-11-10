# alipadron.dev

Personal site and CV for Alí Padrón. A single content source builds the bilingual site (EN + `/es`) and the CV variants (Full-Stack + AI, Tech Lead, Freelance) as PDF/DOCX.

## Commands

Prerequisites: Node.js >= 22.22.3 and npm. Install once with `npm install`.
PDF generation needs Chromium: `npx playwright install chromium`.

- `npm run dev` — Analog dev server (Vite) at `http://localhost:5173`.
- `npm run build` — validates the career and UI content and prerenders `/`,
  `/es`, `/experience` and `/es/experience` into `dist/analog/public`. Every
  page exists in English at the root and in Spanish under `/es`.
- `npm run test` — build-level tests. They run the build and the PDF command
  and assert on the generated HTML/PDF text; invalid-content fixtures must fail
  the build.
- `npm run pdf` — writes the three English CVs (`cv-en-fullstack-ai`,
  `cv-en-tech-lead`, `cv-en-freelance`) and the Spanish Full-Stack + AI CV
  (`cv-es-fullstack-ai`), plus their HTML intermediates, to `output/`. Set
  `CONTENT_DIR`/`OUTPUT_DIR` to build fixtures into another directory.
- `npm run typecheck` — TypeScript checks for the app, scripts and tests.
- `npm run build && npx wrangler@4.160.0 pages deploy dist/analog/public
  --project-name=alipadron-dev --branch=main` — deploys manually to the
  Cloudflare Pages project `alipadron-dev` (`https://alipadron-dev.pages.dev`).
  Needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the environment.

CI (`.github/workflows/ci.yml`) runs typecheck, build and tests on every push
and pull request.

`Deploy` (`.github/workflows/deploy.yml`) publishes every push to `main` to the
Cloudflare Pages project `alipadron-dev`, whose production branch is `main`. It
is a direct-upload project: the build command (`npm run build`) and output
directory (`dist/analog/public`) live in that workflow, not in the Cloudflare
dashboard. It authenticates with the repository secrets `CLOUDFLARE_API_TOKEN`
and `CLOUDFLARE_ACCOUNT_ID`. DNS and custom domains are out of its scope.

## Content

Everything the site and the CVs render lives under `content/`: `career.json`
for structured career data and `ui.json` for site labels. Both are bilingual
`{ en, es }` and validated at build time, so a missing translation fails the
build naming the entry (for example `home.experienceLink.es`).

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
  anywhere.
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
