/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import { openFreshProductShell } from './helpers/product-shell.js';

test('menu opens daily noticing and skip closes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);
  await page.locator('#ft-wide-more-btn').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu.locator('[data-proxy="daily-noticing"]')).toBeVisible();
  await menu.locator('[data-proxy="daily-noticing"]').click();
  const card = page.locator('[data-testid="daily-noticing-card"]');
  await expect(card).toBeVisible({ timeout: 3_000 });
  await page.locator('[data-testid="daily-noticing-skip"]').click();
  await expect(card).toBeHidden({ timeout: 3_000 });
});