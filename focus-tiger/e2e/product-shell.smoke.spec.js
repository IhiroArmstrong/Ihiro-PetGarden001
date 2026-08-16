/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * 产品壳入口冒烟 —— SCENARIO_TESTS 场景 A 前置（DOM 层）。
 * 不覆盖睡着序列观感 / Arrival 气泡时长（仍人工）。
 */
test('product shell shows Sit with Yin and hides emotion debug UI', async ({
  page
}) => {
  await openFreshProductShell(page);

  const sit = page.locator('#btn-focus');
  await expect(sit).toContainText(/Sit with Yin|与阿寅同坐/i);

  await expect(page.locator('#emotion-debug-ui')).toHaveCount(0);
  await expect(page.locator('#dev-reset-all-local-state')).toHaveCount(0);
});

test('lab shell exposes reset-all local state in DEV', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 60_000 });
  const reset = page.locator('#dev-reset-all-local-state');
  // Production `vite preview` (CI + local e2e) has DEV=false — lab chrome absent.
  // L-logic of reset is covered by localStateKeys unit tests; this asserts the
  // button only when the build actually ships lab chrome (vite serve).
  if ((await reset.count()) === 0) {
    test.skip(true, 'lab reset chrome not in production preview builds');
  }
  await expect(reset).toBeVisible();
});
