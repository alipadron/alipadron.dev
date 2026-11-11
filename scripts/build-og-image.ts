import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { chromium } from 'playwright';

/**
 * Renders the Open Graph image from the site's own design tokens. The result is
 * committed to `public/` because the site build must not depend on Chromium;
 * re-run `npm run og-image` whenever the tokens or the headline change.
 *
 * The values below mirror `src/styles.css` (warm paper, ink, one vermillion
 * accent, serif display over sans body), not a separate visual language.
 */
const OUTPUT = path.resolve('public/og-image.png');
const WIDTH = 1200;
const HEIGHT = 630;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      @page { margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; }
      body {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 76px 84px 64px;
        background: #fbf8f3;
        color: #332c27;
        font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .kicker {
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 0;
        color: #6a6058;
        font-size: 17px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }
      .kicker::before {
        content: '';
        width: 26px;
        height: 2px;
        background: #a63b1b;
      }
      .name {
        margin: 40px 0 0;
        color: #1a1714;
        font-family: ui-serif, Georgia, 'Iowan Old Style', 'Times New Roman', serif;
        font-size: 116px;
        font-weight: 400;
        letter-spacing: -0.025em;
        line-height: 0.95;
      }
      .role {
        margin: 22px 0 0;
        color: #1a1714;
        font-family: ui-serif, Georgia, 'Iowan Old Style', 'Times New Roman', serif;
        font-size: 42px;
        font-weight: 400;
        line-height: 1.15;
      }
      .note {
        margin: 14px 0 0;
        color: #6a6058;
        font-size: 24px;
        letter-spacing: 0.01em;
      }
      .foot {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        border-top: 1px solid #e4dcd2;
        padding-top: 22px;
        font-size: 22px;
      }
      .domain { color: #a63b1b; }
      .where { color: #6a6058; }
    </style>
  </head>
  <body>
    <p class="kicker">Full-Stack + AI</p>
    <div>
      <h1 class="name">Alí Padrón</h1>
      <p class="role">Senior Full-Stack Engineer</p>
      <p class="note">Angular &amp; Laravel · AI-native delivery</p>
    </div>
    <div class="foot">
      <span class="domain">alipadron.dev</span>
      <span class="where">Remote · GMT-4</span>
    </div>
  </body>
</html>`;

const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  await page.setContent(html, { waitUntil: 'load' });

  mkdirSync(path.dirname(OUTPUT), { recursive: true });
  await page.screenshot({ path: OUTPUT, type: 'png' });

  console.log(`Wrote ${OUTPUT} (${WIDTH}×${HEIGHT})`);
} finally {
  await browser.close();
}
