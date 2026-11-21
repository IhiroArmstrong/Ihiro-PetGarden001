/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';
import {
  HINT_MINT_RGB,
  isMintDotNotCream,
  isTipPanelMintNotCream,
  parseCssRgb,
  readMuteMintPseudoRgb,
  readTipBubblePanelRgb,
  rgbNear
} from './helpers/hints-visual-guardrail.js';

/**
 * Hints visual guardrail pilot (④).
 * Mechanical catch for tip offset / mint→cream — does NOT replace human QA.
 * @see docs/task-briefs/task-hints-visual-guardrail-pilot.md
 * @see docs/HINTS_WIRING.md §八 ④
 */

test.describe('hints visual guardrail · wide Idle', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  /** L4: How must win over note on fresh Idle — mark How resting before ambient mint checks. */
  async function unlockAmbientDiscoveryPulse(page) {
    await page.evaluate(() => {
      const ui = window.__onboardingHints;
      ui?.store?.markResting?.('how-shall-we-sit');
      const ids = [
        'sit-button',
        'how-shall-we-sit',
        'ambient-soundscape',
        'focus-hud-ring',
        'focus-hud-progress',
        'focus-hud-streak',
        'help-affordance'
      ];
      ui?.syncVisibleAutos?.(ids);
      ui?.syncDiscoveryDots?.();
    });
  }

  test('L4: fresh idle paints at most one discovery pulse (How wins)', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await page.evaluate(() => {
      window.__onboardingHints?.store?.clear?.();
      const ids = [
        'sit-button',
        'how-shall-we-sit',
        'ambient-soundscape',
        'help-affordance'
      ];
      window.__onboardingHints?.syncVisibleAutos?.(ids);
      window.__onboardingHints?.syncDiscoveryDots?.();
    });
    const total = await page.evaluate(() => {
      const floating = document.querySelectorAll(
        '.onboarding-hint-badge:not([hidden])'
      ).length;
      const hostMint = document.querySelectorAll('.has-hint-mint').length;
      const menuDots = document.querySelectorAll(
        '.ft-secondary-menu-hint-dot'
      ).length;
      return floating + hostMint + menuDots;
    });
    expect(total).toBeLessThanOrEqual(1);
    await unlockAmbientDiscoveryPulse(page);
    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            Boolean(
              document
                .querySelector('.ambient-soundscape__mute')
                ?.classList.contains('has-hint-mint')
            )
          ),
        { timeout: 8_000 }
      )
      .toBe(true);
  });

  test('note mint ::after stays product mint (not cream)', async ({ page }) => {
    await openFreshProductShell(page);
    await unlockAmbientDiscoveryPulse(page);

    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            Boolean(
              document
                .querySelector('.ambient-soundscape__mute')
                ?.classList.contains('has-hint-mint')
            )
          ),
        { timeout: 8_000 }
      )
      .toBe(true);

    const sample = await readMuteMintPseudoRgb(page);
    expect(sample, 'mute mint ::after present').not.toBeNull();
    expect(sample.content, '::after has content').not.toBe('none');
    expect(sample.rgb, `parseable mint color (${sample.css})`).not.toBeNull();
    expect(
      rgbNear(sample.rgb, HINT_MINT_RGB, 18),
      `mint near #6db3a0, got ${JSON.stringify(sample.rgb)}`
    ).toBe(true);
    expect(isMintDotNotCream(sample.rgb)).toBe(true);
  });

  test('? click shows purpose only — no sit tip spray', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await page.locator('#onboarding-hint-help').click();

    await expect(page.locator('#onboarding-app-purpose:not([hidden])')).toBeVisible({
      timeout: 8_000
    });
    await expect(
      page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"]')
    ).toHaveCount(0);
  });

  test('mute mint host hover still expands ambient tip (pulse path)', async ({
    page
  }) => {
    await openFreshProductShell(page);

    const mute = page.locator('.ambient-soundscape__mute');
    await expect(mute).toBeVisible({ timeout: 8_000 });
    // Force unread mint if cold shell already peeked.
    await page.evaluate(() => {
      window.__onboardingHints?.store?.clear?.();
    });
    await unlockAmbientDiscoveryPulse(page);
    await expect(mute).toHaveClass(/has-hint-mint/, { timeout: 5_000 });
    await mute.hover();
    const tip = page.locator(
      'ft-onboarding-hint-bubble[data-hint-id="ambient-soundscape"]'
    );
    await expect(tip).toBeVisible({ timeout: 5_000 });

    const panel = await readTipBubblePanelRgb(page, 'ambient-soundscape');
    expect(panel, 'tip panel styles').not.toBeNull();
    const panelRgb = panel.rgb || parseCssRgb(panel.backgroundColor);
    expect(panelRgb, `tip fill parseable (${panel.backgroundImage})`).not.toBeNull();
    expect(
      isTipPanelMintNotCream(panelRgb),
      `tip panel mint-ish, not cream help-button; got ${JSON.stringify(panelRgb)}`
    ).toBe(true);
  });

  test('? hover/click never opens help-affordance tip bubble', async ({
    page
  }) => {
    await openFreshProductShell(page);

    await page.locator('#onboarding-hint-help').hover();
    await expect(page.locator('#onboarding-app-purpose:not([hidden])')).toBeVisible({
      timeout: 5_000
    });
    await expect(
      page.locator('ft-onboarding-hint-bubble[data-hint-id="help-affordance"]')
    ).toHaveCount(0);
  });
});

test.describe('hints visual guardrail · narrow Idle', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('375 ? click shows purpose only (no sit tip spray)', async ({ page }) => {
    await openFreshProductShell(page);
    await page.locator('#ft-narrow-help-btn').click();

    await expect(page.locator('#onboarding-app-purpose:not([hidden])')).toBeVisible({
      timeout: 8_000
    });
    await expect(
      page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"]')
    ).toHaveCount(0);
  });
});
