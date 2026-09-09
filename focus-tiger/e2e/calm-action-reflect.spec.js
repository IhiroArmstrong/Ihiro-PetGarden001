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

test('Reflection shows Calm Action during questions, Daily Wisdom only after Skip all', async ({
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
  await expect(wisdom).toBeHidden();

  await reflection.getByRole('button', { name: /Skip all|全部跳过/i }).click();
  await expect(reflection).toHaveAttribute('data-wisdom-hold', 'true');
  await expect(calmLine).toBeHidden();
  await expect(wisdom).toBeVisible();
  await expect(wisdom.locator('[data-testid="daily-wisdom-text"]')).not.toHaveText(
    ''
  );

  await reflection.getByRole('button', { name: /Continue|继续/i }).click();
  await expect(reflection).toBeHidden({ timeout: 10_000 });
});
