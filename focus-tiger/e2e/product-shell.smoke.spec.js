import { test, expect } from '@playwright/test';

/**
 * 产品壳入口冒烟 —— SCENARIO_TESTS 场景 A 前置（DOM 层）。
 * 不覆盖睡着序列观感 / Arrival 气泡时长（仍人工）。
 */
test('product shell shows Sit with Yin and hides emotion debug UI', async ({
  page
}) => {
  await page.goto('/?product=1');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('focus-tiger.')) localStorage.removeItem(key);
    }
  });
  await page.reload();

  const sit = page.locator('#btn-focus');
  await expect(sit).toBeVisible({ timeout: 60_000 });
  await expect(sit).toContainText(/Sit with Yin|与阿寅同坐/i);

  await expect(page.locator('#emotion-debug-ui')).toHaveCount(0);
  await expect(page.locator('#dev-reset-all-local-state')).toHaveCount(0);
});

test('lab shell exposes reset-all local state in DEV', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('#dev-reset-all-local-state')).toBeVisible();
});
