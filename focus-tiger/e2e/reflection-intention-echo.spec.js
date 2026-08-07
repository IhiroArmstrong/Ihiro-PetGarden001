import { test, expect } from '@playwright/test';
import {
  chooseReadingAndAwaitFocus,
  clickSitEntry,
  expectFocusSessionActive,
  openFreshProductShell,
  skipArrivalBegin
} from './helpers/product-shell.js';

/**
 * 回归：Arrival Choose Reading → Rise → Reflection 顶部须回显意图（真实 DOM）。
 * 锁主路径「有 Choose 则见回显 / Skip — begin 无回显」；**非**「二次 beginFocus 抹空」Bug 回归锁
 * （该 Bug → SessionIntentionStore.test.js · resolveSessionIntentionLatch 用例 · §7 红绿对照）。
 *
 * Quick Start 用例放前面：Choose→Reflection 路径较重，若未关掉面板再结束，同 worker
 * 下一次 openFresh 的 page.goto 会挂到超时（本地全量套件中途风暴的触发点之一）。
 */

async function riseAndAwaitReflection(page) {
  await page.locator('#btn-focus').click();
  const reflection = page.locator('#tiger-reflection-moment');
  await expect(reflection).toBeVisible({ timeout: 15_000 });
  return reflection;
}

async function dismissReflection(page, reflection) {
  await reflection.getByRole('button', { name: /Skip all|全部跳过/i }).click();
  await expect(reflection).toBeHidden({ timeout: 10_000 });
}

test('Quick Start then Rise does not show intention echo on Reflection', async ({
  page
}) => {
  await openFreshProductShell(page);
  await clickSitEntry(page);
  await skipArrivalBegin(page);
  await expectFocusSessionActive(page);

  const reflection = await riseAndAwaitReflection(page);
  const echo = reflection.locator('[data-testid="reflection-intention-echo"]');
  await expect(echo).toHaveCount(0);
  await dismissReflection(page, reflection);
});

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
  await dismissReflection(page, reflection);
});
