/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';
import { applyScenarioResetOnPage } from './helpers/scenario-reset.js';

/**
 * Phase 2c · Day1 / 久别吹花门闩（DOM）。
 * 不锁序列观感 / CapCut 像素；锁冷启动气泡出现与失败门闩（同日配额、flag off）。
 */

test('Day1 cold start shows flower welcome bubble', async ({ page }) => {
  await openFreshProductShell(page);
  await expect(page.locator('#flower-blow-welcome-bubble')).toBeVisible({
    timeout: 12_000
  });
});

test('flower blow plays out after the bubble leaves; goal card waits', async ({
  page
}) => {
  await openFreshProductShell(page);
  const bubble = page.locator('#flower-blow-welcome-bubble');
  const goalCard = page.locator('#cold-start-goal-card');
  const currentFrameSrc = () =>
    page.evaluate(() => {
      const imgs = document.querySelectorAll('#sprite-stage img');
      return imgs[imgs.length - 1]?.getAttribute('src') || '';
    });

  await expect(bubble).toBeVisible({ timeout: 12_000 });
  // 文案先走（hold + fade ≈ 3.6s），吹花序列（65 帧 @10fps ≈ 6.5s）还没播完。
  await expect(bubble).toHaveCount(0, { timeout: 12_000 });

  // 气泡走 ≠ 第一幕演完：吹散尾段不得被叠化回 idle，毛玻璃卡也不得压上来。
  expect(await currentFrameSrc()).toContain('conjure-flowers-blow-away');
  await expect(goalCard).toBeHidden();

  // 序列自己播完 → 溶回打坐基底，四选卡才允许出。
  await expect
    .poll(currentFrameSrc, { timeout: 20_000 })
    .toContain('idle-breathing');
  await expect(goalCard).toBeVisible({ timeout: 20_000 });
});

test('same-day reload does not show flower bubble again', async ({ page }) => {
  await openFreshProductShell(page);
  await expect(page.locator('#flower-blow-welcome-bubble')).toBeVisible({
    timeout: 12_000
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 35_000
  });
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 15_000 });
  // Welcome daily quota + lastOpen already set — no second flower/bubble.
  await page.waitForTimeout(1500);
  await expect(page.locator('#flower-blow-welcome-bubble')).toHaveCount(0);
});

test('flowerWelcome=0 never shows flower bubble on Day1', async ({ page }) => {
  await openFreshProductShell(page, { query: { flowerWelcome: 0 } });
  await page.waitForTimeout(1500);
  await expect(page.locator('#flower-blow-welcome-bubble')).toHaveCount(0);
});

test('welcome quota blocks flower even if Day1 force would apply', async ({
  page
}) => {
  await openFreshProductShell(page);
  await expect(page.locator('#flower-blow-welcome-bubble')).toBeVisible({
    timeout: 12_000
  });
  // Burned welcome quota stays; official negative recipe (flower keys only).
  await applyScenarioResetOnPage(page, 'welcome-quota-blocks-flower');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 35_000
  });
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1500);
  await expect(page.locator('#flower-blow-welcome-bubble')).toHaveCount(0);
  // Occupancy must not stay on FLOWER when broadcast never started.
  const frameSrc = await page.evaluate(() => {
    const imgs = document.querySelectorAll('#sprite-stage img');
    return imgs[imgs.length - 1]?.getAttribute('src') || '';
  });
  expect(frameSrc).toContain('idle-breathing');
});
