/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

const ARRIVAL = '#arrival-practice';
const TOAST = '[data-testid="practice-deep-link-toast"]';

/**
 * Helper wipe runs after earlier addInitScript. Register seen keys *after*
 * the first shell open, then reload with the practice query so keys stick.
 * @param {import('@playwright/test').Page} page
 * @param {string} search
 */
async function openReturningDeepLink(page, search) {
  await openFreshProductShell(page, {
    path: '/?product=1&sessionMinutes=1&flowerWelcome=0'
  });
  await page.addInitScript(() => {
    try {
      localStorage.setItem('focus-tiger.cold-start-goal-seen.v1', '1');
      localStorage.setItem('focus-tiger.five-moments-compass-seen.v1', '1');
      localStorage.setItem('focus-tiger.wellness-disclaimer-seen.v1', '1');
    } catch {
      /* ignore */
    }
  });
  const url = new URL(page.url());
  url.search = search;
  await page.goto(url.toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 30_000
  });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 35_000
  });
}

test('legal Web Sit query starts Arrival within 1s of ready', async ({ page }) => {
  test.setTimeout(90_000);
  await openReturningDeepLink(
    page,
    '?product=1&sessionMinutes=1&start=sit&min=5&flowerWelcome=0'
  );
  await expect(page.locator(ARRIVAL)).toBeVisible({ timeout: 8_000 });
  await expect(
    page
      .locator(ARRIVAL)
      .getByRole('button', { name: /Calm|平静|Not Sure|不确定/i })
      .first()
  ).toBeVisible({ timeout: 8_000 });
});

test('unknown start is discarded: no Arrival, discard toast', async ({ page }) => {
  test.setTimeout(90_000);
  await openReturningDeepLink(
    page,
    '?product=1&sessionMinutes=1&start=hack&min=5&flowerWelcome=0'
  );
  await expect(page.locator(ARRIVAL)).toBeHidden();
  await expect(page.locator(TOAST)).toBeVisible({ timeout: 8_000 });
  await expect(page.locator(TOAST)).toContainText(/isn't used|用不上|使いません/i);
});
