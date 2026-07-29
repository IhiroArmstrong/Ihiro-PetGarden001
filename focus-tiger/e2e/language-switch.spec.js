import { test, expect } from '@playwright/test';
import {
  clickWideMoreProxyOrDirect,
  openFreshProductShell
} from './helpers/product-shell.js';

const LOCALE_KEY = 'focus-tiger.locale.v1';
const PANEL = '#language-preference-panel';
const SIT = '#btn-focus';

/**
 * Task B · 点切语 UI → 中文文案 → 回流英文；并写 locale 偏好。
 */
test('Language UI: switch to 中文 then back to English', async ({ page }) => {
  await openFreshProductShell(page);

  await expect(page.locator(SIT)).toContainText(/Sit with Yin/i);

  await clickWideMoreProxyOrDirect(page, 'language');
  await expect(page.locator(PANEL)).toBeVisible({ timeout: 8_000 });

  // Draft locales must not appear (审完再露)
  await expect(page.locator('#language-preference-es')).toHaveCount(0);
  await expect(page.locator('#language-preference-ja')).toHaveCount(0);

  await page.locator('#language-preference-zh').check();
  await expect(page.locator(SIT)).toContainText(/与阿寅同坐/, {
    timeout: 5_000
  });

  const storedZh = await page.evaluate((key) => localStorage.getItem(key), LOCALE_KEY);
  expect(storedZh).toBe('zh');

  await page.locator('#language-preference-en').check();
  await expect(page.locator(SIT)).toContainText(/Sit with Yin/i, {
    timeout: 5_000
  });

  const storedEn = await page.evaluate((key) => localStorage.getItem(key), LOCALE_KEY);
  expect(storedEn).toBe('en');
});
