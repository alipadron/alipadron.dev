import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    // Build-level suites run the real build/PDF commands and share dist/ and
    // output/, so test files must not run concurrently.
    fileParallelism: false,
    hookTimeout: 300_000,
    testTimeout: 300_000,
  },
});
