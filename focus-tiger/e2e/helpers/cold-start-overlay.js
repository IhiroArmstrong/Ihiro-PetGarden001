/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { expect } from '@playwright/test';

/**
 * Dismiss cold-start overlays that block wide ⋯ menu clicks after `openFreshProductShell`.
 * Mirrors the cleanup proven in `ground-exercise-menu.spec.js`.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ hideFlowerBubble?: boolean }} [opts]
 */
export async function dismissColdStartOverlay(page, opts = {}) {
  const hideFlowerBubble = opts.hideFlowerBubble !== false;

  await page.evaluate((hideFlower) => {
    try {
      localStorage.setItem('focus-tiger.cold-start-goal-seen.v1', '1');
      localStorage.setItem('focus-tiger.five-moments-compass-seen.v1', '1');
    } catch {
      /* ignore */
    }
    window.__coldStartGoalCard?.close?.();
    window.__fiveMomentsCompass?.close?.();
    if (hideFlower) {
      window.__flowerBlowWelcomeBubble?.hide?.({ immediate: true });
    }
  }, hideFlowerBubble);

  await expect(page.locator('#cold-start-goal-card')).toBeHidden({
    timeout: 25_000
  });
}
