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

  test('habitual confirm yes/no: no hides the question', async ({ page }) => {
    await openFreshProductShell(page, {
      query: { sessionMinutes: 1 }
    });

    await page.evaluate(() => {
      localStorage.setItem(
        'focus-tiger.focus-duration-pref.v1',
        JSON.stringify({ minutes: 25, mode: 'fixed' })
      );
      localStorage.setItem(
        'focus-tiger.pref-state-read.v1',
        JSON.stringify({
          qualifyingManualPicks: [
            { minutes: 25, at: 1 },
            { minutes: 25, at: 2 },
            { minutes: 25, at: 3 }
          ]
        })
      );
      window.__growthJourneyDetail?.open?.();
    });

    await expect(page.getByTestId('growth-journey-detail')).toBeVisible({
      timeout: 10_000
    });
    await expect(page.getByTestId('yin-adaptation-line-pref-habitual-confirm')).toBeVisible({
      timeout: 10_000
    });
    await page.getByTestId('yin-pref-habitual-no').click();
    await expect(page.getByTestId('yin-adaptation-line-pref-habitual-confirm')).toHaveCount(0);
  });
});
