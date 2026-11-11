# Visual prototypes (issue #13)

Three throwaway directions for `alipadron.dev`, built from the real English
content in `content/career.json`. They are evidence for the choice in issue
#13, not the site: nothing here is imported by the app, and the whole folder is
deleted once #14 has implemented the chosen direction.

- [Gallery](index.html) — all three side by side
- `editorial/` — Prototype A, typographic minimal
- `terminal/` — Prototype B, terminal-flavoured
- `dossier/` — Prototype C, index-first

Each prototype is two static pages, `index.html` (Home) and
`experience.html` (Experience), plus one hand-written `style.css`. Light and
dark themes come from `prefers-color-scheme`; there is no JavaScript. Pages are
English only, which is what this ticket needed.

## Rebuild and re-shoot

```sh
node docs/design/prototypes/build.mjs        # content → the six HTML pages
npx playwright install chromium              # once, if it is not installed
node docs/design/prototypes/screenshots.mjs  # 24 PNGs → screenshots/
```

`build.mjs` reads `content/career.json` directly, so the mocks cannot drift
from the site content while the design is being picked. The Experience
screenshots are clipped to the first screen and first role; the full pages are
the committed HTML.

## What is not real

- The nav entries after Experience (Case studies, How I work, Work with me,
  Contact) are pages from the spec that do not exist yet. They render as
  non-links with a dotted underline.
- The CV link points at the production path the site will use,
  `/cv/cv-en-fullstack-ai.pdf`, which does not resolve from this folder.
- Some UI copy is prototype-only: "Remote · GMT-4", "Work with me", the
  closing lines and the metric labels. Every career sentence, date, stack and
  number is read from the content module unchanged.

## Recommendation

**Prototype A, Editorial.**

The site's job is to make dense, factual achievements (40+ bullets, many with
numbers) readable in one pass by two audiences that do not read the same way: a
recruiter skimming for five seconds, and a hiring manager or client who reads
the Experience page end to end. Editorial is the direction that spends its
design budget on reading rather than on a costume. Serif display gives the page
an authorial, human voice; the sans body keeps long paragraphs and bullets
comfortable; one vermillion accent is enough to mark links, sections and the
few moments that need pointing at; hairlines and zero-to-2px radii mean there
is nothing to keep consistent as the site grows to case studies and How I work.

Why not the others:

- **Terminal** is memorable and says "engineer" immediately, which is real
  value for an AI-native positioning. But it pays for that in reading speed:
  monospace body text at ~70 characters per line is measurably slower, and on
  a phone each bullet becomes five or six lines. It also narrows the audience:
  a non-technical recruiter or a founder looking for a rescue sees a theme
  before they see the work. It is the direction most likely to date.
- **Dossier** is the most conventional and the easiest to scan: a sticky index,
  cards, chips, one blue accent. That is also its problem. Cards and a blue
  primary button read as a SaaS landing page, the personal voice disappears,
  and the card chrome competes with the content on a page that is mostly text.
  It would be the right answer if the site were primarily a product or a docs
  portal; this site is a person making an argument about his work.
- **Editorial's known risk** is looking like a writer's site rather than an
  engineer's. The mitigation is already in the prototype: the "By the numbers"
  strip and the per-role stack chips keep hard evidence above the fold, and the
  Experience page leads with dates, location model and stack.

One deliberate simplification: theme is `prefers-color-scheme` only, with no
toggle. #14 can add a persisted toggle without changing any token below.

## Tokens for #14

These are Prototype A's tokens as shipped. Every text/background pair was
checked for WCAG AA (4.5:1 for body text, 3:1 for large text and UI edges).

### Palette

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#fbf8f3` | `#141210` | Page background (warm paper / warm charcoal) |
| `--surface` | `#ffffff` | `#1c1917` | Photo placeholder, empty states |
| `--ink` | `#1a1714` | `#f2ede8` | Headings, wordmark, emphasis — 16.9:1 / 16.1:1 |
| `--text` | `#332c27` | `#d6cdc5` | Body copy — 13.0:1 / 11.9:1 |
| `--muted` | `#6a6058` | `#a79e96` | Dates, labels, captions — 5.8:1 / 7.1:1 |
| `--rule` | `#e4dcd2` | `#2e2925` | 1px hairlines, chip borders (non-text) |
| `--accent` | `#a63b1b` | `#ff8a65` | Links, current nav, list markers, kicker rule — 6.1:1 / 8.1:1 |
| `--accent-ink` | `#fbf8f3` | `#141210` | Text on `--accent` and on the inverted button |

Only one hue is used as an accent. It marks links, the active nav item, the
kicker rule and list markers; nothing else.

### Type

| Role | Family | Size | Line height | Weight | Tracking |
| --- | --- | --- | --- | --- | --- |
| Display (Home h1) | serif | `clamp(3rem, 8vw, 5.5rem)` | 0.95 | 400 | -0.025em |
| Page h1 (Experience) | serif | `clamp(2.5rem, 6vw, 4rem)` | 0.95 | 400 | -0.025em |
| Headline (italic) | serif | `clamp(1.25rem, 2.4vw, 1.625rem)` | 1.35 | 400 italic | — |
| Entry title | serif | 1.5rem | 1.2 | 400 | -0.01em |
| Section label | sans | 0.6875rem | 1.4 | 400 | 0.16em, uppercase |
| Body | sans | 1.0625rem | 1.65 | 400 | — |
| Meta / footer | sans | 0.8125rem | 1.5 | 400 | 0.04em |
| Stack chip | sans | 0.75rem | 1.5 | 400 | 0.02em |

Families are system stacks, no webfont, no network request:

```css
--serif: ui-serif, Georgia, 'Iowan Old Style', 'Times New Roman', serif;
--sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
```

Measure: 62–64ch for bullets and summary, 46rem for the Experience page head,
32ch for the italic headline. Numerical values use `font-variant-numeric:
tabular-nums`.

### Spacing and layout

- Base unit 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px.
- Content width `72rem` (1152px), gutters `1.5rem` (`1.25rem` under 480px).
- Section rhythm: 96px above a new section on desktop, 48–64px on a phone.
- Role entry: two columns at ≥780px, `11rem` meta + `1fr` body, `2rem` gap;
  one column below that, with dates and location on one wrapped line.
- Home hero: one column until 900px, then `1fr 17rem` for the photo
  placeholder.
- Nav: baseline row with the wordmark, wrapping to two lines at phone width.

### Radii, borders, elevation

- Radius `2px` on buttons and stack chips; `0` everywhere else.
- Borders are always `1px solid var(--rule)`; the only exceptions are the
  accent kicker rule (2px) and the accent underline on the current nav link.
- No shadows, no gradients, no blur. Hover and focus are the only states that
  introduce motion, and focus is a 2px accent outline with 3px offset.

### Notes for implementation

- Bullets are the content, not decoration: keep them at 1.0625rem/1.65 and let
  the page be long.
- The metric strip is Home's above-the-fold evidence. It reads from figures
  already present in the content module; it must not become a second copy of
  the career numbers in `ui.json` unless the content model grows a field for it.
- The photo placeholder is reserved space, not a decorative frame: keep the
  `4:5` desktop / `3:2` phone ratio so the layout does not jump when the photo
  arrives.
- Dark mode is a token swap only; no component changes.
