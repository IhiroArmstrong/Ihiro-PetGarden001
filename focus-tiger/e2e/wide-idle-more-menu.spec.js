import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * Wide Idle (≥480) declutter: Sit + ⚡ + ⋯; secondary via upward popover.
 */

test.use({ viewport: { width: 1280, height: 720 } });

test('wide Idle: resident Sit + Quick Start + more; secondary parked', async ({
  page
}) => {
  await openFreshProductShell(page);

  await expect(page.locator('#btn-focus')).toBeVisible();
  await expect(page.locator('#quick-start-focus')).toBeVisible();
  await expect(page.locator('#ft-wide-more-btn')).toBeVisible();

  // Parked off-canvas — not in the visible bottom cluster
  await expect(page.locator('.session-start-dock__hint')).not.toBeInViewport();
  await expect(page.locator('.ambient-soundscape__fab')).not.toBeInViewport();
  await expect(page.locator('#reminder-preference-toggle')).not.toBeInViewport();

  // Left ? / heatmap stay (out of declutter scope)
  await expect(page.locator('#onboarding-hint-help')).toBeVisible();
  await expect(page.locator('#weekly-practice-heatmap')).toBeVisible();
});

test('wide Idle: ⋯ opens companion + reminder panels', async ({ page }) => {
  await openFreshProductShell(page);
  const more = page.locator('#ft-wide-more-btn');
  await expect(more).toBeVisible({ timeout: 15_000 });
  await more.click();
  await expect(page.locator('#ft-wide-more-menu')).toBeVisible({
    timeout: 5_000
  });
  await page.locator('#ft-wide-more-menu [data-proxy="companion"]').click();
  await expect(page.locator('.session-start-dock__panel')).toBeVisible({
    timeout: 5_000
  });
  await expect(page.locator('#ft-wide-more-menu')).toBeHidden();

  await page.evaluate(() => window.__companionModePicker?.hide?.());
  await expect(page.locator('.session-start-dock__panel')).toBeHidden();

  await more.click();
  await expect(page.locator('#ft-wide-more-menu')).toBeVisible({
    timeout: 5_000
  });
  await page.locator('#ft-wide-more-menu [data-proxy="reminder"]').click();
  await expect(page.locator('#reminder-preference-panel')).toBeVisible({
    timeout: 5_000
  });
});

test('wide Arrival: only Quick Start; Sit and ⋯ hidden', async ({ page }) => {
  await openFreshProductShell(page);
  await page.locator('#btn-focus').click();
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
  await expect(page.locator('#btn-focus')).toBeHidden();
  await expect(page.locator('#ft-wide-more-btn')).toBeHidden();
  await expect(page.locator('#quick-start-focus')).toBeVisible();
});

test('wide Focusing: more hidden; top-right note stays, Sound FAB stays hidden', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#quick-start-focus').click();
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 15_000
  });
  await expect(page.locator('#ft-wide-more-btn')).toBeHidden();
  await expect(page.locator('.ambient-soundscape__mute')).toBeInViewport();
  await expect(page.locator('.ambient-soundscape__fab')).not.toBeInViewport();
});

test('wide Idle: top-right note opens Soundscape panel (same as ⋯ Sound)', async ({
  page
}) => {
  await openFreshProductShell(page);
  await expect(page.locator('.ambient-soundscape__mute')).toBeVisible({
    timeout: 15_000
  });
  await page.locator('.ambient-soundscape__mute').click();
  await expect(page.locator('.ambient-soundscape__panel')).toBeVisible({
    timeout: 5_000
  });
  await expect(page.locator('.ambient-soundscape__fab')).not.toBeInViewport();
  await expect(page.locator('.ambient-soundscape__nudge.is-blocked-tip')).toHaveCount(
    0
  );
});

test('wide Idle: ⋯ Sound opens Soundscape panel (not FAB); Honesty always listed', async ({
  page
}) => {
  await openFreshProductShell(page);
  // Simulate DORMANT-ish honesty entry hide — menu must still list Honesty
  await page.evaluate(() => {
    const el = document.getElementById('honesty-idle-entry');
    if (el) el.hidden = true;
  });
  const more = page.locator('#ft-wide-more-btn');
  await more.click();
  await expect(page.locator('#ft-wide-more-menu [data-proxy="honesty"]')).toBeVisible();
  await expect(page.locator('#ft-wide-more-menu [data-proxy="sound"]')).toBeVisible();
  await page.locator('#ft-wide-more-menu [data-proxy="sound"]').click();
  await expect(page.locator('.ambient-soundscape__panel')).toBeVisible({
    timeout: 5_000
  });
  await expect(page.locator('.ambient-soundscape__fab')).not.toBeInViewport();
  // Gated tip-only path must not be the result
  await expect(page.locator('.ambient-soundscape__nudge.is-blocked-tip')).toHaveCount(0);
});

test('wide Idle: no ambient autoplay on boot', async ({ page }) => {
  await openFreshProductShell(page);
  const playing = await page.evaluate(() => {
    const audios = [...document.querySelectorAll('audio')];
    const anyAudible = audios.some(
      (a) => !a.paused && !a.muted && a.volume > 0 && a.currentSrc
    );
    const nudge = document.querySelector('.ambient-soundscape__nudge');
    const nudgeText = (nudge && !nudge.hidden ? nudge.textContent : '') || '';
    const ctrl = window.__ambientSoundscape;
    return {
      anyAudible,
      nudgeSuggestsOn: /Music is on|音乐已开/i.test(nudgeText),
      want: ctrl?.wantsEnabled?.() ?? false,
      audible: ctrl?.isAudiblePlaying?.() ?? false
    };
  });
  expect(playing.anyAudible).toBe(false);
  expect(playing.nudgeSuggestsOn).toBe(false);
  expect(playing.want).toBe(false);
  expect(playing.audible).toBe(false);
});

test('wide park: ? remedy anchors parked chrome hints near ⋯', async ({ page }) => {
  await openFreshProductShell(page);
  const more = page.locator('#ft-wide-more-btn');
  await expect(more).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/ft-wide-park-secondary/);
  await expect(page.locator('#quick-start-focus .ft-hint-discovery-dot')).toBeVisible({
    timeout: 8_000
  });
  await page.locator('#onboarding-hint-help').click();
  // 情境单条：先出主 tip +「还有 N 条」；展开后再验 parked remap
  const remedy = page.locator('ft-onboarding-hint-bubble[data-remedy="1"]');
  await expect(remedy.first()).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('#onboarding-app-purpose')).toBeVisible();
  await expect(
    page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"]')
  ).toBeVisible();
  // 用途卡可能被「还有 N 条」芯片挡住；直接关掉再展开目录
  await page.evaluate(() => {
    const card = document.getElementById('onboarding-app-purpose');
    if (card) card.hidden = true;
  });
  await expect(page.locator('#ft-hint-catalog-chip')).toBeVisible({
    timeout: 5_000
  });
  // Catalog expands one tip at a time (primary + 1), not a flood.
  const beforeN = await page.evaluate(() => {
    const chip = document.getElementById('ft-hint-catalog-chip');
    const m = (chip?.textContent || '').match(/(\d+)/);
    return m ? Number(m[1]) : 0;
  });
  expect(beforeN).toBeGreaterThan(0);
  await page.locator('#ft-hint-catalog-chip').click();
  const afterClick = await page.evaluate(() => {
    const bubbles = [
      ...document.querySelectorAll(
        'ft-onboarding-hint-bubble[data-remedy="1"]'
      )
    ].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const chip = document.getElementById('ft-hint-catalog-chip');
    const m = (chip?.textContent || '').match(/(\d+)/);
    return {
      count: bubbles.length,
      chipN: m ? Number(m[1]) : 0,
      chipVisible: Boolean(chip && !chip.hidden)
    };
  });
  expect(afterClick.count).toBeGreaterThanOrEqual(1);
  expect(afterClick.count).toBeLessThanOrEqual(3);
  if (beforeN > 1) {
    expect(afterClick.chipVisible).toBe(true);
    expect(afterClick.chipN).toBe(beforeN - 1);
  }
  const layout = await page.evaluate(() => {
    const moreEl = document.getElementById('ft-wide-more-btn');
    const purpose = document.getElementById('onboarding-app-purpose');
    const bubbles = [
      ...document.querySelectorAll('ft-onboarding-hint-bubble[data-remedy="1"]')
    ].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!moreEl || bubbles.length === 0) {
      return { ok: false, reason: 'missing', bubbleCount: bubbles.length };
    }
    const mr = moreEl.getBoundingClientRect();
    const hit = bubbles.some((b) => {
      const r = b.getBoundingClientRect();
      const cx = (r.left + r.right) / 2;
      const cy = (r.top + r.bottom) / 2;
      const mcx = (mr.left + mr.right) / 2;
      const mcy = (mr.top + mr.bottom) / 2;
      return Math.hypot(cx - mcx, cy - mcy) < 260;
    });
    let purposeBlocksTip = false;
    if (purpose && !purpose.hidden) {
      const pr = purpose.getBoundingClientRect();
      purposeBlocksTip = bubbles.some((b) => {
        const r = b.getBoundingClientRect();
        const pad = 8;
        return !(
          pr.right + pad < r.left ||
          pr.left - pad > r.right ||
          pr.bottom + pad < r.top ||
          pr.top - pad > r.bottom
        );
      });
    }
    // One-tip catalog: do not require quick-start + focus-hud simultaneously.
    // Remap lock = at least one visible remedy tip near the ⋯ button.
    return {
      ok: hit && !purposeBlocksTip,
      hit,
      purposeBlocksTip,
      bubbleCount: bubbles.length
    };
  });
  expect(layout.ok, JSON.stringify(layout)).toBe(true);
});
