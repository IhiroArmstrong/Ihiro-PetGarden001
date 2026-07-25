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
 * ActionBar + home primary CTAs + swipe drawer (secondary only).
 */
test('375 viewport: narrow ActionBar + home CTAs; no dock canvas chrome', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await expect(page.locator('#ft-narrow-idle-shell')).toBeVisible({
    timeout: 15_000
  });
  await expect(page.locator('.ft-narrow-action-bar')).toBeVisible();
  await expect(page.locator('#ft-narrow-home-ctas')).toBeVisible();
  await expect(page.locator('#ft-narrow-home-sit')).toContainText(
    /Sit with Yin|与阿寅同坐/i
  );
  await expect(page.locator('#ft-narrow-home-quickstart')).toBeVisible();
  await expect(page.locator('#ft-narrow-home-honesty')).toBeVisible();
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
  // Sit / Quick Start / Honesty moved to home — must NOT remain in drawer
  await expect(
    page.locator('.ft-narrow-sheet__item', {
      hasText: /Sit with Yin|与阿寅同坐/i
    })
  ).toHaveCount(0);
  await expect(
    page.locator('.ft-narrow-sheet__item', {
      hasText: /Quick Start|快速开始/i
    })
  ).toHaveCount(0);
  await expect(
    page.locator('.ft-narrow-sheet__item', {
      hasText: /Honesty Check-in|诚实补登/i
    })
  ).toHaveCount(0);

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

test('375 home: Honesty on canvas; drawer Soundscape + Reminder respond', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await expect(page.locator('#ft-narrow-idle-shell')).toBeVisible({
    timeout: 15_000
  });

  // Honesty lives on home canvas (not in the drawer)
  await expect(page.locator('#ft-narrow-home-honesty')).toBeVisible();
  await expect(page.locator('#ft-narrow-home-honesty')).toContainText(
    /Honesty Check-in|诚实补登|Honesty/i
  );

  await page.locator('.ft-narrow-grabber').click();
  await expect(page.locator('#ft-narrow-options-drawer')).toHaveAttribute(
    'aria-hidden',
    'false'
  );
  await expect(
    page.locator('.ft-narrow-sheet__item', {
      hasText: /Honesty Check-in|诚实补登/i
    })
  ).toHaveCount(0);

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
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
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
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);

  // Sit is on home canvas (no longer drawer primary)
  await page.locator('#ft-narrow-home-sit').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  const noticePick = arrival.getByRole('button', {
    name: /Not Sure|不确定|Calm|平静/i
  });
  await expect(noticePick.first()).toBeVisible({ timeout: 8_000 });
  await noticePick.first().click();
  const reading = arrival.getByRole('button', { name: /Reading|阅读/i });
  await expect(reading).toBeVisible({ timeout: 20_000 });
  await reading.click();
  // Choose 后展开 Companion；375 下 dock 选项常在视口外，用 DOM click 开表
  await expect(page.locator('.session-start-dock__panel')).toBeVisible({
    timeout: 20_000
  });
  await page.evaluate(() => {
    const opt = Array.from(
      document.querySelectorAll('.session-start-dock__option')
    ).find((el) => /Here & Now|当下同坐/i.test(el.textContent || ''));
    if (!opt) throw new Error('Here & Now option not found');
    /** @type {HTMLElement} */ (opt).click();
  });
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 45_000
  });
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
