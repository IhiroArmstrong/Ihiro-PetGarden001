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
 * Locks product-shell wiring (testid + viewport forehead). Not sequence pixels.
 */

async function settleIdleTapReady(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem('focus-tiger.five-moments-compass-seen.v1', '1');
    } catch {
      /* ignore */
    }
    const compass = window.__fiveMomentsCompass;
    compass?.close?.();
    window.__emotionController?.playEmotion?.('idle', { restart: true });
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

test('Idle forehead tap plays Yin head-touch', async ({ page }) => {
  await openFreshProductShell(page, { query: { flowerWelcome: 0 } });
  await settleIdleTapReady(page);

  const hit = page.locator('[data-testid="idle-yin-tap-hit"]');
  await expect(hit).toBeVisible();

  const viewport = page.viewportSize();
  expect(viewport).toBeTruthy();
  await page.mouse.click(viewport.width * 0.5, viewport.height * 0.26);

  await expect
    .poll(
      async () =>
        page.evaluate(() => window.__emotionController?.getCurrentEmotionKey?.()),
      { timeout: 8_000 }
    )
    .toBe('earWiggleHeadTouch');
});

test('Idle tap re-arms after Rise → Reflection skip (reflow)', async ({
  page
}) => {
  await openFreshProductShell(page, { query: { flowerWelcome: 0 } });
  await settleIdleTapReady(page);
  await quickStartFocus(page);
  await expectFocusSessionActive(page);
  await riseSkipReflectionToIdle(page);
  await page.waitForFunction(
    () => window.__idleYinTapAnchor?.isArmed?.() === true,
    null,
    { timeout: 20_000 }
  );

  await page.locator('[data-testid="idle-yin-tap-hit"]').click();
  await expect
    .poll(
      async () =>
        page.evaluate(() => window.__emotionController?.getCurrentEmotionKey?.()),
      { timeout: 8_000 }
    )
    .toBe('earWiggleHeadTouch');
});
