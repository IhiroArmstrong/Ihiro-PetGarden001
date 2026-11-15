/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test.use({ viewport: { width: 1280, height: 900 } });

test('Preferences shows co-practice contract surface', async ({ page }) => {
  await openFreshProductShell(page);
  await page.getByTestId('ft-wide-more-btn').click();
  await page.getByTestId('idle-co-practice-contract').click();
  const contract = page.getByTestId('co-practice-contract');
  await expect(contract).toBeVisible({ timeout: 5_000 });
  await expect(contract).toContainText(/How Yin may speak|阿寅可能在哪里开口|阿寅が声をかける/);
});

test('Growth Journey detail omits co-practice contract surface', async ({ page }) => {
  await openFreshProductShell(page);
  await page.getByTestId('growth-journey-home-line').click();
  await expect(page.getByTestId('growth-journey-detail')).toBeVisible({
    timeout: 5_000
  });
  await expect(page.getByTestId('co-practice-contract')).toHaveCount(0);
});