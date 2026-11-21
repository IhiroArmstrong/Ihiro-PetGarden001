/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HOME_SANCTUARY_NAV_SEEN_KEY,
  hasSeenHomeSanctuaryNav,
  markHomeSanctuaryNavSeen,
  shouldShowHomeSanctuaryNavPulse
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
