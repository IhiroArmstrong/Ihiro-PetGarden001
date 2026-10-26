/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test('web product shell has no Focus rhythm menu row', async ({ page }) => {
  await openFreshProductShell(page);
  await expect(page.locator('[data-testid="idle-input-rhythm"]')).toHaveCount(0);
  await expect(page.locator('#input-rhythm-preference-panel')).toBeHidden();
});
