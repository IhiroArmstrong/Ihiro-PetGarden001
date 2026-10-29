/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MENU_REACHABILITY,
  PRODUCT_IDLE_MENU_VISIBILITY,
  listMenuReachabilityRows
} from './menuReachabilityContract.js';
import { listSecondaryChromeEntries } from './idleChromeOrchestration.js';
import { wideMoreMenuGroupForProxy } from './wideMenuRadialLayout.js';

describe('menuReachabilityContract', () => {
  it('covers every catalog proxy on wide and narrow Idle product=1', () => {
    for (const surface of /** @type {const} */ ([
      'wide-more',
      'narrow-drawer'
    ])) {
      const catalog = listSecondaryChromeEntries(
        surface,
        PRODUCT_IDLE_MENU_VISIBILITY
      );
      const proxies = catalog.filter((e) => e.proxy).map((e) => e.proxy);
      assert.ok(proxies.includes('art-collection'), surface);
      const rows = listMenuReachabilityRows(surface);
      assert.deepEqual(
        rows.map((r) => r.proxy),
        proxies
      );
    }
  });

  it('treats default rituals as locked but clickable membership opens', () => {
    const rows = listMenuReachabilityRows('wide-more');
    const morning = rows.find((r) => r.proxy === 'ritual-morning');
    assert.equal(morning?.locked, true);
    assert.equal(morning?.interactive, true);
    assert.equal(morning?.contract.kind, 'open-panel');
    assert.equal(morning?.contract.resultSelector, '#yin-membership-card');
  });

  it('treats account placeholder as a static row', () => {
    const rows = listMenuReachabilityRows('wide-more');
    const account = rows.find((r) => r.proxy === 'account');
    assert.equal(account?.interactive, false);
    assert.equal(account?.contract.kind, 'static-row');
  });

  it('maps every wide-more clickable row to a menu group for e2e walk', () => {
    const rows = listMenuReachabilityRows('wide-more');
    const clickable = rows.filter(
      (r) =>
        r.contract.kind === 'open-panel' || r.contract.kind === 'open-external'
    );
    for (const row of clickable) {
      assert.ok(
        wideMoreMenuGroupForProxy(row.proxy),
        `${row.proxy} needs WIDE_MORE_PROXY_MENU_GROUP (collapsed group hides row in menu-full-reachability)`
      );
    }
  });

  it('every open-panel mapping has a result selector', () => {
    for (const [proxy, contract] of Object.entries(MENU_REACHABILITY)) {
      if (contract.kind === 'open-panel') {
        assert.ok(
          contract.resultSelector,
          `${proxy} open-panel needs resultSelector`
        );
      }
      if (contract.kind === 'open-external') {
        assert.ok(
          contract.popupUrlIncludes,
          `${proxy} open-external needs popupUrlIncludes`
        );
      }
    }
  });
});
