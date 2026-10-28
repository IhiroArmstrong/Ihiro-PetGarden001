/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test('Growth Journey detail shows co-practice contract surface', async ({ page }) => {
  await openFreshProductShell(page);
  await page.getByTestId('growth-journey-home-line').click();
  const contract = page.getByTestId('co-practice-contract');
  await expect(contract).toBeVisible({ timeout: 5_000 });
  await expect(contract).toContainText(/How Yin may speak|阿寅可能在哪里开口|阿寅が声をかける/);
});
