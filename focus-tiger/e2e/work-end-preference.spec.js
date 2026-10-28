/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import {
  clickWideMoreProxyOrDirect,
  openFreshProductShell
} from './helpers/product-shell.js';

test.use({ viewport: { width: 1280, height: 720 } });

const PREF_KEY = 'focus-tiger.work-end-preference.v1';
const PANEL = '#work-end-preference-panel';
const ENABLED = '#work-end-preference-enabled';
const TIME = '#work-end-preference-time';

async function openIdleForWorkEndTests(page, opts) {
  await openFreshProductShell(page, opts);
  await dismissColdStartOverlay(page);
}

test('idle: ⋯ wrap-up time opens panel and saves locally (T61 §2)', async ({
  page
}) => {
  await openIdleForWorkEndTests(page);

  await expect(
    page.locator('[data-testid="idle-work-end"]')
  ).toBeVisible({ timeout: 15_000 });

  await clickWideMoreProxyOrDirect(page, 'work-end');
  await expect(page.locator(PANEL)).toBeVisible({ timeout: 10_000 });

  await expect(page.locator('#work-end-preference-title')).toContainText(
    /Wrap-up time|收工时间|切り上げ/
  );
  await expect(page.locator('#work-end-preference-daily-blurb')).toContainText(
    /sleep coach|睡眠|アドバイス/
  );

  await page.locator(ENABLED).check();
  await page.locator(TIME).fill('21:30');
  await page.locator('#work-end-preference-confirm').click();
  await expect(page.locator('#work-end-preference-saved')).toBeVisible();
  await expect(page.locator('#work-end-preference-saved')).toContainText(
    /Saved|已保存|保存/
  );

  const stored = await page.evaluate(
    (key) => globalThis.localStorage.getItem(key),
    PREF_KEY
  );
  expect(stored).toContain('21');
  expect(stored).toContain('30');
});
