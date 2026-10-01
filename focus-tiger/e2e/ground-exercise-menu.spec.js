/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import { openFreshProductShell } from './helpers/product-shell.js';

test('idle more menu opens ground exercise choice and starts feel-the-ground', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  await page.locator('#ft-wide-more-btn').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-proxy="ground-exercise"]')).toBeVisible();
  await menu.locator('[data-proxy="ground-exercise"]').click();

  const choice = page.locator('[data-testid="ground-exercise-choice"]');
  await expect(choice).toBeVisible({ timeout: 3_000 });
  await expect(
    choice.locator('[data-testid="ground-exercise-ground"]')
  ).toBeVisible();
  await expect(
    choice.locator('[data-testid="ground-exercise-look"]')
  ).toBeVisible();

  await choice.locator('[data-testid="ground-exercise-ground"]').click();
  const practice = page.locator('[data-testid="recover-reset-practice"]');
  await expect(practice).toBeVisible({ timeout: 3_000 });
  await expect(practice).toHaveAttribute('data-route', 'ground');
});

test('passive refocus no longer shows emoji offer strip', async ({ page }) => {
  await openFreshProductShell(page, { query: { sessionMinutes: '1' } });
  await page.evaluate(() => {
    window.__mindfulReminderController?.handleAttentionReturn?.({
      durationMs: 70_000,
      displayEligible: true
    });
  });
  const offer = page.locator('[data-testid="recover-reset-offer"]');
  await expect(offer).toHaveCount(0, { timeout: 12_000 });
});
