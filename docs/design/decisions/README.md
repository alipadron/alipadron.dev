# Design decisions

## T14 — Editorial design system and Home

The site implements direction **A — Editorial** from issue #13: serif display,
sans body, warm paper, one vermillion accent, hairlines and 2px radii. The
tokens live in `src/styles.css`; light and dark are a `prefers-color-scheme`
swap. No webfonts, shadows, gradients or blur.

| Home, English | Light | Dark |
| --- | --- | --- |
| 1280px | ![Home light at 1280px](home-en-light-1280.png) | ![Home dark at 1280px](home-en-dark-1280.png) |
| 390px | ![Home light at 390px](home-en-light-390.png) | ![Home dark at 390px](home-en-dark-390.png) |

Screenshots are of the prerendered build, captured with Playwright. At 390px
the document width stays at 390px (no horizontal scroll), and the first
keyboard stop shows a 2px accent focus outline.

### Photo placeholder

`HomeView.photoSrc` is `null`, which renders the reserved 3:2 phone / 4:5
desktop frame from `src/app/components/portrait.ts`. Set it to a public image
path to swap in the real portrait without changing the layout.
