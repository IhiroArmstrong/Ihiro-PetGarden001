/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// @ts-check
/**
 * CI-only config for focus-tiger-visibility-contract.yml (Plan A shards).
 * Extends playwright.config.js — do not use for local runs.
 *
 * Goals vs default CI reporters:
 * - JUnit file per spec shard (workflow uploads with if: always())
 * - No HTML report (flaky storms previously produced multi-GB artifacts)
 * - workers:1 — avoid dual Chromium goto storms on :5199 static preview
 */
import base from './playwright.config.js';
import { defineConfig } from '@playwright/test';

const specSlug = process.env.FT_VISIBILITY_SPEC || 'all';

export default defineConfig({
  ...base,
  workers: 1,
  reporter: [
    ['list'],
    ['github'],
    ['junit', { outputFile: `test-results/junit-visibility-${specSlug}.xml` }]
  ],
  use: {
    ...base.use,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
});
