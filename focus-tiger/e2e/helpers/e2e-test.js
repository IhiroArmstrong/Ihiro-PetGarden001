/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test as base, expect } from '@playwright/test';

/**
 * E2E isolation model:
 * - Playwright allocates a fresh BrowserContext per test (no shared cookies/storage).
 * - `openFreshProductShell` wipes `focus-tiger.*` localStorage on the first goto in
 *   that context; mid-test reloads that seed practice data must not be wiped again.
 * - This fixture adds afterEach cleanup so any in-test localStorage writes cannot
 *   leak if a future config ever shares contexts between tests.
 *
 * Import `{ test, expect }` from here instead of `@playwright/test` when wiring new
 * specs that seed per-test data (heatmap, milestone glow, mustard seed, …).
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await use(page);
    try {
      await page.evaluate(() => {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('focus-tiger.')) localStorage.removeItem(key);
        }
        for (const key of Object.keys(sessionStorage)) {
          if (key.startsWith('focus-tiger.')) sessionStorage.removeItem(key);
        }
        sessionStorage.removeItem('__ftE2eStorageGate');
      });
    } catch {
      /* page may already be closed */
    }
  }
});

export { expect };
