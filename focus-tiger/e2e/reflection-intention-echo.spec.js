import { test, expect } from '@playwright/test';
import {
  chooseReadingAndAwaitFocus,
  expectFocusSessionActive,
  openFreshProductShell,
  skipArrivalBegin
} from './helpers/product-shell.js';

/**
 * 回归：Arrival Choose Reading → Rise → Reflection 顶部须回显意图（真实 DOM）。
 * 锁主路径「有 Choose 则见回显 / Skip — begin 无回显」；**非**「二次 beginFocus 抹空」Bug 回归锁
 * （该 Bug → SessionIntentionStore.test.js · resolveSessionIntentionLatch 用例 · §7 红绿对照）。
 */

async function riseAndAwaitReflection(page) {
  await page.locator('#btn-focus').click();
  const reflection = page.locator('#tiger-reflection-moment');
  await expect(reflection).toBeVisible({ timeout: 15_000 });
  return reflection;
}

test('Choose Reading then Rise shows intention echo on Reflection', async ({
  page
}) => {
  await openFreshProductShell(page);
  await chooseReadingAndAwaitFocus(page);

  const reflection = await riseAndAwaitReflection(page);
  const echo = reflection.locator('[data-testid="reflection-intention-echo"]');
  await expect(echo).toBeVisible();
  await expect(echo).toContainText(/Chosen direction:|所选方向：/i);
  await expect(echo).toContainText(/Reading|阅读/i);
});

test('Quick Start then Rise does not show intention echo on Reflection', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#btn-focus').click();
  await skipArrivalBegin(page);
  await expectFocusSessionActive(page);

  const reflection = await riseAndAwaitReflection(page);
  const echo = reflection.locator('[data-testid="reflection-intention-echo"]');
  await expect(echo).toHaveCount(0);
});
