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

test.describe('Help Center operating (T34)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('question lists cards; backup imperative shows B-tier confirm and cancel does not write', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await page.locator('[data-testid=idle-help-center-beside]').click();
    await expect(helpCenter(page)).toBeVisible({ timeout: 8_000 });

    const input = page.getByTestId('help-center-ask-input');
    await input.fill('How do I back up my data?');
    await page.getByTestId('help-center-ask-submit').click();
    await expect(page.getByTestId('help-center-ask-card-KB-FUNC-0003')).toBeVisible({
      timeout: 8_000
    });
    await expect(page.getByTestId('help-center-operating')).toBeHidden();

    await input.fill('Back up now');
    await page.getByTestId('help-center-ask-submit').click();
    await expect(page.getByTestId('help-center-operating')).toBeVisible({
      timeout: 8_000
    });
    await expect(page.getByTestId('help-center-operating-line')).toBeVisible();
    await expect(page.getByTestId('help-center-operating-confirm')).toBeVisible();
    await page.getByTestId('help-center-operating-cancel').click();
    await expect(page.getByTestId('help-center-operating-confirm')).toBeHidden({
      timeout: 8_000
    });
    await expect(page.getByTestId('help-center-operating-line')).toBeVisible();
  });
});

test.describe('Help Center operating narrow', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('keyboard submit still lists a backup how-to card', async ({ page }) => {
    await openFreshProductShell(page);
    await page.locator('#ft-narrow-help-center-btn').click();
    await expect(helpCenter(page)).toBeVisible({ timeout: 8_000 });
    await page.getByTestId('help-center-ask-input').fill('How do I back up my data?');
    await page.getByTestId('help-center-ask-submit').click();
    await expect(page.getByTestId('help-center-ask-card-KB-FUNC-0003')).toBeVisible({
      timeout: 8_000
    });
  });
});
