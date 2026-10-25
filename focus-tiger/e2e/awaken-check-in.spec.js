/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  clickSitEntry,
  openFreshProductShell,
  expectFocusSessionActive,
  skipArrivalBegin
} from './helpers/product-shell.js';

test('Rise shows end check-in inside Reflection without blocking Skip', async ({
  page
}) => {
  await openFreshProductShell(page, { query: { sessionMinutes: '1' } });
  await clickSitEntry(page);
  await skipArrivalBegin(page);
  await expectFocusSessionActive(page);
  await page.locator('#btn-focus').click();

  const reflection = page.locator('#tiger-reflection-moment');
  await expect(reflection).toBeVisible({ timeout: 15_000 });

  const checkIn = reflection.locator('[data-testid="awaken-check-in"]');
  await expect(checkIn).toBeVisible({ timeout: 5_000 });
  await checkIn.locator('[data-testid="awaken-check-in-ease"]').click();
  await expect(checkIn).toHaveCount(0);

  await expect(
    reflection.getByRole('button', { name: /Skip all|全部跳过/i })
  ).toBeVisible();
});
