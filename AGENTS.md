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
- `npm run pdf` — writes `output/cv-en-fullstack-ai.pdf` and
  `output/cv-es-fullstack-ai.pdf`, plus their HTML intermediates.
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

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
