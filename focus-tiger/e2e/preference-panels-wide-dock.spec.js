/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  expandWideMoreMenuGroup,
  openFreshProductShell
} from './helpers/product-shell.js';

/**
 * @param {import('@playwright/test').Page} page
 */
async function openReminderFromWideMenu(page) {
  await openFreshProductShell(page);
  await page.locator('#ft-wide-more-btn').click();
  await expandWideMoreMenuGroup(page, 'MENU_GROUP_PREFERENCES');
  const row = page.locator('#ft-wide-more-menu [data-proxy="reminder"]');
  await row.hover();
  await row.click();
  const panel = page.locator('#reminder-preference-panel');
  await expect(panel).toBeVisible({ timeout: 5_000 });
  return panel;
}

test('wide desktop reminder panel docks right of the midline', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const panel = await openReminderFromWideMenu(page);
  await expect(panel).toHaveAttribute('data-dock', 'right');
  await expect(panel).toHaveAttribute('data-ft-glass-card', '1');
  const box = await panel.boundingBox();
  expect(box).toBeTruthy();
  expect(box.x).toBeGreaterThan(1280 * 0.5);
});

test('medium wide reminder panel docks as a bottom strip', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 });
  const panel = await openReminderFromWideMenu(page);
  await expect(panel).toHaveAttribute('data-dock', 'bottom');
  const box = await panel.boundingBox();
  expect(box).toBeTruthy();
  expect(box.y).toBeGreaterThan(900 * 0.45);
});

test('reminder title chrome is draggable on wide', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const panel = await openReminderFromWideMenu(page);
  const before = await panel.boundingBox();
  const title = panel.locator('#reminder-preference-title');
  const titleBox = await title.boundingBox();
  expect(before).toBeTruthy();
  expect(titleBox).toBeTruthy();
  await page.mouse.move(titleBox.x + titleBox.width / 2, titleBox.y + 4);
  await page.mouse.down();
  await page.mouse.move(titleBox.x - 80, titleBox.y - 40, { steps: 6 });
  await page.mouse.up();
  const after = await panel.boundingBox();
  expect(after).toBeTruthy();
  expect(after.x).not.toBeCloseTo(before.x, 0);
});