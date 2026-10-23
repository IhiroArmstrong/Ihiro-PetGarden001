/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  expectFocusSessionActive,
  openFreshProductShell,
  chooseReadingAndOpenCompanion,
  selectCompanionMode
} from './helpers/product-shell.js';

test('Here & Now awaken invite yes opens ground practice', async ({ page }) => {
  await openFreshProductShell(page, { query: { sessionMinutes: '1' } });
  await chooseReadingAndOpenCompanion(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expectFocusSessionActive(page);

  const shown = await page.evaluate(() => window.__awakenInvite?.showPause?.());
  expect(shown).toBe(true);
  const invite = page.locator('[data-testid="awaken-invite"]');
  await expect(invite).toBeVisible();
  await page.locator('[data-testid="awaken-invite-yes"]').click();
  await expect(page.locator('[data-testid="recover-reset-practice"]')).toBeVisible({
    timeout: 5_000
  });
});
