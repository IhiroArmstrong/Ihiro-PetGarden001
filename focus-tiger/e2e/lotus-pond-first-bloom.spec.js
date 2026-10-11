/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * Visible blooms live on Where you are, never on Idle overlay.
 * Full-ring 11→12 count remains in lotus-pond-product.spec.js.
 */

test.describe('Lotus pond first bloom slot', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('qaLotusBlooms=1 plants bloom 0 on Where you are, not on Idle Yin', async ({
    page
  }) => {
    await openFreshProductShell(page, {
      query: { qaLotusBlooms: 1 }
    });

    await expect(page.locator('#lotus-pond')).toHaveCount(0);
    await expect(page.locator('#sprite-overlay .lotus-pond-bloom')).toHaveCount(
      0
    );

    await page.getByTestId('growth-journey-home-line').click();
    const row = page.getByTestId('growth-journey-lotus-row');
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row.locator('.lotus-pond-bloom')).toHaveCount(1);
    await expect(
      row.locator('.lotus-pond-bloom[data-lotus-index="0"]')
    ).toBeVisible();
  });
});
