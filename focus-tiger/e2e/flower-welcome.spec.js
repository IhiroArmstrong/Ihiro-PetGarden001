/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * Phase 2c · Day1 / 久别吹花门闩（DOM）。
 * 不锁序列观感 / CapCut 像素；锁冷启动气泡出现与失败门闩（同日配额、flag off）。
 */

test('Day1 cold start shows flower welcome bubble', async ({ page }) => {
  await openFreshProductShell(page);
  await expect(page.locator('#flower-blow-welcome-bubble')).toBeVisible({
    timeout: 12_000
  });
});

test('same-day reload does not show flower bubble again', async ({ page }) => {
  await openFreshProductShell(page);
  await expect(page.locator('#flower-blow-welcome-bubble')).toBeVisible({
    timeout: 12_000
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 35_000
  });
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 15_000 });
  // Welcome daily quota + lastOpen already set — no second flower/bubble.
  await page.waitForTimeout(1500);
  await expect(page.locator('#flower-blow-welcome-bubble')).toHaveCount(0);
});

test('flowerWelcome=0 never shows flower bubble on Day1', async ({ page }) => {
  await openFreshProductShell(page, { query: { flowerWelcome: 0 } });
  await page.waitForTimeout(1500);
  await expect(page.locator('#flower-blow-welcome-bubble')).toHaveCount(0);
});

test('welcome quota blocks flower even if Day1 force would apply', async ({
  page
}) => {
  await openFreshProductShell(page);
  await expect(page.locator('#flower-blow-welcome-bubble')).toBeVisible({
    timeout: 12_000
  });
  // Burned welcome quota stays; reset flower lastOpen to Day1-looking state.
  await page.evaluate(() => {
    localStorage.removeItem('focus-tiger.flower-welcome.v1');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 35_000
  });
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1500);
  await expect(page.locator('#flower-blow-welcome-bubble')).toHaveCount(0);
});
