/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  openFreshProductShell,
  quickStartFocus,
  riseSkipReflectionToIdle
} from './helpers/product-shell.js';

/**
 * Product-path MilestoneGlow: projected streak-7 → play once; no second claim.
 * Human QA uses the same `?qaSeedStreak=6` boot seed (see `qaPracticeSeed.js`).
 */

test.describe('MilestoneGlow product path', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('streak-7 completion claims MilestoneGlow once', async ({ page }) => {
    await openFreshProductShell(page, {
      query: { sessionMinutes: 1, qaSeedStreak: 6 }
    });
    await expect
      .poll(
        async () =>
          page.evaluate(
            () => window.__practiceDaysStore?.getPracticedDateKeys?.().length ?? 0
          ),
        { timeout: 10_000 }
      )
      .toBeGreaterThanOrEqual(6);

    const peek = await page.evaluate(() =>
      window.__milestoneGlowStore.peekOffer(7)
    );
    expect(peek).toBe('streak-7');

    await quickStartFocus(page);

    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            window.__milestoneGlowStore.getPlayedIds().has('streak-7')
          ),
        { timeout: 90_000 }
      )
      .toBe(true);

    // Wait for glow → Reflection / Idle, then a second focus must not re-claim.
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const r = document.getElementById('tiger-reflection-moment');
            const btn = document.getElementById('btn-focus');
            const reflectionOpen = Boolean(r && !r.hidden);
            const sit =
              btn && /Sit with Yin|与阿寅同坐/i.test(btn.textContent || '');
            return reflectionOpen || sit;
          }),
        { timeout: 30_000 }
      )
      .toBe(true);

    const reflection = page.locator('#tiger-reflection-moment');
    if (await reflection.isVisible().catch(() => false)) {
      await page.keyboard.press('Escape');
      await expect(reflection).toHaveCount(0).catch(async () => {
        await riseSkipReflectionToIdle(page).catch(() => {});
      });
    }

    await quickStartFocus(page);
    await page.waitForTimeout(1500);
    const claims = await page.evaluate(
      () =>
        [...window.__milestoneGlowStore.getPlayedIds()].filter(
          (id) => id === 'streak-7'
        ).length
    );
    expect(claims).toBe(1);
  });
});
