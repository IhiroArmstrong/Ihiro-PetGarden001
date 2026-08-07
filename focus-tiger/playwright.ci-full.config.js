// @ts-check
/**
 * CI-only config for focus-tiger-e2e-full.yml (sharded nightly / dispatch).
 * Extends playwright.config.js — do not use for local `npm run test:e2e`
 * or PR smoke (those keep the default config).
 *
 * Goals vs default CI reporters:
 * - JUnit file per shard (workflow uploads with if: always())
 * - No HTML report (flaky storms previously produced multi-GB artifacts)
 * - Traces only on final failure (not every first-retry flaky)
 */
import base from './playwright.config.js';
import { defineConfig } from '@playwright/test';

const shard = process.env.FT_SHARD || '1';

export default defineConfig({
  ...base,
  // Workflow passes --workers=1; keep 1 here so accidental bare runs stay safe.
  workers: 1,
  reporter: [
    ['list'],
    ['github'],
    ['junit', { outputFile: `test-results/junit-shard-${shard}.xml` }]
  ],
  use: {
    ...base.use,
    // Keep CI artifacts small (Plan A #15 traces were multi-GB). Screenshots
    // on failure are enough for triage; JUnit carries the red/green list.
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure'
  }
});
