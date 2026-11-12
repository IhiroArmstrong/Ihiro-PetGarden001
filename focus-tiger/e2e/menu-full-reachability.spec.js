/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import {
  expandWideMoreMenuGroup,
  expectWideMoreMenuShellVisible,
  openFreshProductShell
} from './helpers/product-shell.js';
import { wideMoreMenuGroupForProxy } from '../src/core/wideMenuRadialLayout.js';
import {
  MENU_RESULT_FORBIDDEN_TEXT,
  listMenuReachabilityRows
} from '../src/core/menuReachabilityContract.js';

/**
 * A1: click every Idle ⋯ / drawer row from the shared catalog and assert a
 * real result (visible panel + non-empty text, or an external open).
 * Stay on one page (Escape between rows). Per-row reload saturated CI
 * preview (:5199) on #1173 — page.reload 30s, then later smoke goto hung.
 * Wide + narrow share one openFreshProductShell: a second goto after the
 * wide walk killed preview on CI (narrow TimeoutError 40s). Knife 3 radial
 * expands a group per row on wide — CI needs >240s for wide+narrow in one test.
 */

test.setTimeout(480_000);
test.describe.configure({ retries: 0 });

const FORBIDDEN = MENU_RESULT_FORBIDDEN_TEXT;

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name === 'local-acceptance',
    'smoke / CI use the chromium project'
  );
});

/**
 * @param {import('@playwright/test').Page} page
 */
async function stubPopups(page) {
  await page.evaluate(() => {
    window.__ftMenuPopups = [];
    if (window.__ftMenuPopupsPatched) return;
    window.__ftMenuPopupsPatched = true;
    window.open = (url, target, features) => {
      window.__ftMenuPopups.push({
        url: String(url || ''),
        target: String(target || ''),
        features: String(features || '')
      });
      return null;
    };
  });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function prepareIdle(page) {
  await dismissColdStartOverlay(page);
  const landscape = page.getByTestId('landscape-suggest-dismiss');
  if (await landscape.isVisible().catch(() => false)) await landscape.click();
  const dismiss = page.getByTestId('today-direction-options-banner-dismiss');
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click({ timeout: 8_000 });
  }
  await stubPopups(page);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'wide-more' | 'narrow-drawer'} surface
 */
async function settleAfterRow(page) {
  await page.evaluate(() => {
    const names = [
      '__coldStartGoalCard',
      '__fiveMomentsCompass',
      '__companionModePicker',
      '__homeSanctuaryNavFan',
      '__helpCenter',
      '__journeyLog',
      '__languagePreference',
      '__localPracticeDataPanel',
      '__emailJourneyRestorePanel',
      '__quietTogetherPanel',
      '__focusCirclePanel',
      '__zenCinemaCard',
      '__presenceSignalsPanel',
      '__dailyZenQuoteCard',
      '__mustardSeedCard',
      '__artCollectionPanel',
      '__digitalWallpapersCard',
      '__yinCoinPanel',
      '__groundExerciseChoice',
      '__membershipUnlock',
      '__newsletterCapture',
      '__honestyCheckInUI',
      '__ritualFlowUI',
      '__inAppReminder',
      '__mindflowNebulaPreference',
      '__presenceFieldPreference',
      '__healthShortcutLogPreference'
    ];
    for (const name of names) {
      const ui = window[name];
      if (!ui) continue;
      try {
        ui.close?.();
      } catch {
        /* some close() assumes handlers.onClose */
      }
      try {
        ui.hide?.();
      } catch {
        /* ignore */
      }
      try {
        ui.closePanel?.();
      } catch {
        /* ignore */
      }
    }
    window.__inAppReminder?.settings?.closePanel?.();
    window.__inAppReminder?.settings?.close?.();
    window.__wideIdleMoreMenu?.closeMenu?.();
    window.__wideIdleMoreMenu?.releaseInactivePresentation?.();
    window.__wideIdleMoreMenu?.setSuppressed?.(false);
    window.__wideIdleMoreMenu?.setIdle?.(true);
    window.__narrowIdleShell?.setSuppressed?.(false);
    window.__narrowIdleShell?.setIdle?.(true);
    const ritual = window.__ritualFlowUI;
    try {
      if (ritual?.isOpen?.()) ritual.leave?.();
      else ritual?.hide?.();
    } catch {
      /* production builds do not publish __ritualFlowUI */
    }
  });
  for (let n = 0; n < 2; n++) {
    await page.keyboard.press('Escape');
  }
  await dismissRitualFlow(page);
}

/**
 * Scrollable menus (especially narrow drawer + heatmap) can fail Playwright's
 * "element stable" gate while the sheet is still settling on CI.
 *
 * @param {import('@playwright/test').Locator} item
 */
async function scrollMenuRowIntoView(item) {
  await item.evaluate((el) => {
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'wide-more' | 'narrow-drawer'} surface
 */

/**
 * Production `npm run build` does not set `window.__ritualFlowUI` (DEV only).
 * The open card stays `pointer-events: auto` over the bottom of the narrow
 * drawer, so the last ritual row's click never reaches the menu. Leave is
 * the real control on every ritual step.
 *
 * @param {import('@playwright/test').Page} page
 */
async function dismissRitualFlow(page) {
  const leave = page.locator('#ritual-flow [data-ritual-leave]');
  if ((await leave.count()) > 0) {
    await leave.first().click({ timeout: 2_000, force: true }).catch(() => {});
  }
}

/**
 * Close growth cards through their own close path.
 * Do not strip `.is-visible` — a painted-over scrim still eats the next click.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>} remaining `.ft-overlay-backdrop.is-visible` count
 */
async function dismissVisibleGrowthBackdrops(page) {
  await page.evaluate(() => {
    for (const name of [
      '__yinCoinPanel',
      '__zenCinemaCard',
      '__dailyZenQuoteCard'
    ]) {
      const ui = window[name];
      if (!ui) continue;
      try {
        ui.close?.();
      } catch {
        /* ignore */
      }
      try {
        ui.closePanel?.();
      } catch {
        /* ignore */
      }
      try {
        ui.hide?.();
      } catch {
        /* ignore */
      }
    }
  });
  const coinBackdrop = page.getByTestId('yin-coin-panel-backdrop');
  if (await coinBackdrop.isVisible().catch(() => false)) {
    await coinBackdrop.click({ position: { x: 12, y: 12 }, timeout: 4_000 }).catch(() => {});
  }
  for (let n = 0; n < 4; n += 1) {
    const backdrop = page.locator('.ft-overlay-backdrop.is-visible').first();
    if ((await backdrop.count()) === 0) break;
    if (!(await backdrop.isVisible().catch(() => false))) break;
    await backdrop.click({ position: { x: 8, y: 8 }, timeout: 2_000 }).catch(() => {});
  }
  return page.locator('.ft-overlay-backdrop.is-visible').count();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} item
 */
async function clickBlockerSummary(page, item) {
  return item.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
      return { owns: true, desc: 'offscreen', x: Math.round(x), y: Math.round(y) };
    }
    const top = document.elementFromPoint(x, y);
    const owns = Boolean(top && (top === el || el.contains(top)));
    const id = top?.id ? `#${top.id}` : '';
    const testId = top?.getAttribute?.('data-testid');
    const proxy = top?.getAttribute?.('data-proxy');
    const desc = top
      ? `${top.tagName.toLowerCase()}${id}${testId ? `[data-testid=${testId}]` : ''}${proxy ? `[data-proxy=${proxy}]` : ''}`
      : 'none';
    return { owns, desc, x: Math.round(x), y: Math.round(y) };
  });
}

async function openMenu(page, surface) {
  await settleAfterRow(page);
  await dismissVisibleGrowthBackdrops(page);
  if (surface === 'wide-more') {
    const btn = page.locator('#ft-wide-more-btn');
    await expect(btn, '⋯ available').toBeVisible({ timeout: 8_000 });
    const shellVisible = await page
      .locator(
        '#ft-wide-more-radial:not([hidden]), #ft-wide-more-menu:not([hidden])'
      )
      .first()
      .isVisible()
      .catch(() => false);
    if (!shellVisible) {
      // CI can re-show growth backdrops (e.g. #yin-coin-panel-backdrop) while Playwright
      // retries the click — dismiss + click inside the same poll so count=0 cannot race
      // with a backdrop that pops back before the separate btn.click().
      await expect
        .poll(
          async () => {
            await dismissVisibleGrowthBackdrops(page);
            if ((await page.locator('.ft-overlay-backdrop.is-visible').count()) > 0) {
              return false;
            }
            try {
              await btn.click({ timeout: 500 });
              return true;
            } catch {
              return false;
            }
          },
          { timeout: 15_000 }
        )
        .toBe(true);
    }
    await expectWideMoreMenuShellVisible(page);
    return;
  }
  const grabber = page.locator('.ft-narrow-grabber');
  await expect(grabber, 'drawer grabber').toBeVisible({ timeout: 8_000 });
  const drawer = page.locator('#ft-narrow-options-drawer');
  await expect
    .poll(
      async () => {
        const left = await dismissVisibleGrowthBackdrops(page);
        if ((await drawer.getAttribute('aria-hidden')) === 'false') return 'open';
        if (left > 0) {
          const ids = await page
            .locator('.ft-overlay-backdrop.is-visible')
            .evaluateAll((els) =>
              els
                .map((el) => el.id || el.getAttribute('data-testid') || 'backdrop')
                .join(',')
            );
          return `blocked ${ids}`;
        }
        try {
          await grabber.click({ timeout: 1_000 });
        } catch (err) {
          return `grabber ${err instanceof Error ? err.message : 'click failed'}`;
        }
        if ((await drawer.getAttribute('aria-hidden')) === 'false') return 'open';
        return grabber.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          const top = document.elementFromPoint(x, y);
          const id = top?.id ? `#${top.id}` : '';
          const testId = top?.getAttribute?.('data-testid');
          return `closed top=${top ? top.tagName.toLowerCase() : 'none'}${id}${testId ? `[data-testid=${testId}]` : ''}`;
        });
      },
      { timeout: 12_000 }
    )
    .toBe('open');
  await expect(drawer.locator('.ft-narrow-sheet__list [data-proxy]').first()).toBeVisible({
    timeout: 8_000
  });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('../src/core/menuReachabilityContract.js').MenuReachContract} contract
 * @param {string} proxy
 */
async function assertOpenedResult(page, contract, proxy) {
  if (contract.kind === 'open-external') {
    const needle = contract.popupUrlIncludes || '';
    // Wide/narrow menus dispatch on rAF after click — wait for the stub.
    await expect
      .poll(
        async () => {
          const pops = await page.evaluate(() => window.__ftMenuPopups || []);
          return pops.some((p) => String(p.url).includes(needle));
        },
        { timeout: 8_000 }
      )
      .toBeTruthy();
    return;
  }
  const selector = contract.resultSelector;
  expect(selector, `${proxy} resultSelector`).toBeTruthy();
  const result = page.locator(selector).first();
  await expect
    .poll(
      async () => {
        if (await result.isVisible().catch(() => false)) return 'visible';
        return page.evaluate((name) => {
          const x = Math.floor(window.innerWidth / 2);
          const y = Math.floor(window.innerHeight / 2);
          const node = document.elementFromPoint(x, y);
          if (!node) return `hidden ${name} top=none @${x},${y}`;
          const id = node.id ? `#${node.id}` : '';
          const testId = node.getAttribute('data-testid');
          const rowProxy = node.getAttribute('data-proxy');
          return `hidden ${name} top=${node.tagName.toLowerCase()}${id}${testId ? `[data-testid=${testId}]` : ''}${rowProxy ? `[data-proxy=${rowProxy}]` : ''} @${x},${y}`;
        }, proxy);
      },
      { timeout: 8_000 }
    )
    .toBe('visible');
  const text = ((await result.innerText()) || '').trim();
  if (proxy !== 'sanctuary-nav') {
    expect(text.length, `${proxy} non-empty text`).toBeGreaterThan(0);
  } else {
    await expect(
      page.locator('#home-sanctuary-nav-fan .home-sanctuary-nav-fan__item').first()
    ).toBeVisible();
  }
  expect(text, `${proxy} no leftover junk`).not.toMatch(FORBIDDEN);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'wide-more' | 'narrow-drawer'} surface
 * @param {string} menuSelector
 */
async function walkMenu(page, surface, menuSelector) {
  const rows = listMenuReachabilityRows(surface);
  const clickable = rows.filter(
    (r) =>
      r.contract.kind === 'open-panel' || r.contract.kind === 'open-external'
  );
  const inert = rows.filter(
    (r) =>
      r.contract.kind === 'static-row' || r.contract.kind === 'locked-row'
  );

  /** @type {string[]} */
  const opened = [];
  await prepareIdle(page);
  for (const row of clickable) {
    await openMenu(page, surface);
    if (surface === 'wide-more') {
      const groupKey = wideMoreMenuGroupForProxy(row.proxy);
      if (groupKey) await expandWideMoreMenuGroup(page, groupKey);
    }
    const item = page.locator(`${menuSelector} [data-proxy="${row.proxy}"]`);
    await scrollMenuRowIntoView(item);
    await expect(item, `row ${row.proxy} listed`).toBeVisible({
      timeout: 8_000
    });
    await item.evaluate((el) => {
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
    if (row.proxy === 'reminder') await item.hover();
    const blocker = await clickBlockerSummary(page, item);
    expect(
      blocker.owns,
      `${row.proxy} click blocked by ${blocker.desc} @${blocker.x},${blocker.y} (${surface})`
    ).toBe(true);
    await item.click({
      timeout: surface === 'narrow-drawer' ? 30_000 : 20_000
    });
    await assertOpenedResult(page, row.contract, row.proxy);
    await expect
      .poll(
        async () => {
          await settleAfterRow(page);
          const backdrops = await dismissVisibleGrowthBackdrops(page);
          const ritualLeft = await page.locator('#ritual-flow').count();
          return backdrops === 0 && ritualLeft === 0;
        },
        {
          timeout: 12_000,
          message: `menu row ${row.proxy} (${surface}) still open: visible backdrop or #ritual-flow`
        }
      )
      .toBe(true);
    opened.push(row.proxy);
  }

  await openMenu(page, surface);
  for (const row of inert) {
    if (surface === 'wide-more') {
      const groupKey = wideMoreMenuGroupForProxy(row.proxy);
      if (groupKey) await expandWideMoreMenuGroup(page, groupKey);
    }
    const item = page.locator(`${menuSelector} [data-proxy="${row.proxy}"]`);
    await scrollMenuRowIntoView(item);
    await expect(item, `inert ${row.proxy}`).toBeVisible();
    await expect(item).toBeDisabled();
  }

  expect(opened).toEqual(clickable.map((r) => r.proxy));
}

test('menu full reachability · wide Idle ⋯ then narrow drawer', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await walkMenu(page, 'wide-more', '#ft-wide-more-menu');
  await settleAfterRow(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'));
    window.__wideIdleMoreMenu?.releaseInactivePresentation?.();
  });
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(max-width: 479px)').matches))
    .toBe(true);
  await expect(page.locator('#ft-narrow-idle-shell')).toBeVisible({
    timeout: 15_000
  });
  await expect(
    page.locator('#ft-wide-more-backdrop'),
    'wide ⋯ scrim must not cover the narrow drawer'
  ).toBeHidden();
  await settleAfterRow(page);
  await walkMenu(page, 'narrow-drawer', '#ft-narrow-options-drawer');
});
