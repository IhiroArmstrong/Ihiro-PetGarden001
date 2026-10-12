/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import {
  expandWideMoreMenuGroup,
  openFreshProductShell
} from './helpers/product-shell.js';
import {
  MENU_RESULT_FORBIDDEN_TEXT,
  listMenuReachabilityRows
} from '../src/core/menuReachabilityContract.js';

/**
 * A1: click every Idle ⋯ / drawer row from the shared catalog and assert a
 * real result (visible panel + non-empty text, or an external open).
 * Reload between clickable rows so leftover overlays cannot swallow ⋯.
 */

test.setTimeout(300_000);

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
  const dismiss = page.getByTestId('today-direction-options-banner-dismiss');
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
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
async function openMenu(page, surface) {
  if (surface === 'wide-more') {
    await page.locator('#ft-wide-more-btn').click();
    await expect(page.locator('#ft-wide-more-menu')).toBeVisible({
      timeout: 8_000
    });
    await expandAllWideGroups(page);
    return;
  }
  await page.locator('.ft-narrow-grabber').click();
  await expect(page.locator('#ft-narrow-options-drawer')).toHaveAttribute(
    'aria-hidden',
    'false',
    { timeout: 8_000 }
  );
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
  for (let i = 0; i < clickable.length; i++) {
    const row = clickable[i];
    if (i > 0) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
        timeout: 35_000
      });
    }
    await prepareIdle(page);
    await openMenu(page, surface);
    const item = page.locator(`${menuSelector} [data-proxy="${row.proxy}"]`);
    await item.scrollIntoViewIfNeeded();
    await expect(item, `row ${row.proxy} listed`).toBeVisible({
      timeout: 8_000
    });
    if (row.proxy === 'reminder') await item.hover();
    await item.click();
    await assertOpenedResult(page, row.contract, row.proxy);
    opened.push(row.proxy);
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 35_000
  });
  await prepareIdle(page);
  await openMenu(page, surface);
  for (const row of inert) {
    const item = page.locator(`${menuSelector} [data-proxy="${row.proxy}"]`);
    await item.scrollIntoViewIfNeeded();
    await expect(item, `inert ${row.proxy}`).toBeVisible();
    await expect(item).toBeDisabled();
  }

  expect(opened).toEqual(clickable.map((r) => r.proxy));
}

test('menu full reachability · wide Idle ⋯', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page);
  await walkMenu(page, 'wide-more', '#ft-wide-more-menu');
});

test('menu full reachability · narrow Idle drawer', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await walkMenu(page, 'narrow-drawer', '#ft-narrow-options-drawer');
});
