import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { robotsTxt, sitemapXml } from '../src/app/seo';

/**
 * Writes the files that describe the site rather than live in it.
 *
 * This runs after `vite build`, not inside it: Analog prerenders during the
 * Nitro build, which rewrites the output directory, and Vite's `closeBundle`
 * hooks run in parallel rather than after it. Generating both files from the
 * same route table the prerenderer consumes keeps them from drifting.
 */
const outputDir = path.resolve(
  process.env['SITE_DIST_DIR'] ?? 'dist/analog/public',
);

mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapXml());
writeFileSync(path.join(outputDir, 'robots.txt'), robotsTxt());

console.log(`Wrote sitemap.xml and robots.txt to ${outputDir}`);
