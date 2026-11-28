/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * 11/27 original sentences · ticket 2 (click must see within 1s).
 * Rows: 1 collections empty frame · 4 memory-rail two menus ·
 * 11 Continue lands on Pause · 21 leave-trace (unit + this shell).
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import { openFreshProductShell } from './helpers/product-shell.js';

test.use({ viewport: { width: 1280, height: 900 } });

async function readyIdle(page) {
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);
}

test('row 1: collections open with a filled inner frame, not a blank box', async ({
  page
}) => {
  await readyIdle(page);
  const enter = page.locator('[data-testid=ft-home-memorabilia-enter]');
  await expect(enter).toBeVisible({ timeout: 15_000 });
  await enter.click();
  const panel = page.locator('#yin-coin-panel');
  await expect(panel).toBeVisible({ timeout: 1_000 });
  await expect(panel).toHaveClass(/is-visible/);
  const title = page.locator('#yin-coin-panel-title');
  await expect(title).toBeVisible({ timeout: 1_000 });
  await expect(title).not.toBeEmpty();
  const scroll = page.locator('#yin-coin-panel .yin-coin-panel__scroll');
  const box = await scroll.boundingBox();
  expect(box, '收藏一点开还是空白框').toBeTruthy();
  expect(box.height).toBeGreaterThan(80);
});

test('row 4: memory rail opens one group list, not two menus', async ({
  page
}) => {
  await readyIdle(page);
  await page.locator('[data-testid=ft-home-preview-inspiration]').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible({ timeout: 1_000 });
  // List-only sheet titles the group; it does not duplicate a section header.
  await expect(
    menu.locator('.ft-wide-more__section[data-group="MENU_GROUP_INSPIRATION"]')
  ).toBeVisible();
  await expect(menu.locator('[data-proxy="art-collection"]')).toBeVisible();
  await expect(page.locator('#ft-wide-more-radial')).toBeHidden();
});

test('row 11: typing then Continue stays on noticing, not sit Pause', async ({
  page
}) => {
  await readyIdle(page);
  await page.locator('#ft-wide-more-btn').click();
  await page
    .locator(
      '#ft-wide-more-radial .ft-wide-more-radial__icon[data-group="MENU_GROUP_PRACTICE"]'
    )
    .click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu.locator('[data-proxy="daily-noticing"]')).toBeVisible();
  await menu.locator('[data-proxy="daily-noticing"]').click();
  await expect(page.locator('[data-testid="daily-noticing-card"]')).toBeVisible({
    timeout: 3_000
  });
  await page.locator('[data-testid="daily-noticing-input"]').fill('A quiet desk.');
  await page.locator('[data-testid="daily-noticing-continue"]').click();
  await expect(page.locator('[data-testid="daily-noticing-closing"]')).toBeVisible(
    { timeout: 1_000 }
  );
  // Pause exists in the sit HUD DOM; the bug is landing on it as the visible screen.
  await expect(page.locator('[data-testid="focus-sit-pause"]')).toBeHidden();
  await expect(page.locator('[data-testid="focus-sit-adjust"]')).toBeHidden();
});
