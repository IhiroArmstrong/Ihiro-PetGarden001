import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';
import {
  HINT_MINT_RGB,
  isMintDotNotCream,
  isTipPanelMintNotCream,
  measureTipVsAnchor,
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

  test('note mint ::after stays product mint (not cream)', async ({ page }) => {
    await openFreshProductShell(page);

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

  test('sit tip: above Sit, mint panel, soft screenshot (no Yin)', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await page.locator('#onboarding-hint-help').click();

    const tip = page.locator(
      'ft-onboarding-hint-bubble[data-hint-id="sit-button"]'
    );
    await expect(tip).toBeVisible({ timeout: 8_000 });

    // Wide home Sit ball is the on-screen anchor; #btn-focus may be park-proxy.
    const sitAnchor = (await page.locator('#ft-wide-home-sit').isVisible())
      ? '#ft-wide-home-sit'
      : '#btn-focus';
    const geo = await measureTipVsAnchor(page, 'sit-button', sitAnchor);
    expect(geo, `sit tip + ${sitAnchor} measurable`).not.toBeNull();
    expect(geo.tip.bottom, 'tip sits above Sit control').toBeLessThanOrEqual(
      geo.anchor.top + 48
    );
    expect(geo.midYDelta, 'vertically related to Sit').toBeLessThan(240);

    const panel = await readTipBubblePanelRgb(page, 'sit-button');
    expect(panel, 'tip panel styles').not.toBeNull();
    const panelRgb = panel.rgb || parseCssRgb(panel.backgroundColor);
    expect(panelRgb, `tip fill parseable (${panel.backgroundImage})`).not.toBeNull();
    expect(
      isTipPanelMintNotCream(panelRgb),
      `tip panel mint-ish, not cream help-button; got ${JSON.stringify(panelRgb)}`
    ).toBe(true);

    // Soft PNG is platform-specific (font AA). CI stays on RGB+geometry until
    // linux baselines are committed (opt-in: FT_HINTS_SOFT_SNAP=1).
    if (!process.env.CI || process.env.FT_HINTS_SOFT_SNAP === '1') {
      await expect(tip).toHaveScreenshot('sit-button-tip-wide.png', {
        animations: 'disabled',
        maxDiffPixelRatio: 0.04
      });
    }
  });

  test('help-affordance tip sits to the right of ? when badge opens it', async ({
    page
  }) => {
    await openFreshProductShell(page);

    const helpTip = page.locator(
      'ft-onboarding-hint-bubble[data-hint-id="help-affordance"]'
    );
    const badge = page.locator(
      '.onboarding-hint-badge[data-hint-id="help-affordance"]'
    );

    if (!(await badge.isVisible().catch(() => false))) {
      test.skip(true, 'help-affordance mint badge not on cold Idle (already seen / exclusive)');
    }

    // click tier: hover/focus opens preview (same as mute mint host).
    await badge.hover();
    await expect(helpTip).toBeVisible({ timeout: 5_000 });

    const geo = await measureTipVsAnchor(
      page,
      'help-affordance',
      '#onboarding-hint-help'
    );
    expect(geo).not.toBeNull();
    expect(geo.tip.left).toBeGreaterThan(geo.anchor.right - 8);
    expect(geo.gapX).toBeLessThan(80);
    expect(geo.midYDelta).toBeLessThan(80);
  });
});

test.describe('hints visual guardrail · narrow Idle', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('375 sit tip soft snapshot (ActionBar remap path)', async ({ page }) => {
    await openFreshProductShell(page);
    await page.locator('#ft-narrow-help-btn').click();

    const tip = page.locator(
      'ft-onboarding-hint-bubble[data-hint-id="sit-button"]'
    );
    await expect(tip).toBeVisible({ timeout: 8_000 });

    const panel = await readTipBubblePanelRgb(page, 'sit-button');
    expect(panel).not.toBeNull();
    const rgb = panel.rgb || parseCssRgb(panel.backgroundColor);
    expect(rgb).not.toBeNull();
    expect(isTipPanelMintNotCream(rgb)).toBe(true);

    if (!process.env.CI || process.env.FT_HINTS_SOFT_SNAP === '1') {
      await expect(tip).toHaveScreenshot('sit-button-tip-narrow-375.png', {
        animations: 'disabled',
        maxDiffPixelRatio: 0.05
      });
    }
  });
});
