/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import { openFreshProductShell } from './helpers/product-shell.js';

const GOAL_CARD = '#cold-start-goal-card';

test('375 home today-direction ball opens goal card; Esc dismisses without navigation', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  const ball = page.locator('#ft-narrow-home-today-direction');
  await expect(ball).toBeVisible({ timeout: 15_000 });
  await ball.click();

  await expect(page.locator(GOAL_CARD)).toBeVisible({ timeout: 5_000 });
  await page.keyboard.press('Escape');
  await expect(page.locator(GOAL_CARD)).toBeHidden({ timeout: 5_000 });
  await expect(page.locator('#micro-ritual')).toBeHidden();
});

test('wide Preferences today-direction row opens goal card manually', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  await page.locator('#ft-wide-more-btn').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible({ timeout: 5_000 });
  const prefsHeader = menu.locator(
    '.ft-wide-more__section-header[data-group="MENU_GROUP_PREFERENCES"]'
  );
  if ((await prefsHeader.getAttribute('aria-expanded')) !== 'true') {
    await prefsHeader.click();
    await expect(prefsHeader).toHaveAttribute('aria-expanded', 'true', {
      timeout: 3_000
    });
  }
  const row = menu.locator('[data-proxy="today-direction"]');
  await expect(row).toBeVisible();
  await row.click();

  await expect(page.locator(GOAL_CARD)).toBeVisible({ timeout: 5_000 });
  await page.locator('[data-testid="cold-start-goal-focus"]').click();
  const ritual = page.locator('#micro-ritual');
  await expect(ritual).toBeVisible({ timeout: 8_000 });
  await expect(ritual).toHaveAttribute('data-micro-ritual-phase', 'breath');
});
