import { test, expect } from '@playwright/test';
import {
  advanceArrivalToCompanionPicker,
  clickWideMoreProxyOrDirect,
  openFreshProductShell
} from './helpers/product-shell.js';

const REMINDER_KEY = 'focus-tiger.reminder-preference.v1';
const TOGGLE = '#reminder-preference-toggle';
const PANEL = '#reminder-preference-panel';
const ENABLED = '#reminder-preference-enabled';
const TIME = '#reminder-preference-time';
const BANNER = '#in-app-reminder-banner';
const DISMISS = '#in-app-reminder-banner-dismiss';

async function openReminderPanel(page) {
  await clickWideMoreProxyOrDirect(page, 'reminder');
  await expect(page.locator(PANEL)).toBeVisible({ timeout: 5_000 });
}

async function simulateReturnToForeground(page) {
  await page.evaluate(() => {
    let state = 'hidden';
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => state
    });
    document.dispatchEvent(new Event('visibilitychange'));
    state = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

test('idle heatmap stays; reminder opens via wide ⋯ (or direct toggle on narrow)', async ({
  page
}) => {
  await openFreshProductShell(page);

  await expect(page.locator('#weekly-practice-heatmap')).toBeVisible({
    timeout: 15_000
  });
  // Toggle remains in DOM (parked on wide Idle ≥480)
  await expect(page.locator(TOGGLE)).toBeAttached();

  await openReminderPanel(page);
  await expect(page.locator('#reminder-preference-title')).toContainText(
    /When should I remind you|什么时候提醒你/
  );
  await page.locator(ENABLED).check();
  await expect(page.locator('#reminder-preference-help')).toBeVisible();
  await expect(page.locator('#reminder-preference-help')).toContainText(
    /When this time arrives|到点且今天还没练习/
  );
});

test('set reminder time → return to foreground → show banner → dismiss → no repeat this page session', async ({
  page
}) => {
  await openFreshProductShell(page);
  await expect(page.locator(TOGGLE)).toBeAttached({ timeout: 15_000 });
  await page.evaluate(() => {
    window.__inAppReminder.setNow(new Date(2026, 6, 22, 8, 0, 0));
    window.__inAppReminder.sync();
  });
  await expect(page.locator(BANNER)).toBeHidden();

  await openReminderPanel(page);
  await page.locator(ENABLED).check();
  await page.locator(TIME).fill('09:00');

  await page.evaluate((storageKey) => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!stored || stored.hour !== 9 || stored.minute !== 0) {
      throw new Error('reminder preference not stored from UI');
    }
  }, REMINDER_KEY);

  await page.evaluate(() => {
    window.__inAppReminder.setNow(new Date(2026, 6, 22, 18, 0, 0));
  });

  await simulateReturnToForeground(page);

  const banner = page.locator(BANNER);
  await expect(banner).toBeVisible({ timeout: 5_000 });
  await expect(banner).toContainText(
    /Yin is right here when you're ready\.|你准备好了，阿寅就在这儿。/
  );

  await page.locator(DISMISS).click();
  await expect(banner).toBeHidden({ timeout: 3_000 });

  // 再次 sync（候选仍满足）仍不应再展示：本页会话内已关闭
  await page.evaluate(() => window.__inAppReminder.sync());
  await expect(banner).toBeHidden();

  await simulateReturnToForeground(page);
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
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i);
  await expect(page.locator('#hud-state')).toContainText(/Focusing|专注/i);

  await expect(page.locator(BANNER)).toBeHidden();
});
