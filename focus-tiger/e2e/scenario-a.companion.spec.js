import { test, expect } from '@playwright/test';
import {
  advanceArrivalToCompanionPicker,
  expectFocusSessionActive,
  expectFocusSessionInactive,
  openCompanionHint,
  openFreshProductShell,
  selectCompanionMode,
  skipArrivalBegin
} from './helpers/product-shell.js';

/**
 * SCENARIO_TESTS 场景 A / I / K · 产品壳 DOM 主路径（到 Companion 开表为止）。
 * 不跑到 1 分钟达标 / Celebrating；序列观感仍人工。
 * 宽屏 Idle：How shall we sit? 停泊在 ⋯ 内，须经 `openCompanionHint`（勿直点 parked hint）。
 */

test('scenario I: hint opens companion panel when gate not ready (no silent no-op)', async ({
  page
}) => {
  await openFreshProductShell(page);

  await openCompanionHint(page);

  await expect(page.locator('.session-start-dock__panel')).toBeVisible({
    timeout: 5_000
  });
  await expect(page.locator('#arrival-practice')).toBeHidden();
});

test('companion panel dismisses on outside click', async ({ page }) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  const panel = page.locator('.session-start-dock__panel');
  await expect(panel).toBeVisible({ timeout: 5_000 });
  // Empty upper-left canvas (away from dock / ActionBar)
  await page.mouse.click(28, 140);
  await expect(panel).toBeHidden({ timeout: 3_000 });
});

test('scenario I2: Here & Now before Arrival gate opens Arrival (HUD stays idle)', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
  await expectFocusSessionInactive(page);
});

test('Arrival open: Sit hidden so Notice icons are not covered; Quick Start stays', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#btn-focus').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('#btn-focus')).toBeHidden();
  await expect(page.locator('#quick-start-focus')).toBeVisible();
  await expect(
    arrival.getByRole('button', { name: /Calm|平静|Not Sure|不确定/i }).first()
  ).toBeVisible({ timeout: 8_000 });
});

test('scenario A: Arrival Choose completes → focus timer starts', async ({
  page
}) => {
  await openFreshProductShell(page);
  await advanceArrivalToCompanionPicker(page);
  await expectFocusSessionActive(page);
});

test('scenario A2: preselect Flow → Quick Start starts timer', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  await selectCompanionMode(page, /Flow State|心流/i);
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
  await skipArrivalBegin(page);
  await expectFocusSessionActive(page);
});

test('scenario A3: preselect Here & Now → Quick Start starts timer', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
  await skipArrivalBegin(page);
  await expectFocusSessionActive(page);
});

test('scenario K: Offline Space starts focus without Arrival', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  await selectCompanionMode(page, /Offline Space|离线空间|Offline/i);
  await expect(page.locator('#arrival-practice')).toBeHidden({
    timeout: 5_000
  });
  await expectFocusSessionActive(page);
});
