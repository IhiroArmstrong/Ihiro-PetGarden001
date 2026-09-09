/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test('idle transition moment opens overlay with quote', async ({ page }) => {
  await openFreshProductShell(page);

  const trigger = page.locator('[data-testid="transition-moment-trigger"]');
  await expect(trigger).toBeVisible({ timeout: 8_000 });

  await trigger.click();

  const quote = page.locator('[data-testid="transition-moment-quote"]');
  await expect(quote).toBeVisible({ timeout: 4_000 });
  await expect(quote).toHaveText(/.{12,}/);

  const backdrop = page.locator('[data-testid="transition-moment-backdrop"]');
  await expect(backdrop).toBeVisible();
});
