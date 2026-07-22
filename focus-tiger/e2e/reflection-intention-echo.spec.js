import { test, expect } from '@playwright/test';
import {
  chooseReadingAndAwaitFocus,
  expectFocusSessionActive,
  openFreshProductShell,
  skipArrivalBegin
} from './helpers/product-shell.js';

/**
 * 回归：Arrival Choose Reading → Rise → Reflection 顶部须回显意图（真实 DOM）。
 * 锁住「二次 beginFocus 把意图抹成空」类假修好。
 * smoke C 仅锁 SessionEndFlow 入参；本文件锁 Choose→Rise→Reflection 完整用户链。
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

test('Skip — begin then Rise does not show intention echo on Reflection', async ({
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
