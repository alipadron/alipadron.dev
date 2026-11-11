#!/usr/bin/env node
// Screenshots every prototype page in both themes and both widths.
//
//   node docs/design/prototypes/screenshots.mjs
//
// Writes PNGs to docs/design/prototypes/screenshots/.
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'screenshots');

const prototypes = ['editorial', 'terminal', 'dossier'];
const pages = [
  { file: 'index.html', name: 'home' },
  { file: 'experience.html', name: 'experience' },
];
const themes = ['light', 'dark'];
const widths = [
  { name: '390', width: 390, scale: 2 },
  { name: '1280', width: 1280, scale: 1 },
];

mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

for (const prototype of prototypes) {
  for (const theme of themes) {
    for (const width of widths) {
      const page = await browser.newPage({
        viewport: { width: width.width, height: 900 },
        deviceScaleFactor: width.scale,
      });
      await page.emulateMedia({ colorScheme: theme });

      for (const target of pages) {
        const url = pathToFileURL(join(here, prototype, target.file)).href;
        await page.goto(url, { waitUntil: 'load' });
        const file = `${prototype}-${target.name}-${theme}-${width.name}.png`;

        if (target.name === 'experience') {
          // The experience page is ~7,000px tall with every bullet. The first
          // screen and first role are what the direction has to answer for.
          const height = await page.evaluate(
            () => document.documentElement.scrollHeight,
          );
          await page.screenshot({
            path: join(out, file),
            clip: {
              x: 0,
              y: 0,
              width: width.width,
              height: Math.min(height, width.width < 500 ? 1600 : 2100),
            },
          });
        } else {
          await page.screenshot({ path: join(out, file), fullPage: true });
        }

        console.log(file);
      }

      await page.close();
    }
  }
}

await browser.close();
