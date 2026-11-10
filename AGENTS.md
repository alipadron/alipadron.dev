# alipadron.dev

Personal site and CV for Alí Padrón. A single content source builds the bilingual site (EN + `/es`) and the CV variants (Full-Stack + AI, Tech Lead, Freelance) as PDF/DOCX.

## Commands

Prerequisites: Node.js >= 22.22.3 and npm. Install once with `npm install`.
PDF generation needs Chromium: `npx playwright install chromium`.

- `npm run dev` — Analog dev server (Vite) at `http://localhost:5173`.
- `npm run build` — validates the career content and prerenders `/` and
  `/experience` into `dist/analog/public`.
- `npm run test` — build-level tests. They run the build and the PDF command
  and assert on the generated HTML/PDF text; invalid-content fixtures must fail
  the build.
- `npm run pdf` — writes `output/cv-en-fullstack-ai.pdf` and its HTML
  intermediate `output/cv-en-fullstack-ai.html`.
- `npm run typecheck` — TypeScript checks for the app, scripts and tests.

CI (`.github/workflows/ci.yml`) runs typecheck, build and tests on every push
and pull request.

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
