import { test, expect } from '@playwright/test';
import {
  advanceArrivalToCompanionPicker,
  expectFocusSessionActive,
  expectFocusSessionInactive,
  openFreshProductShell,
  selectCompanionMode
} from './helpers/product-shell.js';

/**
 * SCENARIO_TESTS 场景 A / I / K · 产品壳 DOM 主路径（到 Companion 开表为止）。
 * 不跑到 1 分钟达标 / Celebrating；序列观感仍人工。
 */

test('scenario I: hint opens Arrival when gate not ready (no silent no-op)', async ({
  page
}) => {
  await openFreshProductShell(page);

  const hint = page.locator('.session-start-dock__hint');
  await expect(hint).toBeVisible();
  await expect(hint).toBeEnabled();

  await hint.click();

  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
});

test('scenario A: Arrival → Here & Now starts focus timer', async ({ page }) => {
  await openFreshProductShell(page);
  await advanceArrivalToCompanionPicker(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expectFocusSessionActive(page);
});

test('scenario K: Offline Space preselect does not start timer until second Sit', async ({
  page
}) => {
  await openFreshProductShell(page);
  await advanceArrivalToCompanionPicker(page);
  await selectCompanionMode(page, /Offline Space|离线/i);

  await expectFocusSessionInactive(page);
  await expect(page.locator('.session-start-dock__panel')).toBeHidden();

  await page.locator('#btn-focus').click();
  await expectFocusSessionActive(page);
});
