/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import { openFreshProductShell } from './helpers/product-shell.js';

const GOAL_CARD = '#cold-start-goal-card';
const PURPOSE_CARD = '#onboarding-app-purpose';
const PURPOSE_LINK = '[data-testid="onboarding-purpose-today-direction"]';

test('wide ? purpose link opens goal card after purpose closes', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  await page.locator('#onboarding-hint-help').click();
  await expect(page.locator(PURPOSE_CARD)).toBeVisible({ timeout: 8_000 });
  await expect(page.locator(PURPOSE_LINK)).toBeVisible();

  await page.locator(PURPOSE_LINK).click();
  await expect(page.locator(PURPOSE_CARD)).toBeHidden({ timeout: 5_000 });
  await expect(page.locator(GOAL_CARD)).toBeVisible({ timeout: 5_000 });
});

test('375 ? purpose hides today-direction link before first seen', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);

  await expect(page.locator('#ft-narrow-idle-shell')).toBeVisible({
    timeout: 15_000
  });

  await page.locator('#ft-narrow-help-btn').click();
  await expect(page.locator(PURPOSE_CARD)).toBeVisible({ timeout: 8_000 });
  await expect(page.locator(PURPOSE_LINK)).toBeHidden();
});
