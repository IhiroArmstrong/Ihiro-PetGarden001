import { test, expect } from '@playwright/test';
import {
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
  await expect(page.locator(PANEL)).toBeVisible({ timeout: 10_000 });
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

test('idle: reminder entry opens panel with daily blurb (wide ⋯ or direct)', async ({
  page
}) => {
  await openFreshProductShell(page);

  // Wide Idle parks the clock off-canvas; entry is via ⋯. Toggle still in DOM.
  await expect(page.locator(TOGGLE)).toBeAttached({ timeout: 15_000 });
  await openReminderPanel(page);

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
  await expect(page.locator(TOGGLE)).toBeAttached({ timeout: 15_000 });

  await page.evaluate(() => {
    window.__inAppReminder.setNow(new Date(2026, 6, 22, 16, 4, 0));
  });

  await openReminderPanel(page);
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
    window.__inAppReminder?.sync?.();
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
  await expect(page.locator(BANNER)).toBeHidden();

  await openReminderPanel(page);
  await page.locator(ENABLED).check();
  await page.locator(TIME).fill('09:00');

  const stored = await page.evaluate((key) => localStorage.getItem(key), REMINDER_KEY);
  if (!stored) {
    throw new Error('reminder preference not stored from UI');
  }

  await page.locator('body').click({ position: { x: 8, y: 8 } });
  await expect(page.locator(PANEL)).toBeHidden();

  await page.evaluate(() => {
    window.__inAppReminder.setNow(new Date(2026, 6, 22, 16, 4, 0));
  });
  await simulateReturnToForeground(page);
  await expect(page.locator(BANNER)).toBeVisible({ timeout: 10_000 });

  await page.locator(DISMISS).click();
  await expect(page.locator(BANNER)).toBeHidden();
  await simulateReturnToForeground(page);
  await expect(page.locator(BANNER)).toBeHidden();
});

test('banner hides while Focusing (suppress busy policy)', async ({ page }) => {
  await openFreshProductShell(page);
  await openReminderPanel(page);
  await page.locator(ENABLED).check();
  await page.locator(TIME).fill('09:00');
  await page.locator('body').click({ position: { x: 8, y: 8 } });

  await page.evaluate(() => {
    window.__inAppReminder.setNow(new Date(2026, 6, 22, 16, 4, 0));
  });
  await simulateReturnToForeground(page);
  await expect(page.locator(BANNER)).toBeVisible({ timeout: 10_000 });

  await page.locator('#quick-start-focus').click();
  await expect(page.locator('#hud-state')).toContainText(/Focusing|专注/, {
    timeout: 15_000
  });
  await expect(page.locator(BANNER)).toBeHidden();
});
