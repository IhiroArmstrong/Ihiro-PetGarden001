import { test, expect } from '@playwright/test';
import {
  chooseReadingAndAwaitFocus,
  openFreshProductShell
} from './helpers/product-shell.js';

/**
 * 回归：Arrival Choose Reading → Rise → Reflection 顶部须回显意图。
 * 锁住「二次 beginFocus 把意图抹成空」类假修好。
 */
test('Choose Reading then Rise shows intention echo on Reflection', async ({
  page
}) => {
  await openFreshProductShell(page);
  await chooseReadingAndAwaitFocus(page);

  await page.locator('#btn-focus').click();
  const reflection = page.locator('#tiger-reflection-moment');
  await expect(reflection).toBeVisible({ timeout: 15_000 });

  const echo = reflection.locator('[data-testid="reflection-intention-echo"]');
  await expect(echo).toBeVisible();
  await expect(echo).toContainText(/Chosen direction:|所选方向：/i);
  await expect(echo).toContainText(/Reading|阅读/i);
});
