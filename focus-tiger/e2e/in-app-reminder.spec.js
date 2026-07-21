import { test, expect } from '@playwright/test';
import {
  advanceArrivalToCompanionPicker,
  expectFocusSessionActive,
  openFreshProductShell,
  selectCompanionMode
} from './helpers/product-shell.js';

const REMINDER_KEY = 'focus-tiger.reminder-preference.v1';
const TOGGLE = '#reminder-preference-toggle';
const PANEL = '#reminder-preference-panel';
const ENABLED = '#reminder-preference-enabled';
const TIME = '#reminder-preference-time';
const BANNER = '#in-app-reminder-banner';
const DISMISS = '#in-app-reminder-banner-dismiss';

test('top-right reminder toggle (next to ambient mute) opens panel with setting title', async ({
  page
}) => {
  await openFreshProductShell(page);

  const toggle = page.locator(TOGGLE);
  await expect(toggle).toBeVisible({ timeout: 15_000 });
  // 方案 A：右上角，与 ambient 静音钮（right:14px）同排，本钮 right:66px
  await expect(page.locator('#reminder-preference')).toHaveCSS(
    'position',
    'fixed'
  );

  await toggle.click();
  const panel = page.locator(PANEL);
  await expect(panel).toBeVisible();
  await expect(page.locator('#reminder-preference-title')).toContainText(
    /When should I remind you|什么时候提醒你/
  );
});

test('dismiss banner via __inAppReminder stays hidden this page session (no repeat)', async ({
  page
}) => {
  await openFreshProductShell(page);
  await expect(page.locator(TOGGLE)).toBeVisible({ timeout: 15_000 });

  // 无 enabled 字段：有值即代表已开启
  await page.evaluate((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ hour: 9, minute: 0 }));
  }, REMINDER_KEY);

  await page.evaluate(() => {
    window.__inAppReminder.setNow(new Date(2026, 6, 22, 18, 0, 0));
    window.__inAppReminder.sync();
  });

  const banner = page.locator(BANNER);
  await expect(banner).toBeVisible({ timeout: 5_000 });
  await expect(banner).toContainText(/Yin is waiting|阿寅在等你/);

  await page.locator(DISMISS).click();
  await expect(banner).toBeHidden({ timeout: 3_000 });

  // 再次 sync（候选仍满足）仍不应再展示：本页会话内已关闭
  await page.evaluate(() => window.__inAppReminder.sync());
  await expect(banner).toBeHidden();

  // visibilitychange 回前台再评也不应再展示
  await page.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.__inAppReminder.sync();
  });
  await expect(banner).toBeHidden();
});

test('banner hides while Focusing (suppress busy policy)', async ({ page }) => {
  await openFreshProductShell(page);

  await page.evaluate((storageKey) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ hour: 0, minute: 0 })
    );
  }, REMINDER_KEY);
  await page.reload();
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 60_000 });

  await page.evaluate(() => {
    window.__inAppReminder?.setNow?.(new Date(2026, 6, 22, 18, 0, 0));
    window.__inAppReminder?.sync?.();
  });
  await expect(page.locator(BANNER)).toBeVisible({ timeout: 10_000 });

  await advanceArrivalToCompanionPicker(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expectFocusSessionActive(page);

  await expect(page.locator(BANNER)).toBeHidden();
});
