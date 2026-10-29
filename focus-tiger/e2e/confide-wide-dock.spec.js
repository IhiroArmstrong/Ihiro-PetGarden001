/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * @param {import('@playwright/test').Page} page
 */
async function openConfideCard(page) {
  await openFreshProductShell(page, {
    query: { confide: '1', flowerWelcome: '0' }
  });
  const browse = page.getByTestId('cold-start-goal-browse');
  const goalShown = await browse
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (goalShown) await browse.click({ force: true });
  const ear = page.getByTestId('confide-ear-chrome');
  await expect(ear).toBeVisible({ timeout: 15_000 });
  await ear.click();
  await expect(page.getByTestId('confide-to-yin-card')).toBeVisible();
}

test('wide desktop Confide stays centered (T41 dock suspended)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openConfideCard(page);
  const card = page.getByTestId('confide-to-yin-card');
  await expect(card).toHaveAttribute('data-dock', 'center');
  const box = await card.boundingBox();
  expect(box).toBeTruthy();
  const mid = box.x + box.width / 2;
  expect(Math.abs(mid - 1280 / 2)).toBeLessThan(80);
});

test('medium wide Confide stays centered (T41 dock suspended)', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await openConfideCard(page);
  const card = page.getByTestId('confide-to-yin-card');
  await expect(card).toHaveAttribute('data-dock', 'center');
  const box = await card.boundingBox();
  expect(box).toBeTruthy();
  const mid = box.x + box.width / 2;
  expect(Math.abs(mid - 700 / 2)).toBeLessThan(60);
});

test('Confide card is not a glass-card drag handle', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openConfideCard(page);
  const card = page.getByTestId('confide-to-yin-card');
  await expect(card).not.toHaveAttribute('data-ft-glass-card', '1');
});
