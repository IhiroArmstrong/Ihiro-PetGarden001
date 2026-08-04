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
 * Slice A′: ja → bookReading; en → teaDrinking (oneshot + CapCut); same-day re-pick skips.
 * Draft locales (zh/es/…) must not appear.
 */
test('wide Idle: language globe FAB opens preference panel', async ({ page }) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 1100, height: 720 });

  const fab = page.locator('#language-preference-fab');
  await expect(fab).toBeVisible({ timeout: 8_000 });

  const mint = page.locator(
    '.onboarding-hint-badge[data-hint-id="language-preference"]'
  );
  await expect(mint).toBeVisible({ timeout: 10_000 });

  const layout = await page.evaluate(() => {
    const fabEl = document.getElementById('language-preference-fab');
    const help = document.getElementById('onboarding-hint-help');
    const fr = fabEl?.getBoundingClientRect();
    const hr = help?.getBoundingClientRect();
    return {
      fabH: fr?.height ?? 0,
      fabCenterY: fr ? fr.top + fr.height / 2 : null,
      helpCenterY: hr ? hr.top + hr.height / 2 : null
    };
  });
  expect(layout.fabH).toBeGreaterThanOrEqual(60);
  expect(layout.fabCenterY).not.toBeNull();
  expect(layout.helpCenterY).not.toBeNull();
  // Centers level with left-bottom ? (≤20px drift)
  expect(Math.abs(layout.fabCenterY - layout.helpCenterY)).toBeLessThanOrEqual(
    20
  );

  await fab.click();
  await expect(page.locator(PANEL)).toBeVisible({ timeout: 5_000 });
  await page.locator('#language-preference-close').click();
  await expect(page.locator(PANEL)).toBeHidden({ timeout: 5_000 });
});

test('Language UI: switch to 日本語 then back to English', async ({ page }) => {
  await openFreshProductShell(page);

  await expect(page.locator(SIT)).toContainText(/Sit with Yin/i);

  // Prefer globe FAB (wide Idle); fall back to API / ⋯ proxy if FAB hidden.
  const fab = page.locator('#language-preference-fab');
  if (await fab.isVisible().catch(() => false)) {
    await fab.click();
  } else {
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
    .toBe('bookReading');

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
    .toBe('teaDrinking');

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
