/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test('idle transition micro-trigger stays hidden (compass is the entry)', async ({
  page
}) => {
  await openFreshProductShell(page);
  const trigger = page.locator('[data-testid="transition-moment-trigger"]');
  await expect(trigger).toBeHidden({ timeout: 8_000 });
});

test('five moments compass transition chip opens transition moment overlay', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.evaluate(() => {
    try {
      localStorage.setItem('focus-tiger.five-moments-compass-seen.v1', '1');
    } catch {
      /* ignore */
    }
  });

  await page.locator('#ft-wide-more-btn').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible({ timeout: 5_000 });
  await menu.locator('[data-proxy="five-moments"]').click();

  const compass = page.locator('#five-moments-compass');
  await expect(compass).toBeVisible({ timeout: 5_000 });
  await compass.locator('[data-testid="five-moments-transition"]').click();

  const quote = page.locator('[data-testid="transition-moment-quote"]');
  await expect(quote).toBeVisible({ timeout: 4_000 });
  await expect(quote).toHaveText(/.{12,}/);
  await expect(compass).toBeHidden({ timeout: 2_000 });

  const backdrop = page.locator('[data-testid="transition-moment-backdrop"]');
  await expect(backdrop).toHaveCount(0);
});
