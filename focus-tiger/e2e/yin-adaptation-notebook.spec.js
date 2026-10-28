/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test.describe('Yin adaptation notebook (T58)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('journey shows a remember line and forget removes it', async ({ page }) => {
    await openFreshProductShell(page, {
      query: { sessionMinutes: 1 }
    });

    await page.evaluate(() => {
      localStorage.setItem(
        'focus-tiger.focus-duration-pref.v1',
        JSON.stringify({ minutes: 25, mode: 'fixed' })
      );
      window.__growthJourneyDetail?.open?.();
    });

    await expect(page.getByTestId('growth-journey-detail')).toBeVisible({
      timeout: 10_000
    });
    const line = page.getByTestId('yin-adaptation-line-remember-duration');
    await expect(line).toBeVisible({ timeout: 10_000 });

    await page.getByTestId('yin-adaptation-forget-remember-duration').click();
    await expect(line).toHaveCount(0);
  });
});
