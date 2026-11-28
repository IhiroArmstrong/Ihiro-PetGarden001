/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/** @param {import('@playwright/test').Page} page */
function purposeCard(page) {
  return page.locator('#onboarding-app-purpose:not([hidden])');
}

/** @param {import('@playwright/test').Page} page */
function helpCenter(page) {
  return page.locator('[data-testid=help-center]:not([hidden])');
}

test.describe('wide Help Center beside ?', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('compass glyph fills round chrome beside ? (regression)', async ({
    page
  }) => {
    await openFreshProductShell(page);
    const beside = page.locator('[data-testid=idle-help-center-beside]');
    await expect(beside).toBeVisible({ timeout: 8_000 });
    const metrics = await page.evaluate(() => {
      const btn = document.querySelector(
        '[data-testid=idle-help-center-beside]'
      );
      const svg = btn?.querySelector('.ft-help-center-beside-compass');
      if (!btn || !svg) return null;
      const br = btn.getBoundingClientRect();
      const sr = svg.getBoundingClientRect();
      const btnSide = Math.min(br.width, br.height);
      const glyphSide = Math.min(sr.width, sr.height);
      return { ratio: glyphSide / btnSide };
    });
    expect(metrics).toBeTruthy();
    // 22px in a 40px button looked like a speck (~0.55); target ~0.8 at 32px.
    expect(metrics.ratio).toBeGreaterThanOrEqual(0.72);
  });

  test('new button sits right of ? and opens Help Center only', async ({
    page
  }) => {
    await openFreshProductShell(page);
    const q = page.locator('#onboarding-hint-help');
    const beside = page.locator('[data-testid=idle-help-center-beside]');
    await expect(q).toBeVisible({ timeout: 8_000 });
    await expect(beside).toBeVisible({ timeout: 8_000 });
    const qBox = await q.boundingBox();
    const besideBox = await beside.boundingBox();
    expect(qBox && besideBox).toBeTruthy();
    expect(besideBox.x).toBeGreaterThan(qBox.x);

    await beside.click();
    await expect(helpCenter(page)).toBeVisible({ timeout: 8_000 });
    await expect(purposeCard(page)).toHaveCount(0);
  });

  test('purpose and Help Center stay mutually exclusive', async ({ page }) => {
    await openFreshProductShell(page);
    const q = page.locator('#onboarding-hint-help');
    const beside = page.locator('[data-testid=idle-help-center-beside]');
    await expect(q).toBeVisible({ timeout: 8_000 });

    await q.click();
    await expect(purposeCard(page)).toBeVisible({ timeout: 8_000 });
    await expect(helpCenter(page)).toHaveCount(0);

    await beside.click();
    await expect(helpCenter(page)).toBeVisible({ timeout: 8_000 });
    await expect(purposeCard(page)).toHaveCount(0);

    await q.click();
    await expect(purposeCard(page)).toBeVisible({ timeout: 8_000 });
    await expect(helpCenter(page)).toHaveCount(0);

    await beside.click();
    await expect(helpCenter(page)).toBeVisible({ timeout: 8_000 });
    await beside.click();
    await expect(helpCenter(page)).toBeVisible({ timeout: 8_000 });
    await expect(purposeCard(page)).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(helpCenter(page)).toHaveCount(0);
  });
});

test.describe('narrow Help Center beside ?', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('375 ActionBar button right of ? opens Help Center', async ({
    page
  }) => {
    await openFreshProductShell(page);
    const q = page.locator('#ft-narrow-help-btn');
    const beside = page.locator('#ft-narrow-help-center-btn');
    await expect(q).toBeVisible({ timeout: 8_000 });
    await expect(beside).toBeVisible({ timeout: 8_000 });
    const qBox = await q.boundingBox();
    const besideBox = await beside.boundingBox();
    expect(qBox && besideBox).toBeTruthy();
    expect(besideBox.x).toBeGreaterThan(qBox.x);

    await beside.click();
    await expect(helpCenter(page)).toBeVisible({ timeout: 8_000 });
    await expect(purposeCard(page)).toHaveCount(0);
  });
});
