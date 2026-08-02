import { test, expect } from '@playwright/test';
import {
  clickWideMoreProxyOrDirect,
  openFreshProductShell
} from './helpers/product-shell.js';

const LOCALE_KEY = 'focus-tiger.locale.v1';
const GREETING_KEY = 'focus-tiger.locale-greeting.v1';
const PANEL = '#language-preference-panel';
const SIT = '#btn-focus';

/**
 * v1.0.0 English + Japanese: Language UI → 日本語 → back to English; persist preference.
 * Slice A′: ja → palmsTogether; en → magicBookReading (oneshot hard-cut); same-day re-pick skips.
 * Draft locales (zh/es/…) must not appear.
 */
test('Language UI: switch to 日本語 then back to English', async ({ page }) => {
  await openFreshProductShell(page);

  await expect(page.locator(SIT)).toContainText(/Sit with Yin/i);

  // Prefer API open: onboarding bubbles can intercept ⋯ → Language clicks in fresh shells.
  const opened = await page.evaluate(() => {
    const ui = window.__languagePreference;
    if (ui?.openPanel) {
      ui.openPanel();
      return true;
    }
    return false;
  });
  if (!opened) {
    await clickWideMoreProxyOrDirect(page, 'language');
  }
  await expect(page.locator(PANEL)).toBeVisible({ timeout: 8_000 });

  await expect(page.locator('#language-preference-zh')).toHaveCount(0);
  await expect(page.locator('#language-preference-es')).toHaveCount(0);
  await expect(page.locator('#language-preference-de')).toHaveCount(0);

  await page.locator('#language-preference-ja').check();
  // JA character name is 阿寅 (not Latin "Yin") — see CHARACTER_BIBLE / ja.json.
  await expect(page.locator(SIT)).toContainText(/阿寅と坐る/, {
    timeout: 5_000
  });

  const storedJa = await page.evaluate((key) => localStorage.getItem(key), LOCALE_KEY);
  expect(storedJa).toBe('ja');

  await expect
    .poll(async () =>
      page.evaluate(() => window.__sceneAnimationSliceA?.lastLocaleGreeting ?? null)
    )
    .toBe('palmsTogether');

  await page.locator('#language-preference-en').check();
  await expect(page.locator(SIT)).toContainText(/Sit with Yin/i, {
    timeout: 5_000
  });

  const storedEn = await page.evaluate((key) => localStorage.getItem(key), LOCALE_KEY);
  expect(storedEn).toBe('en');

  await expect
    .poll(async () =>
      page.evaluate(() => window.__sceneAnimationSliceA?.lastLocaleGreeting ?? null)
    )
    .toBe('magicBookReading');

  const greetingRaw = await page.evaluate((key) => localStorage.getItem(key), GREETING_KEY);
  expect(greetingRaw).toBeTruthy();
  const greeting = JSON.parse(greetingRaw);
  expect(greeting.locales.sort()).toEqual(['en', 'ja']);

  // Same-day re-pick ja must not replay
  await page.evaluate(() => {
    window.__sceneAnimationSliceA.lastLocaleGreeting = 'probe';
  });
  await page.locator('#language-preference-ja').check();
  await expect(page.locator(SIT)).toContainText(/阿寅と坐る/, { timeout: 5_000 });
  await page.waitForTimeout(300);
  const afterRepeat = await page.evaluate(
    () => window.__sceneAnimationSliceA?.lastLocaleGreeting ?? null
  );
  expect(afterRepeat).toBe('probe');
});
