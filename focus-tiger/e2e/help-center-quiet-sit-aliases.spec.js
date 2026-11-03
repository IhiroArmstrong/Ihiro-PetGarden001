/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/** @param {import('@playwright/test').Page} page */
function helpCenter(page) {
  return page.locator('[data-testid=help-center]:not([hidden])');
}

test.describe('Help Center quiet-sit aliases (T76 B2)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('zazen lists Sit-with-Yin cards and quiet-sit copy, not a generic-class denial', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await page.locator('[data-testid=idle-help-center-beside]').click();
    await expect(helpCenter(page)).toBeVisible({ timeout: 8_000 });

    await page.getByTestId('help-center-ask-input').fill('zazen');
    await page.getByTestId('help-center-ask-submit').click();
    await expect(page.getByTestId('help-center-ask-card-KB-EDU-0003')).toBeVisible({
      timeout: 8_000
    });
    await expect(page.getByTestId('help-center-ask-card-KB-FUNC-0001')).toBeVisible();

    await page.getByTestId('help-center-ask-card-KB-EDU-0003').click();
    const article = helpCenter(page).locator('[data-testid=help-center-article]');
    await expect(article).toBeVisible({ timeout: 8_000 });
    await expect(article).toContainText(/quiet sit/i);
    await expect(article).toContainText(/no voice guidance/i);
    await expect(article).not.toContainText(/generic meditation class/i);
  });
});
