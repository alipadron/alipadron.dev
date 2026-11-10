import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    hookTimeout: 300_000,
    testTimeout: 300_000,
  },
});
