/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  expectFocusSessionActive,
  openFreshProductShell,
  quickStartFocus,
  riseSkipReflectionToIdle
} from './helpers/product-shell.js';

/**
 * Scene X2 — Idle tap forehead / Yin hit → earWiggleHeadTouch.
 * Preview builds have no `__emotionController` (DEV-only); assert sprite src
 * + hit disarm. One navigation: main path then Rise reflow (avoid 2× goto flake).
 */

async function settleIdleTapReady(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem('focus-tiger.five-moments-compass-seen.v1', '1');
    } catch {
      /* ignore */
    }
    window.__fiveMomentsCompass?.close?.();
  });
  const skip = page.locator('[data-testid="five-moments-compass-skip"]');
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
  await page.waitForFunction(
    () => window.__idleYinTapAnchor?.isArmed?.() === true,
    null,
    { timeout: 20_000 }
  );
}

async function clickHitForehead(page) {
  const hit = page.locator('[data-testid="idle-yin-tap-hit"]');
  await expect(hit).toBeVisible();
  const box = await hit.boundingBox();
  expect(box, 'idle yin tap hit box').toBeTruthy();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.18);
}

async function expectEarWiggleSprite(page) {
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const imgs = document.querySelectorAll('#sprite-stage img');
          return [...imgs]
            .map((img) => img.getAttribute('src') || '')
            .join(' ');
        }),
      { timeout: 8_000 }
    )
    .toMatch(/ear-wiggle-head-touch/);
  await expect
    .poll(
      async () => page.evaluate(() => window.__idleYinTapAnchor?.isArmed?.()),
      { timeout: 3_000 }
    )
    .toBe(false);
}

test('Idle forehead tap plays Yin head-touch and re-arms after Rise', async ({
  page
}) => {
  await openFreshProductShell(page, { query: { flowerWelcome: 0 } });
  await settleIdleTapReady(page);
  await clickHitForehead(page);
  await expectEarWiggleSprite(page);

  await quickStartFocus(page);
  await expectFocusSessionActive(page);
  await riseSkipReflectionToIdle(page);
  await page.waitForFunction(
    () => window.__idleYinTapAnchor?.isArmed?.() === true,
    null,
    { timeout: 20_000 }
  );
  await clickHitForehead(page);
  await expectEarWiggleSprite(page);
});
