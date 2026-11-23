/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  expandWideMoreMenuGroup,
  openFreshProductShell,
  openWideMoreMenuIfPresent
} from './helpers/product-shell.js';

test.use({ viewport: { width: 1280, height: 900 } });

test('Preferences shows co-practice contract surface', async ({ page }) => {
  await openFreshProductShell(page);
  const opened = await openWideMoreMenuIfPresent(page);
  expect(opened, 'wide ⋯ must be available').toBe(true);
  await expandWideMoreMenuGroup(page, 'MENU_GROUP_PREFERENCES');
  await page.getByTestId('idle-co-practice-contract').click();
  const contract = page.getByTestId('co-practice-contract');
  await expect(contract).toBeVisible({ timeout: 5_000 });
  await expect(contract).toContainText(/How Yin may speak|阿寅可能在哪里开口|阿寅が声をかける/);
  await expect(page.getByTestId('yin-adaptation-toggle')).toBeVisible();
  await expect(page.getByTestId('practice-paper-evening-consent')).toBeVisible();
});

test('Growth Journey detail omits co-practice contract surface', async ({ page }) => {
  await openFreshProductShell(page);
  await page.getByTestId('growth-journey-home-line').click();
  const detail = page.getByTestId('growth-journey-detail');
  await expect(detail).toBeVisible({
    timeout: 5_000
  });
  await expect(detail.getByTestId('co-practice-contract')).toHaveCount(0);
  await expect(detail.getByTestId('yin-adaptation-toggle')).toHaveCount(0);
  await expect(detail.getByTestId('practice-paper-evening-consent')).toHaveCount(0);
});
