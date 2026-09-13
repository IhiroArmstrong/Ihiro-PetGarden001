/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  expectFocusSessionActive,
  openFreshProductShell,
  quickStartFocus
} from './helpers/product-shell.js';

test('FocusHUD Idle C.2 hides shared-sitting bar until hover; Focusing shows full chrome', async ({
  page
}) => {
  await openFreshProductShell(page);

  const hud = page.locator('#focus-hud .ft-hud');
  await expect(hud).toHaveAttribute('data-focusing', '0');

  const bar = page.locator('#focus-hud .ft-hud__bar');
  await expect
    .poll(async () => bar.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBe(0);

  await hud.hover();
  await expect
    .poll(async () => bar.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.9);

  await page.mouse.move(0, 0);
  await expect
    .poll(async () => bar.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBe(0);

  await quickStartFocus(page);
  await expectFocusSessionActive(page);

  await expect(hud).toHaveAttribute('data-focusing', '1');
  await expect
    .poll(async () => bar.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.9);

  const streak = page.locator('#focus-hud .ft-hud__streak');
  await expect
    .poll(async () => streak.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.9);
});
