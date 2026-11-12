/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test('health log button stays hidden by default on reflection landing', async ({
  page
}) => {
  test.setTimeout(90_000);
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
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 35_000
  });

  const toggle = page.locator('[data-testid=health-shortcut-log-toggle]');
  await expect(toggle).toHaveCount(0);

  const healthBtn = page.locator('[data-testid=health-shortcut-log-button]');
  await expect(healthBtn).toHaveCount(0);
});

test('preferences menu exposes health shortcut row', async ({ page }) => {
  test.setTimeout(90_000);
  await openFreshProductShell(page, {
    path: '/?product=1&flowerWelcome=0'
  });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 35_000
  });
  const more =
    (await page.locator('#ft-wide-more-btn').count()) > 0
      ? page.locator('#ft-wide-more-btn')
      : page.locator('.ft-narrow-grabber');
  await more.click();
  const row = page.locator('[data-testid=idle-health-shortcut-log]');
  await expect(row.first()).toBeVisible({ timeout: 8_000 });
});
