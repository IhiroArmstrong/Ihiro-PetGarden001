/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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
  // Exit before the 120m Actions kill so the JUnit reporter can flush.
  // A hard cancel on 2026-09-28..30 left zero XML and no job log.
  globalTimeout: 100 * 60 * 1000,
  reporter: [
    ['list'],
    ['github'],
    ['junit', { outputFile: `test-results/junit-shard-${shard}.xml` }]
  ],
  use: {
    ...base.use,
    // on-first-retry traces + retain-on-failure video (not every attempt).
    // No HTML report. Workflow uploads JUnit always and trace.zip only on failure.
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
});
