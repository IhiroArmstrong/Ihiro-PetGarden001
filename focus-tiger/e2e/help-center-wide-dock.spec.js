/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * @param {import('@playwright/test').Page} page
 */
async function openHelpCenter(page) {
  await openFreshProductShell(page);
  const browse = page.getByTestId('cold-start-goal-browse');
  const goalShown = await browse
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (goalShown) await browse.click({ force: true });
  const beside = page.getByTestId('idle-help-center-beside');
  await expect(beside).toBeVisible({ timeout: 15_000 });
  await beside.click();
  await expect(page.getByTestId('help-center')).toBeVisible();
}

test('wide desktop Help Center docks right of the midline', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openHelpCenter(page);
  const card = page.getByTestId('help-center');
  await expect(card).toHaveAttribute('data-dock', 'right');
  const box = await card.boundingBox();
  expect(box).toBeTruthy();
  expect(box.x).toBeGreaterThan(1280 * 0.5);
});

test('medium wide Help Center docks as a bottom strip', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await openHelpCenter(page);
  const card = page.getByTestId('help-center');
  await expect(card).toHaveAttribute('data-dock', 'bottom');
  const box = await card.boundingBox();
  expect(box).toBeTruthy();
  expect(box.y).toBeGreaterThan(900 * 0.45);
});
