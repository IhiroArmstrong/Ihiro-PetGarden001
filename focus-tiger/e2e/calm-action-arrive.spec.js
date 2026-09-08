/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  chooseReadingAndOpenCompanion,
  openFreshProductShell
} from './helpers/product-shell.js';

test('arrival completion shows Calm Action card before companion focus', async ({
  page
}) => {
  await openFreshProductShell(page);
  await chooseReadingAndOpenCompanion(page);

  const card = page.locator('[data-testid="calm-action-arrive-card"]');
  await expect(card).toBeVisible({ timeout: 8_000 });
  await expect(card).not.toHaveText('');
  await expect(card).toHaveText(/.{12,}/);
});
