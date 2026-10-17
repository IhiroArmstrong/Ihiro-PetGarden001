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
 */
async function expandAllWideGroups(page) {
  const headers = page.locator(
    '#ft-wide-more-menu .ft-wide-more__section-header[data-group]'
  );
  const n = await headers.count();
  for (let i = 0; i < n; i++) {
    const header = headers.nth(i);
    const group = await header.getAttribute('data-group');
    if (group) await expandWideMoreMenuGroup(page, group);
  }
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
      '__inAppReminder'
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
  });
  for (let n = 0; n < 2; n++) {
    await page.keyboard.press('Escape');
  }
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
async function openMenu(page, surface) {
  await settleAfterRow(page);
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
      await btn.click();
    }
    await expectWideMoreMenuShellVisible(page);
    const radial = page.locator('#ft-wide-more-radial');
    if (!(await radial.isVisible().catch(() => false))) {
      await expandAllWideGroups(page);
    }
    return;
  }
  const grabber = page.locator('.ft-narrow-grabber');
  await expect(grabber, 'drawer grabber').toBeVisible({ timeout: 8_000 });
  const drawer = page.locator('#ft-narrow-options-drawer');
  if ((await drawer.getAttribute('aria-hidden')) !== 'false') {
    await grabber.click();
  }
  await expect(drawer).toHaveAttribute('aria-hidden', 'false', {
    timeout: 8_000
  });
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
  await expect(result, `${proxy} result visible`).toBeVisible({
    timeout: 8_000
  });
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
    if (row.proxy === 'reminder') await item.hover();
    await item.click({
      timeout: surface === 'narrow-drawer' ? 30_000 : 20_000
    });
    await assertOpenedResult(page, row.contract, row.proxy);
    opened.push(row.proxy);
    await settleAfterRow(page);
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
