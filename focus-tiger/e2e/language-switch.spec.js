import { test, expect } from '@playwright/test';
import {
  clickWideMoreProxyOrDirect,
  openFreshProductShell
} from './helpers/product-shell.js';

const LOCALE_KEY = 'focus-tiger.locale.v1';
const PANEL = '#language-preference-panel';
const SIT = '#btn-focus';

/**
 * v1.0.0 English + Japanese: Language UI → 日本語 → back to English; persist preference.
 * Draft locales (zh/es/…) must not appear.
 */
test('Language UI: switch to 日本語 then back to English', async ({ page }) => {
  await openFreshProductShell(page);

  await expect(page.locator(SIT)).toContainText(/Sit with Yin/i);

  await clickWideMoreProxyOrDirect(page, 'language');
  await expect(page.locator(PANEL)).toBeVisible({ timeout: 8_000 });

  await expect(page.locator('#language-preference-zh')).toHaveCount(0);
  await expect(page.locator('#language-preference-es')).toHaveCount(0);
  await expect(page.locator('#language-preference-de')).toHaveCount(0);

  await page.locator('#language-preference-ja').check();
  await expect(page.locator(SIT)).toContainText(/Yinと坐る/, {
    timeout: 5_000
  });

  const storedJa = await page.evaluate((key) => localStorage.getItem(key), LOCALE_KEY);
  expect(storedJa).toBe('ja');

  await page.locator('#language-preference-en').check();
  await expect(page.locator(SIT)).toContainText(/Sit with Yin/i, {
    timeout: 5_000
  });

  const storedEn = await page.evaluate((key) => localStorage.getItem(key), LOCALE_KEY);
  expect(storedEn).toBe('en');
});
