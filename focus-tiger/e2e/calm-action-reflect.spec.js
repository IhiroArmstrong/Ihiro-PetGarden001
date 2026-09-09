/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  clickSitEntry,
  expectFocusSessionActive,
  openFreshProductShell,
  skipArrivalBegin
} from './helpers/product-shell.js';

async function riseAndAwaitReflection(page) {
  await page.locator('#btn-focus').click();
  const reflection = page.locator('#tiger-reflection-moment');
  await expect(reflection).toBeVisible({ timeout: 15_000 });
  return reflection;
}

test('Rise opens Reflection with Calm Action line and Daily Wisdom', async ({
  page
}) => {
  await openFreshProductShell(page);
  await clickSitEntry(page);
  await skipArrivalBegin(page);
  await expectFocusSessionActive(page);

  const reflection = await riseAndAwaitReflection(page);

  const calmLine = reflection.locator('[data-testid="calm-action-reflect-line"]');
  await expect(calmLine).toBeVisible();
  await expect(calmLine).toHaveText(/.{12,}/);

  const wisdom = reflection.locator('[data-testid="reflection-daily-wisdom"]');
  await expect(wisdom).toBeVisible();
});
