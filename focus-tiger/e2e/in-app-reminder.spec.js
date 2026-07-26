import { test, expect } from '@playwright/test';
import {
  advanceArrivalToCompanionPicker,
  openFreshProductShell
} from './helpers/product-shell.js';

const REMINDER_KEY = 'focus-tiger.reminder-preference.v1';
const TOGGLE = '#reminder-preference-toggle';
const PANEL = '#reminder-preference-panel';
const ENABLED = '#reminder-preference-enabled';
const TIME = '#reminder-preference-time';
const BANNER = '#in-app-reminder-banner';
const DISMISS = '#in-app-reminder-banner-dismiss';

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

test('idle heatmap cluster shows reminder toggle beside heatmap and opens panel', async ({
  page
}) => {
  await openFreshProductShell(page);

  const toggle = page.locator(TOGGLE);
  await expect(toggle).toBeVisible({ timeout: 15_000 });
  const heatmapBox = await page.locator('#weekly-practice-heatmap').boundingBox();
  const toggleBox = await toggle.boundingBox();
  expect(heatmapBox).toBeTruthy();
  expect(toggleBox).toBeTruthy();
  expect(toggleBox.x).toBeGreaterThan((heatmapBox?.x ?? 0) - 60);

  await toggle.click();
  const panel = page.locator(PANEL);
  await expect(panel).toBeVisible();
  await expect(page.locator('#reminder-preference-title')).toContainText(
    /When should I remind you|什么时候提醒你/
  );
  await expect(page.locator('#reminder-preference-daily-blurb')).toContainText(
    /Each day at this time|每天到这个时分/
  );
});

test('enabled past time shows soft note; practiced today note keeps time editable', async ({
  page
}) => {
  await openFreshProductShell(page);
  await expect(page.locator(TOGGLE)).toBeVisible({ timeout: 15_000 });

  await page.evaluate(() => {
    window.__inAppReminder.setNow(new Date(2026, 6, 22, 16, 4, 0));
  });

  await page.locator(TOGGLE).click();
  await page.locator(ENABLED).check();
  await page.locator(TIME).fill('15:00');

  const status = page.locator('#reminder-preference-status');
  await expect(status).toBeVisible();
  await expect(status).toHaveAttribute(
    'data-note',
    'reminder.past_time_note'
  );
  await expect(status).toContainText(
    /already passed today|今天已经过了/
  );
  await expect(page.locator('#reminder-preference-daily-blurb')).toContainText(
    /Each day at this time|每天到这个时分/
  );

  await page.evaluate(() => {
    window.__dailyCompletionStore?.recordCompletion?.(1);
    window.__inAppReminder.sync();
  });
  await expect(status).toHaveAttribute(
    'data-note',
    'reminder.practiced_today_note'
  );
  await expect(status).toContainText(
    /already practiced today|今天已经同坐过了/
  );
  await expect(page.locator(TIME)).toBeEnabled();
});

test('set reminder time → return to foreground → show banner → dismiss → no repeat this page session', async ({
  page
}) => {
  await openFreshProductShell(page);
  await expect(page.locator(TOGGLE)).toBeVisible({ timeout: 15_000 });
  await page.evaluate(() => {
    window.__inAppReminder.setNow(new Date(2026, 6, 22, 8, 0, 0));
    window.__inAppReminder.sync();
  });
  await expect(page.locator(BANNER)).toBeHidden();

  await page.locator(TOGGLE).click();
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
  await page.reload({ waitUntil: 'domcontentloaded' });
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
