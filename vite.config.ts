import analog from '@analogjs/platform';
import { defineConfig, type Plugin } from 'vite';

import { loadCareer, resolveContentFile } from './src/content/load.ts';

const VIRTUAL_CAREER_ID = 'virtual:career';
const RESOLVED_VIRTUAL_CAREER_ID = '\0' + VIRTUAL_CAREER_ID;

/**
 * Loads, validates and inlines the career data at build time. The page imports
 * `virtual:career` through `src/content/index.ts`, so the browser bundle never
 * needs filesystem access and invalid content fails the build.
 */
function careerContentPlugin(): Plugin {
  return {
    name: 'career-content',
    resolveId(id) {
      if (id === VIRTUAL_CAREER_ID) {
        return RESOLVED_VIRTUAL_CAREER_ID;
      }

      return undefined;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_CAREER_ID) {
        return undefined;
      }

      const contentFile = resolveContentFile();
      this.addWatchFile(contentFile);

      const career = loadCareer(contentFile);
      return `export const career = ${JSON.stringify(career)};`;
    },
  };
}

export default defineConfig({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    careerContentPlugin(),
    analog({
      prerender: {
        routes: ['/', '/experience'],
      },
    }),
  ],
});
