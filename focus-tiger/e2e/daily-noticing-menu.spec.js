/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import {
  openFreshProductShell,
  pickWideMoreRadialGroup
} from './helpers/product-shell.js';

async function openDailyNoticingFromWideMenu(page) {
  await page.locator('#ft-wide-more-btn').click();
  await pickWideMoreRadialGroup(page, 'MENU_GROUP_PRACTICE');
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu.locator('[data-proxy="daily-noticing"]')).toBeVisible();
  await menu.locator('[data-proxy="daily-noticing"]').click();
  const card = page.locator('[data-testid="daily-noticing-card"]');
  await expect(card).toBeVisible({ timeout: 3_000 });
  return card;
}

async function openDailyNoticingFromNarrowDrawer(page) {
  const grabber = page.locator('.ft-narrow-grabber');
  await expect(grabber).toBeVisible({ timeout: 8_000 });
  await grabber.click();
  const drawer = page.locator('#ft-narrow-options-drawer');
  await expect(drawer).toHaveAttribute('aria-hidden', 'false', { timeout: 8_000 });
  const row = drawer.locator('[data-proxy="daily-noticing"]');
  await expect(row).toBeVisible({ timeout: 8_000 });
  await expect(grabber).toBeVisible();
  await row.click();
  const card = page.locator('[data-testid="daily-noticing-card"]');
  await expect(card).toBeVisible({ timeout: 3_000 });
  return card;
}

test('menu opens daily noticing and skip closes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);
  const card = await openDailyNoticingFromWideMenu(page);
  await page.locator('[data-testid="daily-noticing-skip"]').click();
  await expect(card).toBeHidden({ timeout: 3_000 });
});

test('crisis answer shows safety copy and G2 help entry in card', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);
  await openDailyNoticingFromWideMenu(page);
  await page.locator('[data-testid="daily-noticing-input"]').fill("I don't want to live");
  await page.locator('[data-testid="daily-noticing-continue"]').click();
  await expect(page.locator('[data-testid="daily-noticing-crisis-copy"]')).toBeVisible({
    timeout: 1_000
  });
  const card = page.locator('[data-testid="daily-noticing-card"]');
  const help = card.getByTestId('confide-to-yin-help-resources');
  await expect(help).toBeVisible({ timeout: 1_000 });
  await expect(help).toBeEnabled();
  await expect(page.locator('[data-testid="daily-noticing-closing"]')).toHaveCount(0);
});

test('375 drawer opens daily noticing without losing narrow grabber escape', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);
  const grabber = page.locator('.ft-narrow-grabber');
  const card = await openDailyNoticingFromNarrowDrawer(page);
  await expect(grabber).toBeVisible();
  await page.evaluate(() => window.__dailyNoticingCard?.close?.());
  await expect(card).toBeHidden({ timeout: 3_000 });
  await expect(grabber).toBeVisible();
});