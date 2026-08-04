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
 * UX: rolling 7 days need weekday labels + today outline — bare squares
 * left users unable to tell which cell is today (KnownRisky #5 feedback).
 */
test('Idle heatmap marks today and shows weekday labels', async ({ page }) => {
  await openFreshProductShell(page);
  const heatmap = page.locator(HEATMAP);
  await expect(heatmap).toBeVisible({ timeout: 15_000 });

  const days = page.locator(`${HEATMAP} .weekly-practice-heatmap__day`);
  await expect(days).toHaveCount(7);

  const todayCells = page.locator(`${CELLS}[data-today="1"]`);
  await expect(todayCells).toHaveCount(1);
  // Contract: getLastNDays oldest→newest → today is the rightmost cell
  await expect(page.locator(CELLS).nth(6)).toHaveAttribute('data-today', '1');

  const dows = page.locator(`${HEATMAP} .weekly-practice-heatmap__dow`);
  await expect(dows).toHaveCount(7);
  for (let i = 0; i < 7; i += 1) {
    await expect(dows.nth(i)).not.toHaveText('');
  }
  await expect(
    page.locator(`${HEATMAP} .weekly-practice-heatmap__dow--today`)
  ).toHaveCount(1);
});

/**
 * Cold-start breathing regression (2026-08-04):
 * heatmap+? cluster must sit above home balls so weekly-heatmap mint hint stays visible.
 */
test('wide Idle: weekly-heatmap mint badge visible above home CTAs', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 1100, height: 720 });
  await expect(page.locator(HEATMAP)).toBeVisible({ timeout: 15_000 });

  // Fresh shell = unread click hints; weekly-heatmap must show mint badge
  const badge = page.locator(
    '.onboarding-hint-badge[data-hint-id="weekly-heatmap"]'
  );
  await expect(badge).toBeVisible({ timeout: 10_000 });

  const layout = await page.evaluate(() => {
    const cluster = document.getElementById('weekly-practice-heatmap-cluster');
    const home =
      document.getElementById('ft-wide-home-ctas') ||
      document.getElementById('ft-narrow-home-ctas');
    const badgeEl = document.querySelector(
      '.onboarding-hint-badge[data-hint-id="weekly-heatmap"]'
    );
    const cr = cluster?.getBoundingClientRect();
    const hr = home?.getBoundingClientRect();
    const br = badgeEl?.getBoundingClientRect();
    return {
      clusterBottom: cr?.bottom ?? null,
      homeTop: hr?.top ?? null,
      badgeVisible:
        Boolean(br) && br.width > 0 && br.height > 0 && br.bottom > 0,
      badgeTop: br?.top ?? null
    };
  });
  expect(layout.homeTop).not.toBeNull();
  expect(layout.clusterBottom).not.toBeNull();
  // Cluster (heatmap) must clear the home ball band — no vertical overlap
  expect(layout.clusterBottom).toBeLessThan(layout.homeTop - 4);
  expect(layout.badgeVisible).toBe(true);
});

/**
 * Scenario O narrow lock (≤479 / 375):
 * ActionBar + home primary CTAs + swipe drawer (secondary only).
 */
test('375 viewport: narrow ActionBar + home CTAs; no dock canvas chrome', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('#ft-narrow-idle-shell')).toBeVisible({
    timeout: 15_000
  });
  await expect(page.locator('.ft-narrow-action-bar')).toBeVisible();
  await expect(page.locator('#ft-narrow-home-ctas')).toBeVisible();
  // Canvas order: Quick Start · Sit with Yin · Honesty
  const homeOrder = await page
    .locator('#ft-narrow-home-ctas [data-proxy]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-proxy')));
  expect(homeOrder).toEqual(['quickstart', 'sit', 'honesty']);
  await expect(page.locator('#ft-narrow-home-sit')).toHaveAttribute(
    'aria-label',
    /Sit with Yin|与阿寅同坐/i
  );
  await expect(page.locator('#ft-narrow-home-quickstart')).toBeVisible();
  await expect(page.locator('#ft-narrow-home-quickstart')).toHaveAttribute(
    'aria-label',
    /Quick Start|快速开始/i
  );
  await expect(page.locator('#ft-narrow-home-honesty')).toBeVisible();
  await expect(page.locator('#ft-narrow-home-honesty')).toBeEnabled();
  await expect(page.locator('#ft-narrow-home-honesty')).toHaveAttribute(
    'aria-disabled',
    'false'
  );
  await expect(page.locator('#ft-narrow-home-honesty')).toHaveAttribute(
    'aria-label',
    /Honesty Check-in|诚实补登/i
  );
  await expect(page.locator('#ft-narrow-home-honesty')).toHaveCSS(
    'opacity',
    '1'
  );
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

  // Honesty lives on home canvas as a ball (not in the drawer)
  await expect(page.locator('#ft-narrow-home-honesty')).toBeVisible();
  await expect(page.locator('#ft-narrow-home-honesty')).toHaveAttribute(
    'aria-label',
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

  // Sound row removed — music via ActionBar ♪
  await expect(
    page.locator('.ft-narrow-sheet__item', { hasText: /^Sound$|声景|声音/i })
  ).toHaveCount(0);
  await expect(
    page.locator('.ft-narrow-sheet__item .ft-secondary-menu-hint-dot').first()
  ).toBeVisible({ timeout: 5_000 });
  await page.locator('#ft-narrow-mute-btn').click();
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

test('375: ActionBar note opens Soundscape panel (same as drawer Sound)', async ({
  page
}) => {
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

  // No force: ActionBar ♪ must sit above drawer backdrop when sheet is open.
  await page.locator('#ft-narrow-mute-btn').click();
  await expect(page.locator('.ambient-soundscape__panel')).toBeVisible({
    timeout: 5_000
  });
  await expect(page.locator('.ambient-soundscape__fab')).not.toBeInViewport();
  await expect(page.locator('.ambient-soundscape__nudge.is-blocked-tip')).toHaveCount(
    0
  );

  // Prefer a track inside the panel — preference flips on (not mute-toggle)
  await page
    .locator('.ambient-soundscape__track')
    .filter({ hasNotText: /Off|关闭|关/i })
    .first()
    .click();
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
  // ActionBar stays; FocusHUD sits below it
  expect(report.hud?.top).toBeGreaterThanOrEqual(60);
  expect(report.hideFab).toBe(true);
  expect(report.chromeVisibility).toBe('hidden');
  // ActionBar owns ? · wall clock · ♪ (no duplicate floating mute)
  await expect(page.locator('.ft-narrow-action-bar')).toBeVisible();
  const clockOk = await page.evaluate(() => {
    const shown = document
      .querySelector('.ft-narrow-action-bar__time')
      ?.textContent?.trim();
    if (!shown || !/^\d{1,2}:\d{2}$/.test(shown)) return { ok: false, shown };
    const now = new Date();
    const candidates = [0, -1, 1].map((minDelta) => {
      const d = new Date(now.getTime() + minDelta * 60_000);
      try {
        return d.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch {
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
      }
    });
    return { ok: candidates.includes(shown), shown, candidates };
  });
  expect(clockOk, JSON.stringify(clockOk)).toMatchObject({ ok: true });
  await expect(page.locator('#ft-narrow-mute-btn')).toBeVisible();
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

/**
 * Fig12 / L259: ? remedy shows one primary tip +「More tips」chip;
 * on narrow park, chip expands **one** drawer-menu tip (not 3 more / 2 more cascade).
 */
test('375 park: ? remedy primary + catalog chip expands one tip at a time', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await expect(page.locator('#ft-narrow-idle-shell')).toBeVisible({
    timeout: 15_000
  });

  await page.locator('#ft-narrow-help-btn').click();

  const before = await page.evaluate(() => {
    const bubbles = [
      ...document.querySelectorAll('ft-onboarding-hint-bubble')
    ].filter((b) => {
      if (b.open === false) return false;
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const chip = document.getElementById('ft-hint-catalog-chip');
    const chipRect = chip?.getBoundingClientRect();
    return {
      count: bubbles.length,
      ids: bubbles.map((b) => b.dataset.hintId),
      chipVisible: Boolean(
        chip &&
          !chip.hidden &&
          chipRect &&
          chipRect.width > 0 &&
          chipRect.top >= 0 &&
          chipRect.top < 667
      ),
      chipText: chip?.textContent?.trim() || ''
    };
  });
  expect(before.count).toBeLessThanOrEqual(2);
  expect(before.count).toBeGreaterThanOrEqual(1);
  expect(before.ids).toContain('sit-button');
  expect(before.chipVisible).toBe(true);
  expect(before.chipText).toMatch(/more tips|更多提示/i);
  // One-shot: no countdown "N more tips"
  expect(before.chipText).not.toMatch(/\d+\s*more|还有\s*\d+/i);

  await page.locator('#ft-hint-catalog-chip').click();

  const after = await page.evaluate(() => {
    const bubbles = [
      ...document.querySelectorAll('ft-onboarding-hint-bubble')
    ].filter((b) => {
      if (b.open === false) return false;
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const chip = document.getElementById('ft-hint-catalog-chip');
    const rects = bubbles.map((b) => {
      const r = b.getBoundingClientRect();
      return {
        id: b.dataset.hintId,
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom
      };
    });
    let overlapPairs = 0;
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        const ix = Math.max(
          0,
          Math.min(a.right, b.right) - Math.max(a.left, b.left)
        );
        const iy = Math.max(
          0,
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        );
        if (ix * iy > 40) overlapPairs += 1;
      }
    }
    return {
      bubbleCount: bubbles.length,
      ids: bubbles.map((b) => b.dataset.hintId),
      chipVisible: Boolean(chip && !chip.hidden),
      overlapPairs
    };
  });
  // Primary + one drawer intro; chip gone (no 3 more / 2 more).
  expect(after.bubbleCount).toBeLessThanOrEqual(2);
  expect(after.bubbleCount).toBeGreaterThanOrEqual(1);
  expect(after.ids).toContain('narrow-drawer-menu');
  expect(after.chipVisible).toBe(false);
  expect(after.overlapPairs).toBe(0);

  // Separation runs after paint — poll so CI does not race the first layout.
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const bubbles = [
            ...document.querySelectorAll('ft-onboarding-hint-bubble')
          ].filter((b) => {
            if (b.open === false) return false;
            const r = b.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
          const rects = bubbles.map((b) => b.getBoundingClientRect());
          let overlapPairs = 0;
          for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
              const a = rects[i];
              const b = rects[j];
              const ix = Math.max(
                0,
                Math.min(a.right, b.right) - Math.max(a.left, b.left)
              );
              const iy = Math.max(
                0,
                Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
              );
              if (ix * iy > 40) overlapPairs += 1;
            }
          }
          return overlapPairs;
        }),
      { timeout: 5_000 }
    )
    .toBe(0);

  // Grabber-anchored drawer intro must sit above home CTAs (not behind the balls).
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const cta = document
            .getElementById('ft-narrow-home-ctas')
            ?.getBoundingClientRect();
          const bubbles = [
            ...document.querySelectorAll('ft-onboarding-hint-bubble')
          ].filter((b) => {
            if (b.open === false) return false;
            const r = b.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
          if (!cta || cta.height <= 0) return { ok: false, reason: 'no-cta' };
          for (const b of bubbles) {
            const r = b.getBoundingClientRect();
            const overlaps =
              r.left < cta.right &&
              r.right > cta.left &&
              r.top < cta.bottom &&
              r.bottom > cta.top;
            if (overlaps) {
              return {
                ok: false,
                reason: 'overlap',
                id: b.dataset.hintId,
                tipBottom: r.bottom,
                ctaTop: cta.top
              };
            }
          }
          return { ok: true };
        }),
      { timeout: 5_000 }
    )
    .toEqual({ ok: true });
});
