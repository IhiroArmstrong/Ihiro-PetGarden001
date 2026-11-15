/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * T68 surface-on: ceremony card can show; ⋯ stays visible as the menu hatch.
 * Opens via the always-on card handle (no DEV preview hook; CI uses preview).
 */

test.describe('T68 co-practice gift-art surface', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('preview card is visible and wide ⋯ stays in view', async ({ page }) => {
    await openFreshProductShell(page);

    await expect
      .poll(
        async () =>
          page.evaluate(() => Boolean(window.__coPracticeGiftArtCard?.open)),
        { timeout: 15_000 }
      )
      .toBe(true);

    await page.evaluate(() => {
      window.__coPracticeGiftArtCard.open({ pieceId: 'mountain-boat-tray' });
    });

    const card = page.locator('[data-testid="co-practice-gift-art-card"]');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toContainText('Mountain boat tray');
    await expect(page.locator('#ft-wide-more-btn')).toBeVisible();

    await page.locator('[data-testid="co-practice-gift-art-close"]').click();
    await expect(card).toBeHidden({ timeout: 5_000 });
  });
});
