/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  openFreshProductShell,
  quickStartFocus
} from './helpers/product-shell.js';

test('wide Focusing: ⋯ edge-recall opens menu', async ({ page }) => {
  await openFreshProductShell(page);
  await quickStartFocus(page);
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 15_000
  });
  const more = page.locator('#ft-wide-more-btn');
  await expect(more).toBeAttached();
  await expect(more).not.toBeVisible();
  const box = await more.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(more).toBeVisible({ timeout: 1_500 });
  await more.click({ force: true });
  await expect(
    page.locator(
      '#ft-wide-more-radial:not([hidden]), #ft-wide-more-menu:not([hidden])'
    )
  ).toBeVisible({ timeout: 5_000 });
});

test('375 Focusing: home balls hidden; grabber edge-recall opens drawer', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await quickStartFocus(page);
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 15_000
  });
  await expect(page.locator('#ft-narrow-home-ctas')).toBeHidden();
  const grabber = page.locator('.ft-narrow-grabber');
  await expect(grabber).toBeAttached();
  const box = await grabber.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await grabber.click({ force: true });
  await expect(page.locator('#ft-narrow-options-drawer')).toBeVisible({
    timeout: 5_000
  });
});
