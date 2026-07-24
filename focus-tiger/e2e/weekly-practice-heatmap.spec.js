import { test, expect } from '@playwright/test';
import {
  advanceArrivalToCompanionPicker,
  expectFocusSessionActive,
  openFreshProductShell,
  selectCompanionMode
} from './helpers/product-shell.js';

const HEATMAP = '#weekly-practice-heatmap';
const CELLS = `${HEATMAP} .weekly-practice-heatmap__cell`;
const PRACTICE_DAYS_KEY = 'focus-tiger.practice-days.v1';

/**
 * Seed practice-days relative to the browser's local today, then reload.
 * - oldest (today-6): null → lit (legacy unknown)
 * - today-4: 20 → lit
 * - today-2: explicit 0 → dim
 * - today: 15 → lit
 * Gaps filled by getLastNDays → dim
 */
async function seedMixedPracticeDaysAndReload(page) {
  await page.evaluate((storageKey) => {
    const pad = (n) => String(n).padStart(2, '0');
    const keyOf = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const shift = (delta) => {
      const d = new Date();
      d.setDate(d.getDate() + delta);
      return keyOf(d);
    };
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        days: [
          { date: shift(-6), totalMinutes: null },
          { date: shift(-4), totalMinutes: 20 },
          { date: shift(-2), totalMinutes: 0 },
          { date: shift(0), totalMinutes: 15 }
        ]
      })
    );
  }, PRACTICE_DAYS_KEY);
  await page.reload();
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 60_000 });
}

test('Idle shows weekly heatmap with 7 cells', async ({ page }) => {
  await openFreshProductShell(page);
  const heatmap = page.locator(HEATMAP);
  await expect(heatmap).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(CELLS)).toHaveCount(7);
});

/**
 * Scenario O narrow lock: at 375×667 the left heatmap cluster must not
 * geometrically overlap dock pills (Honesty / breath / Sit / hint) or ?.
 * Also HUD streak must not overlap the top-right mute note.
 */
test('375 viewport: heatmap cluster and HUD clear of dock / mute', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await expect(page.locator(HEATMAP)).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('#reminder-preference-toggle')).toBeVisible();

  const report = await page.evaluate(() => {
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return null;
      return {
        x: r.x,
        y: r.y,
        right: r.right,
        bottom: r.bottom,
        w: r.width,
        h: r.height
      };
    };
    const overlaps = (a, b) => {
      if (!a || !b) return false;
      return a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;
    };
    const cluster = box(document.querySelector('#weekly-practice-heatmap-cluster'));
    const help = box(document.querySelector('#onboarding-hint-help'));
    const mute = box(document.querySelector('.ambient-soundscape__mute'));
    const hud = box(document.querySelector('#focus-hud .ft-hud'));
    const streak = box(document.querySelector('#focus-hud .ft-hud__streak'));
    const sound = box(document.querySelector('.ambient-soundscape__fab'));
    const how = box(document.querySelector('.session-start-dock__hint'));
    const dockBtns = [
      '#honesty-idle-entry',
      '#micro-ritual-idle-entry',
      '#btn-focus',
      '.session-start-dock__hint'
    ].map((sel) => ({ sel, box: box(document.querySelector(sel)) }));

    const clusterHits = dockBtns
      .filter((d) => overlaps(cluster, d.box))
      .map((d) => d.sel);
    if (overlaps(cluster, help)) clusterHits.push('#onboarding-hint-help');
    if (overlaps(cluster, hud)) clusterHits.push('#focus-hud');
    if (overlaps(cluster, sound)) clusterHits.push('.ambient-soundscape__fab');

    const dockSoundHits = dockBtns
      .filter((d) => overlaps(sound, d.box))
      .map((d) => d.sel);

    const horizontalGap = (a, b) => {
      if (!a || !b) return Infinity;
      if (a.right <= b.x) return b.x - a.right;
      if (b.right <= a.x) return a.x - b.right;
      return -1; // overlapping in x
    };
    const shareVerticalBand = (a, b) =>
      !!a && !!b && a.y < b.bottom && a.bottom > b.y;
    const howSoundClear =
      !overlaps(how, sound) &&
      (!shareVerticalBand(how, sound) || horizontalGap(how, sound) >= 8);

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      clusterHits,
      dockSoundHits,
      hudMuteOverlap: overlaps(hud, mute) || overlaps(streak, mute),
      howSoundClear,
      howSoundGap: horizontalGap(how, sound),
      cluster,
      mute,
      hud
    };
  });

  expect(report.viewport).toEqual({ w: 375, h: 667 });
  expect(
    report.clusterHits,
    `cluster overlapped: ${report.clusterHits.join(', ')}`
  ).toEqual([]);
  expect(
    report.dockSoundHits,
    `Sound overlapped dock: ${report.dockSoundHits.join(', ')}`
  ).toEqual([]);
  expect(report.hudMuteOverlap, 'HUD/streak overlapped mute note').toBe(false);
  expect(
    report.howSoundClear,
    `How shall we sit? too close to Sound (gap=${report.howSoundGap})`
  ).toBe(true);
});

test('non-Idle (Focusing) hides weekly heatmap', async ({ page }) => {
  await openFreshProductShell(page);
  await expect(page.locator(HEATMAP)).toBeVisible({ timeout: 15_000 });

  await advanceArrivalToCompanionPicker(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expectFocusSessionActive(page);

  await expect(page.locator(HEATMAP)).toBeHidden();
});

test('heatmap lights null and positive minutes; dims true zero days', async ({
  page
}) => {
  await openFreshProductShell(page);
  await seedMixedPracticeDaysAndReload(page);

  const heatmap = page.locator(HEATMAP);
  await expect(heatmap).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(CELLS)).toHaveCount(7);

  const flags = await page.evaluate((sel) => {
    const pad = (n) => String(n).padStart(2, '0');
    const keyOf = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const shift = (delta) => {
      const d = new Date();
      d.setDate(d.getDate() + delta);
      return keyOf(d);
    };
    const byDate = {};
    for (const el of document.querySelectorAll(sel)) {
      byDate[el.dataset.date] = el.dataset.lit;
    }
    return {
      byDate,
      expectLit: [shift(-6), shift(-4), shift(0)],
      expectDim: [shift(-5), shift(-3), shift(-2), shift(-1)]
    };
  }, CELLS);

  for (const date of flags.expectLit) {
    expect(flags.byDate[date], `expected lit for ${date}`).toBe('1');
  }
  for (const date of flags.expectDim) {
    expect(flags.byDate[date], `expected dim for ${date}`).toBe('0');
  }
});
