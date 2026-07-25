import { test, expect } from '@playwright/test';
import {
  advanceArrivalToCompanionPicker,
  expectFocusSessionActive,
  openFreshProductShell
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
 * Scenario O narrow lock (≤479 / 375):
 * ActionBar + swipe drawer — canvas chrome cleared; Yin dominant.
 */
test('375 viewport: narrow ActionBar + drawer; no dock canvas chrome', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('#ft-narrow-idle-shell')).toBeVisible({
    timeout: 15_000
  });
  await expect(page.locator('.ft-narrow-action-bar')).toBeVisible();
  await expect(page.locator('.ft-narrow-grabber')).toBeVisible();

  // Legacy Idle canvas chrome is parked off-screen while narrow idle
  const parked = await page.evaluate(() => {
    const dock = document.getElementById('session-start-dock');
    const hud = document.getElementById('focus-hud');
    const help = document.getElementById('onboarding-hint-help');
    const cluster = document.getElementById('weekly-practice-heatmap-cluster');
    const off = (el) => {
      if (!el) return true;
      const r = el.getBoundingClientRect();
      return r.right < 0 || r.left > window.innerWidth || r.width === 0;
    };
    return {
      bodyClass: document.body.className,
      dockOff: off(dock),
      hudOff: off(hud),
      helpOff: off(help),
      clusterOff: off(cluster),
      vw: window.innerWidth
    };
  });
  expect(parked.vw).toBe(375);
  expect(parked.bodyClass).toContain('ft-narrow-park');
  expect(parked.bodyClass).toContain('ft-narrow-idle');
  expect(parked.dockOff).toBe(true);
  expect(parked.hudOff).toBe(true);
  expect(parked.helpOff).toBe(true);
  expect(parked.clusterOff).toBe(true);

  await page.locator('.ft-narrow-grabber').click();
  await expect(page.locator('#ft-narrow-options-drawer')).toHaveAttribute(
    'aria-hidden',
    'false'
  );
  await expect(
    page.locator('.ft-narrow-sheet__item.is-primary')
  ).toBeVisible();
  await expect(page.locator('.ft-narrow-sheet__item.is-primary')).toContainText(
    /Sit with Yin|与阿寅同坐/i
  );

  // How shall we sit? must stage companion options (not silent)
  await page
    .locator('.ft-narrow-sheet__item', {
      hasText: /How Shall We Sit|怎样同坐|How shall we sit/i
    })
    .click();
  await expect(page.locator('.session-start-dock__option').first()).toBeVisible({
    timeout: 5_000
  });
});

test('375 Arrival: Quick Start stays on-canvas; Sit stays hidden', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('.ft-narrow-grabber')).toBeVisible({
    timeout: 15_000
  });
  await page.locator('.ft-narrow-grabber').click();
  await page.locator('.ft-narrow-sheet__item[data-proxy="sit"]').click();

  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('body')).toHaveClass(
    /ft-narrow-stage-arrival-quick-start/
  );
  await expect(page.locator('#btn-focus')).toBeHidden();
  const quick = page.locator('#quick-start-focus');
  await expect(quick).toBeVisible({ timeout: 5_000 });
  const box = await quick.boundingBox();
  expect(box).toBeTruthy();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(375);
  expect(box.y).toBeGreaterThan(200);

  await quick.click();
  await expectFocusSessionActive(page);
  await expect(page.locator('#arrival-practice')).toBeHidden({
    timeout: 5_000
  });
});

test('375 park: ? remedy shows one primary tip + catalog expand', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('body')).toHaveClass(/ft-narrow-park/, {
    timeout: 15_000
  });
  await page.locator('#ft-narrow-help-btn').click();
  const remedy = page.locator('ft-onboarding-hint-bubble[data-remedy="1"]');
  await expect(remedy.first()).toBeVisible({ timeout: 8_000 });

  const before = await page.evaluate(() => {
    const bubbles = [
      ...document.querySelectorAll('ft-onboarding-hint-bubble[data-remedy="1"]')
    ].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const ids = bubbles.map((b) => b.dataset.hintId);
    const helpMeta = document.querySelector(
      'ft-onboarding-hint-bubble[data-hint-id="help-remedy"]'
    );
    return {
      count: bubbles.length,
      ids,
      catalogExpand: helpMeta?.dataset.catalogExpand || '0'
    };
  });
  expect(before.count).toBeLessThanOrEqual(3);
  expect(before.count).toBeGreaterThanOrEqual(2);
  expect(before.ids).toContain('sit-button');
  expect(before.ids).toContain('help-remedy');
  expect(before.catalogExpand).toBe('1');

  await page
    .locator('ft-onboarding-hint-bubble[data-hint-id="help-remedy"]')
    .click();

  const after = await page.evaluate(() => {
    const bubbles = [
      ...document.querySelectorAll('ft-onboarding-hint-bubble[data-remedy="1"]')
    ].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const help = document.getElementById('ft-narrow-help-btn');
    const grabber = document.querySelector('.ft-narrow-grabber');
    const center = document.querySelector('.ft-narrow-action-bar__center');
    if (!help || !grabber || bubbles.length < 3) {
      return { ok: false, reason: 'missing', bubbleCount: bubbles.length };
    }
    const anchors = [help, grabber, center].filter(Boolean);
    const nearVisible = bubbles.every((b) => {
      const r = b.getBoundingClientRect();
      const cx = (r.left + r.right) / 2;
      const cy = (r.top + r.bottom) / 2;
      if (cx < 0 || cy < 0 || cx > 375 || cy > 667) return false;
      return anchors.some((a) => {
        const ar = a.getBoundingClientRect();
        const ax = (ar.left + ar.right) / 2;
        const ay = (ar.top + ar.bottom) / 2;
        return Math.hypot(cx - ax, cy - ay) < 280;
      });
    });
    return {
      ok: nearVisible,
      bubbleCount: bubbles.length
    };
  });
  expect(after.ok, after.reason || 'tips not near ActionBar/grabber').toBe(
    true
  );
  expect(after.bubbleCount).toBeGreaterThanOrEqual(3);
});

test('375 drawer: Honesty listed; Soundscape panel + Reminder respond', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('#ft-narrow-idle-shell')).toBeVisible({
    timeout: 15_000
  });

  await page.locator('.ft-narrow-grabber').click();
  await expect(page.locator('#ft-narrow-options-drawer')).toHaveAttribute(
    'aria-hidden',
    'false'
  );

  // Honesty must remain in the drawer (never dropped for space)
  const honestyItem = page.locator('.ft-narrow-sheet__item', {
    hasText: /Honesty Check-in|诚实补登|Honesty/i
  });
  await expect(honestyItem).toBeVisible();

  // Sound → Soundscape track panel on-canvas (not red FAB, not tip-only)
  await page
    .locator('.ft-narrow-sheet__item', { hasText: /^Sound$|声景|声音/i })
    .click();
  await expect(page.locator('.ambient-soundscape__panel')).toBeVisible({
    timeout: 5_000
  });
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const panel = document.querySelector('.ambient-soundscape__panel');
        const fab = document.querySelector('.ambient-soundscape__fab');
        if (!panel || panel.hidden) return null;
        const pr = panel.getBoundingClientRect();
        const fr = fab?.getBoundingClientRect();
        const fabHidden =
          !fab ||
          getComputedStyle(fab).display === 'none' ||
          getComputedStyle(fab).visibility === 'hidden' ||
          (fr && (fr.width < 1 || fr.right < 0));
        return {
          staged: document.body.classList.contains('ft-narrow-stage-sound'),
          title: (
            panel.querySelector('.ambient-soundscape__title')?.textContent || ''
          ).trim(),
          tracks: panel.querySelectorAll('.ambient-soundscape__track').length,
          panelOnScreen:
            pr.width > 40 && pr.left >= 0 && pr.left < window.innerWidth,
          fabHidden
        };
      });
    })
    .toMatchObject({
      staged: true,
      panelOnScreen: true,
      fabHidden: true
    });
  const panelMeta = await page.evaluate(() => {
    const panel = document.querySelector('.ambient-soundscape__panel');
    return {
      title: (
        panel?.querySelector('.ambient-soundscape__title')?.textContent || ''
      ).trim(),
      tracks: panel?.querySelectorAll('.ambient-soundscape__track').length ?? 0
    };
  });
  expect(panelMeta.title.length).toBeGreaterThan(2);
  expect(panelMeta.tracks).toBeGreaterThanOrEqual(2);

  // Re-open drawer → Reminder panel must appear on-screen
  await page.locator('.ft-narrow-grabber').click();
  await page
    .locator('.ft-narrow-sheet__item', {
      hasText: /When should I remind you|何时提醒|remind/i
    })
    .click();
  await expect(page.locator('#reminder-preference-panel')).toBeVisible({
    timeout: 5_000
  });
  const reminderBox = await page.locator('#reminder-preference-panel').boundingBox();
  expect(reminderBox).toBeTruthy();
  expect(reminderBox.x).toBeGreaterThanOrEqual(0);
  expect(reminderBox.x + reminderBox.width).toBeLessThanOrEqual(375 + 2);
  expect(reminderBox.y).toBeGreaterThanOrEqual(0);
  expect(reminderBox.y).toBeLessThan(667);
});

test('375: ActionBar mute toggles ambient preference', async ({ page }) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('#ft-narrow-mute-btn')).toBeVisible({
    timeout: 15_000
  });

  const before = await page.evaluate(() => {
    try {
      return JSON.parse(
        localStorage.getItem('focus-tiger.ambient-pref.v1') || '{}'
      );
    } catch {
      return {};
    }
  });
  // Opt-in: fresh product shell starts with music off
  expect(before.enabled === false || before.enabled == null).toBeTruthy();

  await page.locator('#ft-narrow-mute-btn').click({ force: true });
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        try {
          return JSON.parse(
            localStorage.getItem('focus-tiger.ambient-pref.v1') || '{}'
          ).enabled;
        } catch {
          return null;
        }
      });
    })
    .toBe(true);

  await page.locator('#ft-narrow-mute-btn').click({ force: true });
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        try {
          return JSON.parse(
            localStorage.getItem('focus-tiger.ambient-pref.v1') || '{}'
          ).enabled;
        } catch {
          return null;
        }
      });
    })
    .toBe(false);
});

test('375 Focusing restores FocusHUD and hides Sound FAB', async ({ page }) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 375, height: 667 });

  // Sit/⚡ parked — Quick Start via drawer → Focusing（本用例只锁 HUD/FAB，不测 Arrival）
  await page.locator('.ft-narrow-grabber').click();
  await page.locator('.ft-narrow-sheet__item[data-proxy="quickstart"]').click();
  await expectFocusSessionActive(page);

  const report = await page.evaluate(() => {
    const hud = document.getElementById('focus-hud');
    const chrome = document.querySelector('.ambient-soundscape__focus-chrome');
    const mute = document.querySelector('.ambient-soundscape__mute');
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        left: r.left,
        top: r.top,
        w: r.width,
        h: r.height,
        right: r.right
      };
    };
    return {
      bodyClass: document.body.className,
      hud: box(hud),
      mute: box(mute),
      hideFab: chrome?.classList.contains('ft-narrow-hide-fab') === true,
      chromeVisibility: chrome ? getComputedStyle(chrome).visibility : null
    };
  });
  expect(report.bodyClass).toContain('ft-narrow-focusing');
  expect(report.hud?.w).toBeGreaterThan(40);
  expect(report.hud?.left).toBeGreaterThanOrEqual(0);
  expect(report.hud?.left).toBeLessThan(80);
  expect(report.hideFab).toBe(true);
  expect(report.chromeVisibility).toBe('hidden');
  // Mute note visible top-right
  expect(report.mute?.w).toBeGreaterThan(20);
  expect(report.mute?.left).toBeGreaterThan(200);
});

test('non-Idle (Focusing) hides weekly heatmap', async ({ page }) => {
  await openFreshProductShell(page);
  await expect(page.locator(HEATMAP)).toBeVisible({ timeout: 15_000 });

  await advanceArrivalToCompanionPicker(page);
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
