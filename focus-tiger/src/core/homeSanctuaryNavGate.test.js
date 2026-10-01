/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HOME_SANCTUARY_NAV_SEEN_KEY,
  hasSeenHomeSanctuaryNav,
  markHomeSanctuaryNavSeen,
  shouldShowHomeSanctuaryNavPulse,
  syncHomeSanctuaryNavPulse
} from './homeSanctuaryNavGate.js';

test('home sanctuary nav pulse until first fan open', () => {
  const storage = new Map();
  const ls = {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, v)
  };
  assert.equal(hasSeenHomeSanctuaryNav(ls), false);
  assert.equal(shouldShowHomeSanctuaryNavPulse(ls), true);
  markHomeSanctuaryNavSeen(ls);
  assert.equal(storage.get(HOME_SANCTUARY_NAV_SEEN_KEY), '1');
  assert.equal(shouldShowHomeSanctuaryNavPulse(ls), false);
});

test('syncHomeSanctuaryNavPulse adds and removes blue dot', () => {
  if (typeof document === 'undefined') return;
  const btn = document.createElement('button');
  syncHomeSanctuaryNavPulse(btn, true);
  assert.ok(btn.querySelector('.ft-home-sanctuary-nav-pulse'));
  assert.ok(btn.classList.contains('has-sanctuary-nav-pulse'));
  syncHomeSanctuaryNavPulse(btn, false);
  assert.equal(btn.querySelector('.ft-home-sanctuary-nav-pulse'), null);
});
