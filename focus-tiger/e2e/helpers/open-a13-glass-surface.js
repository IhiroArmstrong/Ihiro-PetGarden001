/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { expect } from '@playwright/test';
import { dismissColdStartOverlay } from './cold-start-overlay.js';
import {
  expandWideMoreMenuGroup,
  openFreshProductShell,
  openWideMoreMenuIfPresent
} from './product-shell.js';
import { MENU_REACHABILITY } from '../../src/core/menuReachabilityContract.js';

/** @type {Readonly<Record<string, string>>} */
const WIDE_MORE_PROXY_GROUP = Object.freeze({
  reminder: 'MENU_GROUP_PREFERENCES',
  language: 'MENU_GROUP_PREFERENCES',
  'today-direction': 'MENU_GROUP_PREFERENCES',
  'system-tts': 'MENU_GROUP_PREFERENCES',
  'help-center': 'MENU_GROUP_PREFERENCES',
  'local-backup': 'MENU_GROUP_PREFERENCES'
});

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
 */
async function closeOpenPanels(page) {
  for (let n = 0; n < 3; n++) {
    await page.keyboard.press('Escape');
  }
  await page.evaluate(() => {
    window.__wideIdleMoreMenu?.setSuppressed?.(false);
    window.__wideIdleMoreMenu?.setIdle?.(true);
  });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('../../src/core/glassCardVisualSurfaces.js').A13GlassVisualSurface} surface
 */
/**
 * @param {import('@playwright/test').Page} page
 * @param {import('../../src/core/glassCardVisualSurfaces.js').A13GlassVisualSurface | null} [surface]
 */
export async function prepareIdleWideShell(page, surface = null) {
  await openFreshProductShell(page, {
    query: { ...(surface?.shellQuery || {}) }
  });
  await dismissColdStartOverlay(page);
  const landscape = page.getByTestId('landscape-suggest-dismiss');
  if (await landscape.isVisible().catch(() => false)) await landscape.click();
  const dismiss = page.getByTestId('today-direction-options-banner-dismiss');
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click({ timeout: 8_000 });
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('../../src/core/glassCardVisualSurfaces.js').A13GlassVisualSurface} surface
 */
export async function openA13GlassSurface(page, surface) {
  await closeOpenPanels(page);

  if (surface.openKind === 'idle-chrome') {
    return;
  }

  if (surface.openKind === 'dev-hook') {
    const globalName = surface.devHookGlobal;
    expect(globalName, `${surface.id} devHookGlobal`).toBeTruthy();
    await page.evaluate((name) => {
      const ui = window[name];
      if (typeof ui?.openPanel === 'function') ui.openPanel();
      else if (typeof ui?.open === 'function') ui.open();
    }, globalName);
    const root = String(surface.rootSelector).split(',')[0].trim();
    await expect(page.locator(root).first()).toBeVisible({ timeout: 8_000 });
    return;
  }

  if (surface.openKind === 'support-fab') {
    await page.locator('#yin-support-fab').click();
    await expect(page.locator('#yin-support-modal')).toHaveClass(/is-visible/, {
      timeout: 8_000
    });
    return;
  }

  if (surface.openKind === 'help-button') {
    await page.locator('#onboarding-hint-help').click();
    await expect(page.locator('#onboarding-app-purpose:not([hidden])')).toBeVisible({
      timeout: 8_000
    });
    return;
  }

  if (surface.openKind === 'sanctuary-nav') {
    await page.locator('#ft-sanctuary-nav-compass-fab').click();
    await expect(
      page.locator('#home-sanctuary-nav-fan-backdrop.is-visible')
    ).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('#home-sanctuary-nav-fan.is-visible')).toHaveClass(
      /is-visible/
    );
    await expect(
      page.locator('#home-sanctuary-nav-fan .home-sanctuary-nav-fan__item').first()
    ).toBeVisible({ timeout: 8_000 });
    return;
  }

  const proxy = surface.menuProxy;
  if (!proxy) throw new Error(`A13 surface ${surface.id} missing menuProxy`);

  if (await openWideMoreMenuIfPresent(page)) {
    await expandAllWideGroups(page);
    const groupKey = WIDE_MORE_PROXY_GROUP[proxy];
    if (groupKey) await expandWideMoreMenuGroup(page, groupKey);
    const row = page.locator(`#ft-wide-more-menu [data-proxy="${proxy}"]`);
    await row.scrollIntoViewIfNeeded();
    await row.click();
  } else {
    throw new Error(`A13 ${surface.id}: wide ⋯ menu not available`);
  }

  const contract = MENU_REACHABILITY[proxy];
  const selector = contract?.resultSelector;
  expect(selector, `${surface.id} reachability`).toBeTruthy();
  await expect(page.locator(selector).first()).toBeVisible({ timeout: 12_000 });
}
