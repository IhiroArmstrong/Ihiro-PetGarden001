/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  clickSitEntry,
  openFreshProductShell
} from './helpers/product-shell.js';

const GOAL_CARD = '#cold-start-goal-card';
const GOAL_BACKDROP = '#cold-start-goal-backdrop';
const OPTION_IDS = ['mindfulness', 'breath', 'study-work', 'browse'];

/**
 * Skip flower / Compass so the four-choice card is the first overlay.
 * Omit `sessionMinutes` so direct-sit keeps Brief 10 / 25, not the e2e 1-minute query.
 * @param {import('@playwright/test').Page} page
 * @param {{ locale?: 'en' | 'ja' }} [opts]
 */
async function openFirstRunGoalCard(page, opts = {}) {
  const locale = opts.locale ?? 'en';
  await page.addInitScript((loc) => {
    try {
      localStorage.setItem('focus-tiger.five-moments-compass-seen.v1', '1');
      if (loc === 'ja') {
        localStorage.setItem('focus-tiger.locale.v1', 'ja');
      }
    } catch {
      /* ignore */
    }
  }, locale);

  await openFreshProductShell(page, {
    path: '/?product=1&flowerWelcome=0'
  });

  await page.evaluate((loc) => {
    try {
      localStorage.setItem('focus-tiger.five-moments-compass-seen.v1', '1');
      if (loc === 'ja') {
        localStorage.setItem('focus-tiger.locale.v1', 'ja');
      }
    } catch {
      /* ignore */
    }
    window.__fiveMomentsCompass?.close?.();
  }, locale);

  if (locale === 'ja') {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
      timeout: 35_000
    });
    await page.evaluate(() => {
      window.__fiveMomentsCompass?.close?.();
    });
  }

  await expect(page.locator(GOAL_CARD)).toBeVisible({ timeout: 25_000 });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function expectGoalOverlayGoneAndRiseClickable(page) {
  await expect(page.locator(GOAL_CARD)).toBeHidden({ timeout: 8_000 });
  await expect(page.locator(GOAL_BACKDROP)).not.toHaveClass(/is-visible/);
  await expect(page.locator('#arrival-practice')).toBeHidden();
  await expect(page.locator('#micro-ritual')).toBeHidden();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const bd = document.getElementById('cold-start-goal-backdrop');
        if (!bd || bd.hidden) return 'clear';
        const style = getComputedStyle(bd);
        const blocking =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0.01 &&
          style.pointerEvents !== 'none';
        return blocking ? 'blocking' : 'clear';
      });
    }, { timeout: 5_000 })
    .toBe('clear');

  const rise = page.locator('#btn-focus');
  await expect(rise).toContainText(/Rise|起身|立つ/);
  await expect(rise).toBeEnabled();

  const hit = await page.evaluate(() => {
    const riseEl = document.getElementById('btn-focus');
    const wide = document.getElementById('ft-wide-home-sit');
    const narrow = document.getElementById('ft-narrow-home-sit');
    const target = [wide, narrow, riseEl].find((el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 2 && r.height > 2;
    });
    if (!target) return 'missing';
    const r = target.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const top = document.elementFromPoint(x, y);
    if (!top) return 'none';
    if (
      top === target ||
      target.contains(top) ||
      top.closest('#btn-focus, #ft-wide-home-sit, #ft-narrow-home-sit')
    ) {
      return 'rise';
    }
    return top.id || top.className || top.tagName;
  });
  expect(hit, `Rise hit-target blocked by ${hit}`).toBe('rise');
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'mindfulness' | 'study-work'} choice
 * @param {RegExp} remaining
 */
async function expectDirectSitFocusing(page) {
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身|立つ/);
  await expect(page.locator('#focus-hud')).toBeVisible();
  await expect(page.locator('#hud-state')).toContainText(/Focusing|专注|集中/);
  await expect
    .poll(async () => page.locator('#hud-time').textContent(), {
      timeout: 8_000
    })
    .not.toBe('00:00');
  await expect(page.locator('#hud-time')).toBeHidden();
  await expect(page.locator('#focus-hud .ft-hud')).toHaveAttribute(
    'data-sitting-picture',
    '1'
  );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'mindfulness' | 'study-work'} choice
 * @param {RegExp} targetChip
 */
async function clickChoiceOnceIntoFocusing(page, choice, targetChip) {
  const started = Date.now();
  await page.locator(`[data-testid="cold-start-goal-${choice}"]`).click();
  await expectDirectSitFocusing(page);
  expect(
    Date.now() - started,
    'one click must reach Focusing within 10s'
  ).toBeLessThanOrEqual(10_000);
  await expect(page.locator('#hud-session-target')).toContainText(targetChip);
}

test('EN wide: option 1 one-click Focusing; overlay gone; Rise then Sit arrives', async ({
  page
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFirstRunGoalCard(page);

  const lede = page.getByTestId('cold-start-goal-mindfulness-lede');
  await expect(lede).toBeVisible();
  await expect(lede).toContainText(/training the mind/i);

  await expect(page.locator('[data-testid="cold-start-goal-mindfulness"]')).toContainText(
    /Mindfulness & meditation/i
  );
  await expect(page.locator('[data-testid="cold-start-goal-mindfulness"]')).toContainText(
    /no guidance/i
  );

  await clickChoiceOnceIntoFocusing(page, 'mindfulness', /10 min|10 分/);
  await expectGoalOverlayGoneAndRiseClickable(page);

  await page.locator('#btn-focus').click();
  const reflection = page.locator('#tiger-reflection-moment');
  try {
    await reflection.waitFor({ state: 'visible', timeout: 8_000 });
    await page.keyboard.press('Escape');
  } catch {
    /* Early Rise may skip Reflection. */
  }
  await expect(page.locator('#btn-focus')).toContainText(/Sit with Yin|与阿寅同坐/i, {
    timeout: 10_000
  });
  await clickSitEntry(page);
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await expect(
    arrival.getByRole('button', { name: /Calm|平静|Not Sure|不确定/i }).first()
  ).toBeVisible({ timeout: 8_000 });
});

test('EN wide: Sit with Yin still opens Arrival after dismissing the card', async ({
  page
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFirstRunGoalCard(page);
  await page.locator('[data-testid="cold-start-goal-browse"]').click();
  await expect(page.locator(GOAL_CARD)).toBeHidden({ timeout: 8_000 });
  await expect(page.locator(GOAL_BACKDROP)).not.toHaveClass(/is-visible/);
  await clickSitEntry(page);
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await expect(
    arrival.getByRole('button', { name: /Calm|平静|Not Sure|不确定/i }).first()
  ).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('#hud-state')).not.toContainText(/Focusing|专注/i);
});

test('JA wide: option 1 copy + one-click Focusing; overlay gone', async ({
  page
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFirstRunGoalCard(page, { locale: 'ja' });

  const lede = page.getByTestId('cold-start-goal-mindfulness-lede');
  await expect(lede).toBeVisible();
  await expect(lede).toContainText('心を整える');

  await expect(page.locator('[data-testid="cold-start-goal-mindfulness"]')).toContainText(
    'マインドフルネス・瞑想'
  );
  await expect(page.locator('[data-testid="cold-start-goal-mindfulness"]')).toContainText(
    'ガイドなし'
  );

  await clickChoiceOnceIntoFocusing(page, 'mindfulness', /10 min|10 分/);
  await expectGoalOverlayGoneAndRiseClickable(page);
});

test('EN 375: four options tappable; option 3 one-click Focusing; Rise clear', async ({
  page
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 375, height: 667 });
  await openFirstRunGoalCard(page);

  await expect(page.getByTestId('cold-start-goal-mindfulness-lede')).toBeVisible();

  for (const id of OPTION_IDS) {
    const opt = page.locator(`[data-testid="cold-start-goal-${id}"]`);
    await expect(opt).toBeVisible();
    await expect(opt).toBeEnabled();
    const box = await opt.boundingBox();
    expect(box, `${id} missing box`).toBeTruthy();
    expect(box.width, `${id} clipped horizontally`).toBeGreaterThan(80);
    expect(box.x, `${id} starts off-screen`).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width, `${id} overflows 375`).toBeLessThanOrEqual(376);
  }

  await clickChoiceOnceIntoFocusing(page, 'study-work', /25 min|25 分/);
  await expectGoalOverlayGoneAndRiseClickable(page);
});
