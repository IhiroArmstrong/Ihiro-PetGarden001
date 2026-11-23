/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import { openFreshProductShell } from './helpers/product-shell.js';

test.use({ viewport: { width: 390, height: 844 } });

test('narrow menu: favorite appears in My Favorites section', async ({ page }) => {
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  const grabber = page.locator('.ft-narrow-grabber');
  await grabber.click();

  const inspirationRow = page
    .locator('.ft-pref-card__items .ft-narrow-sheet__item[data-proxy="daily-quote"]')
    .first();
  await expect(inspirationRow).toBeVisible({ timeout: 10_000 });

  const heart = inspirationRow
    .locator('..')
    .locator('[data-testid="menu-favorite-daily-quote"]');
  await heart.click();

  await expect(
    page.locator('.ft-narrow-sheet__group[data-group="MENU_GROUP_MY_FAVORITES"]')
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="menu-favorite-daily-quote"][aria-pressed="true"]')
  ).toHaveCount(2);

  await page
    .locator('[data-testid="menu-favorite-daily-quote"]')
    .first()
    .click();
  await expect(
    page.locator('.ft-narrow-sheet__group[data-group="MENU_GROUP_MY_FAVORITES"]')
  ).toHaveCount(0);
});