import analog from '@analogjs/platform';
import { defineConfig, type Plugin } from 'vite';

import {
  loadCareer,
  loadUi,
  resolveContentFile,
  resolveUiFile,
} from './src/content/load.ts';
import { siteRoutes } from './src/app/routes.ts';

const VIRTUAL_CAREER_ID = 'virtual:career';
const RESOLVED_VIRTUAL_CAREER_ID = '\0' + VIRTUAL_CAREER_ID;
const VIRTUAL_UI_ID = 'virtual:ui';
const RESOLVED_VIRTUAL_UI_ID = '\0' + VIRTUAL_UI_ID;

/**
 * Loads, validates and inlines the career and UI content at build time. The
 * pages import the virtual modules through `src/content/index.ts`, so the
 * browser bundle never needs filesystem access and invalid content fails the
 * build.
 */
function contentPlugin(): Plugin {
  return {
    name: 'content',
    resolveId(id) {
      if (id === VIRTUAL_CAREER_ID) {
        return RESOLVED_VIRTUAL_CAREER_ID;
      }

      if (id === VIRTUAL_UI_ID) {
        return RESOLVED_VIRTUAL_UI_ID;
      }

      return undefined;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_CAREER_ID) {
        const contentFile = resolveContentFile();
        this.addWatchFile(contentFile);

        const career = loadCareer(contentFile);
        return `export const career = ${JSON.stringify(career)};`;
      }

      if (id === RESOLVED_VIRTUAL_UI_ID) {
        const uiFile = resolveUiFile();
        this.addWatchFile(uiFile);

        const ui = loadUi(uiFile);
        return `export const ui = ${JSON.stringify(ui)};`;
      }

      return undefined;
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
    contentPlugin(),
    analog({
      prerender: {
        routes: siteRoutes(),
      },
    }),
  ],
});
