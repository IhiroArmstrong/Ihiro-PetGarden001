import { test, expect } from '@playwright/test';
import {
  openFreshProductShell,
  quickStartFocus,
  riseSkipReflectionToIdle
} from './helpers/product-shell.js';

/**
 * '?' 补救契约：本页**此刻可见**的控件，点 ? 立刻各出一条 tip；
 * 只有藏在 ⋯ / 抽屉里的 chrome 才折进「更多提示」芯片（一次性，无「N more」）。
 * 薄荷绿音符点：只有**选曲**才清；Rise / 会话结束不得清。
 *
 * @see docs/ONBOARDING_HINTS.md、docs/TEST_TRACKER.md
 */

/** @param {import('@playwright/test').Page} page */
function visibleRemedyIds(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('ft-onboarding-hint-bubble[data-remedy="1"]')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map((el) => el.getAttribute('data-hint-id'))
  );
}

/** @param {import('@playwright/test').Page} page */
function catalogChipText(page) {
  return page.evaluate(() => {
    const chip = document.getElementById('ft-hint-catalog-chip');
    return chip && !chip.hidden ? chip.textContent || '' : null;
  });
}

test.describe('wide ? remedy', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('weekly chart tip appears immediately, anchored at the chart', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await expect(page.locator('#weekly-practice-heatmap')).toBeVisible();

    await page.locator('#onboarding-hint-help').click();

    const weeklyTip = page.locator(
      'ft-onboarding-hint-bubble[data-hint-id="weekly-heatmap"][data-remedy="1"]'
    );
    await expect(weeklyTip).toBeVisible({ timeout: 8_000 });

    // Tail must sit near the chart, not near ⋯ (the parked-chrome remap target).
    const near = await page.evaluate(() => {
      const tip = document.querySelector(
        'ft-onboarding-hint-bubble[data-hint-id="weekly-heatmap"]'
      );
      const chart = document.getElementById('weekly-practice-heatmap');
      const more = document.getElementById('ft-wide-more-btn');
      if (!tip || !chart || !more) return null;
      const centre = (el) => {
        const r = el.getBoundingClientRect();
        return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
      };
      const t = centre(tip);
      const c = centre(chart);
      const m = centre(more);
      const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
      return { toChart: dist(t, c), toMore: dist(t, m) };
    });
    expect(near).not.toBeNull();
    expect(near.toChart).toBeLessThan(near.toMore);
  });

  test('on-screen controls all get a tip; only ⋯ chrome stays folded', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await page.locator('#onboarding-hint-help').click();
    await expect(
      page.locator('ft-onboarding-hint-bubble[data-remedy="1"]').first()
    ).toBeVisible({ timeout: 8_000 });

    const ids = await visibleRemedyIds(page);
    for (const id of ['sit-button', 'weekly-heatmap', 'quick-start']) {
      expect(ids).toContain(id);
    }

    // One-shot chip stands in for ⋯ only — no "N more tips" queue left over.
    const chip = await catalogChipText(page);
    expect(chip).not.toBeNull();
    expect(chip).not.toMatch(/\d/);
  });
});

test.describe('narrow ? remedy', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('375 stays uncrowded: primary tip + one-shot drawer chip', async ({
    page
  }) => {
    await openFreshProductShell(page);
    // Narrow parks the canvas ? off-screen; the ActionBar button proxies it.
    await page.locator('#ft-narrow-help-btn').click();

    await expect(
      page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"]')
    ).toBeVisible({ timeout: 8_000 });

    const ids = await visibleRemedyIds(page);
    expect(ids).toEqual(['sit-button']);

    const chip = await catalogChipText(page);
    expect(chip).not.toBeNull();
    expect(chip).not.toMatch(/\d/);
  });

  test('375 Focusing: only primary tip + N-more chip (no HUD tip pile)', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await quickStartFocus(page);
    await expect(page.locator('#hud-state')).toContainText(/Focusing|专注/i, {
      timeout: 15_000
    });

    await page.locator('#ft-narrow-help-btn').click();

    await expect(
      page.locator('ft-onboarding-hint-bubble[data-remedy="1"]').first()
    ).toBeVisible({ timeout: 8_000 });

    const ids = await visibleRemedyIds(page);
    expect(ids).toHaveLength(1);
    expect(ids[0]).toBe('rise-button');
    for (const banned of [
      'focus-hud-ring',
      'focus-hud-progress',
      'focus-hud-streak',
      'ambient-soundscape',
      'weekly-heatmap'
    ]) {
      expect(ids).not.toContain(banned);
    }

    const chip = await catalogChipText(page);
    expect(chip).not.toBeNull();
    // Focusing folds multiple extras → counted "N more tips", not one-shot drawer chip.
    expect(chip).toMatch(/\d/);
  });
});

test.describe('mint note dot lifecycle', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('unread shows the mint pulse and Rise must not clear it', async ({
    page
  }) => {
    await openFreshProductShell(page);

    const mintNow = () =>
      page.evaluate(() =>
        Boolean(
          document
            .querySelector('.ambient-soundscape__mute')
            ?.classList.contains('has-hint-mint')
        )
      );

    await expect.poll(mintNow, { timeout: 8_000 }).toBe(true);

    await quickStartFocus(page);
    await riseSkipReflectionToIdle(page);

    // Contract: a completed sitting never counts as "you found the music".
    await expect.poll(mintNow, { timeout: 8_000 }).toBe(true);
  });

  test('hovering the note reveals its tip (host dot has no floating badge)', async ({
    page
  }) => {
    await openFreshProductShell(page);

    const mute = page.locator('.ambient-soundscape__mute');
    await expect(mute).toHaveClass(/has-hint-mint/, { timeout: 8_000 });

    await mute.hover();

    await expect(
      page.locator(
        'ft-onboarding-hint-bubble[data-hint-id="ambient-soundscape"]'
      )
    ).toBeVisible({ timeout: 5_000 });
  });
});
