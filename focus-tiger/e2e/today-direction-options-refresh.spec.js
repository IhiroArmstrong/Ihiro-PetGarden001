/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import { openFreshProductShell } from './helpers/product-shell.js';

const BANNER = '[data-testid="today-direction-options-banner"]';
const GOAL_CARD = '#cold-start-goal-card';

test('options refresh banner shows when seen version is stale', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  await page.evaluate(() => {
    localStorage.setItem('focus-tiger.cold-start-goal-options-seen.v1', '0');
    window.__todayDirectionOptionsBanner.sync();
  });

  await expect(page.locator(BANNER)).toBeVisible({ timeout: 8_000 });
});

test('options refresh dismiss hides banner without opening goal card', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  await page.evaluate(() => {
    localStorage.setItem('focus-tiger.cold-start-goal-options-seen.v1', '0');
    window.__todayDirectionOptionsBanner.sync();
  });
  await expect(page.locator(BANNER)).toBeVisible({ timeout: 8_000 });

  await page.locator('[data-testid="today-direction-options-banner-dismiss"]').click();
  await expect(page.locator(BANNER)).toBeHidden({ timeout: 5_000 });
  await expect(page.locator(GOAL_CARD)).toBeHidden();

  await page.evaluate(() => window.__todayDirectionOptionsBanner.sync());
  await expect(page.locator(BANNER)).toBeHidden();
});

test('options refresh CTA opens goal card', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  await page.evaluate(() => {
    localStorage.setItem('focus-tiger.cold-start-goal-options-seen.v1', '0');
    window.__todayDirectionOptionsBanner.sync();
  });
  await expect(page.locator(BANNER)).toBeVisible({ timeout: 8_000 });

  await page.locator('[data-testid="today-direction-options-banner-cta"]').click();
  await expect(page.locator(BANNER)).toBeHidden({ timeout: 5_000 });
  await expect(page.locator(GOAL_CARD)).toBeVisible({ timeout: 5_000 });
});
