import { test, expect } from '@playwright/test';
import {
  openFreshProductShell,
  quickStartFocus
} from './helpers/product-shell.js';

/**
 * Wide Idle (≥480): three home balls (Breath · Sit · Honesty) + ⋯; secondary via popover.
 */

test.use({ viewport: { width: 1280, height: 720 } });

/** Row proxy → click-hint id (Language has none by design). Breath is home ball. */
const WIDE_MORE_ROW_HINT = Object.freeze({
  companion: 'how-shall-we-sit',
  reminder: 'in-app-reminder'
});

/**
 * Sit / idle-after-session auto tip visibility (not geometry vs menu).
 * Auto hideBubble clears `data-hint-id`; also reject `[open]` in case a shell remains.
 * @param {import('@playwright/test').Page} page
 */
async function expectSitAutoTipHidden(page) {
  await expect(
    page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"]')
  ).toHaveCount(0);
  await expect(
    page.locator(
      'ft-onboarding-hint-bubble[data-hint-id="idle-after-session"]'
    )
  ).toHaveCount(0);
  await expect(
    page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"][open]')
  ).toHaveCount(0);
}

test('wide Idle: resident three balls + more; secondary parked', async ({
  page
}) => {
  await openFreshProductShell(page);

  await expect(page.locator('#ft-wide-home-quickstart')).toBeVisible();
  await expect(page.locator('#ft-wide-home-sit')).toBeVisible();
  await expect(page.locator('#ft-wide-home-honesty')).toBeVisible();
  await expect(page.locator('#ft-wide-more-btn')).toBeVisible();

  // Legacy pills parked off-canvas
  await expect(page.locator('#btn-focus')).not.toBeInViewport();
  await expect(page.locator('#quick-start-focus')).not.toBeInViewport();

  // Parked off-canvas — not in the visible bottom cluster
  await expect(page.locator('.session-start-dock__hint')).not.toBeInViewport();
  await expect(page.locator('.ambient-soundscape__fab')).not.toBeInViewport();
  await expect(page.locator('#reminder-preference-toggle')).not.toBeInViewport();

  // Left ? / heatmap stay (out of declutter scope)
  await expect(page.locator('#onboarding-hint-help')).toBeVisible();
  await expect(page.locator('#weekly-practice-heatmap')).toBeVisible();
});

test('wide Idle: Sit ball opens Arrival', async ({ page }) => {
  await openFreshProductShell(page);
  await page.locator('#ft-wide-home-sit').click();
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
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

test('wide Arrival: only Quick Start ball; Sit / Honesty / ⋯ hidden', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#ft-wide-home-sit').click();
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
  await expect(page.locator('#ft-wide-home-sit')).toBeHidden();
  await expect(page.locator('#ft-wide-home-honesty')).toBeHidden();
  await expect(page.locator('#ft-wide-more-btn')).toBeHidden();
  await expect(page.locator('#ft-wide-home-quickstart')).toBeVisible();
});

test('wide Focusing: more + balls hidden; top-right note stays, Sound FAB stays hidden', async ({
  page
}) => {
  await openFreshProductShell(page);
  await quickStartFocus(page);
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 15_000
  });
  await expect(page.locator('#ft-wide-more-btn')).toBeHidden();
  await expect(page.locator('#ft-wide-home-ctas')).toBeHidden();
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

test('wide Idle: ⋯ has no Sound or Honesty row; note opens Soundscape', async ({
  page
}) => {
  await openFreshProductShell(page);
  const more = page.locator('#ft-wide-more-btn');
  await more.click();
  await expect(page.locator('#ft-wide-more-menu [data-proxy="honesty"]')).toHaveCount(
    0
  );
  await expect(page.locator('#ft-wide-more-menu [data-proxy="sound"]')).toHaveCount(0);
  await expect(page.locator('#ft-wide-home-honesty')).toBeVisible();
  await expect(
    page.locator('#ft-wide-more-menu .ft-secondary-menu-hint-dot').first()
  ).toBeVisible({ timeout: 5_000 });
  await page.keyboard.press('Escape');
  await page.locator('.ambient-soundscape__mute').click();
  await expect(page.locator('.ambient-soundscape__panel')).toBeVisible({
    timeout: 5_000
  });
  await expect(page.locator('.ambient-soundscape__fab')).not.toBeInViewport();
  await expect(page.locator('.ambient-soundscape__nudge.is-blocked-tip')).toHaveCount(0);
});

test('wide ⋯: unread row mint only — no floating badge double', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#ft-wide-more-btn').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible({ timeout: 5_000 });

  // Row host mint stays (unread).
  await expect(
    menu.locator('[data-proxy="companion"] .ft-secondary-menu-hint-dot')
  ).toBeVisible({ timeout: 5_000 });
  await expect(
    menu.locator('[data-proxy="reminder"] .ft-secondary-menu-hint-dot')
  ).toBeVisible();
  // Breath practice is home ball — not a ⋯ row.
  await expect(menu.locator('[data-proxy="breath"]')).toHaveCount(0);

  // No second floating mint parked on those click hints while ⋯ is open.
  await expect(
    page.locator('.onboarding-hint-badge[data-hint-id="how-shall-we-sit"]:not([hidden])')
  ).toHaveCount(0);
  await expect(
    page.locator('.onboarding-hint-badge[data-hint-id="in-app-reminder"]:not([hidden])')
  ).toHaveCount(0);

  // Language row: no first-visit mint (by design).
  await expect(
    menu.locator('[data-proxy="language"] .ft-secondary-menu-hint-dot')
  ).toHaveCount(0);
});

/**
 * Independent of row hover / geometry-vs-menu: while ⋯ is open, Sit auto tip
 * must not be visible — including immediately after open, before any hover.
 * (2026-08-02: prior e2e only checked "does not overlap menu rect" → false green.)
 */
test('wide ⋯: Sit auto tip hidden while menu open (no hover required)', async ({
  page
}) => {
  await openFreshProductShell(page);
  // Give Idle a beat so sit-button may auto-paint, then open ⋯ must clear it.
  await page.waitForTimeout(500);
  await page.locator('#ft-wide-more-btn').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible({ timeout: 5_000 });

  await expectSitAutoTipHidden(page);
  await page.waitForTimeout(400);
  await expectSitAutoTipHidden(page);
});

/**
 * Row tip matrix + row-switch: companion/reminder show tips; Language has none;
 * Breath is not a ⋯ row; Sit auto tip must stay hidden across switches.
 */
test('wide ⋯: row hover tip matrix + no Sit tip flash on switch', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#ft-wide-more-btn').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible({ timeout: 5_000 });

  const proxies = /** @type {const} */ ([
    'companion',
    'reminder',
    'language',
    'zen-cinema',
    'daily-quote'
  ]);

  for (let i = 0; i < proxies.length; i++) {
    const proxy = proxies[i];
    await menu.locator(`[data-proxy="${proxy}"]`).hover();
    await page.waitForTimeout(250);

    const hintId = WIDE_MORE_ROW_HINT[proxy];
    if (hintId) {
      await expect(
        page.locator(
          `ft-onboarding-hint-bubble[data-hint-id="${hintId}"][open]`
        )
      ).toBeVisible({ timeout: 5_000 });
    } else {
      // Language / Zen Cinema / Quiet Line: no dedicated tip — prior row click tips must be closed (`[open]`).
      for (const id of Object.values(WIDE_MORE_ROW_HINT)) {
        await expect(
          page.locator(
            `ft-onboarding-hint-bubble[data-hint-id="${id}"][open]`
          )
        ).toHaveCount(0);
      }
    }

    await expectSitAutoTipHidden(page);
  }

  // Explicit switch path: companion → reminder → language (no Sit flash).
  for (const proxy of ['companion', 'reminder', 'language']) {
    await menu.locator(`[data-proxy="${proxy}"]`).hover();
    await page.waitForTimeout(300);
    await expectSitAutoTipHidden(page);
  }
});

test('wide Idle: Zen Cinema row opens confirm card', async ({ page }) => {
  await openFreshProductShell(page);
  await page.locator('#ft-wide-more-btn').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible({ timeout: 5_000 });
  await expect(menu.locator('[data-proxy="zen-cinema"]')).toBeVisible();
  await menu.locator('[data-proxy="zen-cinema"]').click();
  const card = page.locator('#zen-cinema-card');
  await expect(card).toBeVisible({ timeout: 5_000 });
  await expect(card.locator('.zen-cinema-card__thumb')).toBeVisible();
  await expect(page.getByTestId('zen-cinema-open-youtube')).toBeVisible();
  await card.locator('.zen-cinema-card__btn--ghost').click();
  await expect(card).toBeHidden({ timeout: 5_000 });
  await page.locator('#ft-wide-more-btn').click();
  await expect(menu).toBeVisible({ timeout: 5_000 });
  await menu.locator('[data-proxy="zen-cinema"]').click();
  await expect(card).toBeVisible({ timeout: 5_000 });
});

test('wide Idle: Quiet Line row opens quote card and save stays available', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#ft-wide-more-btn').click();
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible({ timeout: 5_000 });
  await expect(menu.locator('[data-proxy="daily-quote"]')).toBeVisible();
  await menu.locator('[data-proxy="daily-quote"]').click();
  const card = page.locator('#daily-zen-quote-card');
  await expect(card).toBeVisible({ timeout: 5_000 });
  await expect(page.getByTestId('daily-zen-quote-text')).not.toBeEmpty();
  await expect(page.getByTestId('daily-zen-quote-save')).toBeVisible();
  await card.locator('.daily-zen-quote-card__btn--ghost').click();
  await expect(card).toBeHidden({ timeout: 5_000 });
  // Reflow: reopen menu → card again
  await page.locator('#ft-wide-more-btn').click();
  await expect(menu).toBeVisible({ timeout: 5_000 });
  await menu.locator('[data-proxy="daily-quote"]').click();
  await expect(card).toBeVisible({ timeout: 5_000 });
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

test('wide park: ? opens purpose only (no remedy tip spray)', async ({ page }) => {
  await openFreshProductShell(page);
  const more = page.locator('#ft-wide-more-btn');
  await expect(more).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/ft-wide-park-secondary/);
  await expect(
    page.locator('.onboarding-hint-badge[data-hint-id="quick-start"]')
  ).toBeVisible({
    timeout: 8_000
  });
  await page.locator('#onboarding-hint-help').click();
  await expect(page.locator('#onboarding-app-purpose:not([hidden])')).toBeVisible({
    timeout: 8_000
  });
  await expect(page.locator('ft-onboarding-hint-bubble[data-remedy="1"]')).toHaveCount(
    0
  );
  await expect(
    page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"]')
  ).toHaveCount(0);
  await expect(page.locator('#ft-hint-catalog-chip')).toBeHidden();
});
