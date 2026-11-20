/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test('Thought Drop agree-continue without boxes shows consent alert', async ({
  page
}) => {
  await openFreshProductShell(page, {
    query: { confide: '1', flowerWelcome: '0' }
  });
  const browse = page.getByTestId('cold-start-goal-browse');
  const goalShown = await browse
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (goalShown) await browse.click();

  await page.waitForFunction(() => Boolean(window.__confideToYin?.open), {
    timeout: 15_000
  });
  await page.evaluate(() => window.__confideToYin.open());

  const modal = page.getByTestId('confide-consent-modal');
  await expect(modal).toBeVisible();

  await page.getByTestId('confide-consent-confirm').click();

  const err = page.getByTestId('confide-consent-error');
  await expect(err).toBeVisible();
  await expect(err).not.toBeEmpty();
});