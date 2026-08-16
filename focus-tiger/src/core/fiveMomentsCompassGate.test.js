/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FIVE_MOMENTS_COMPASS_SEEN_KEY,
  hasSeenFiveMomentsCompass,
  markFiveMomentsCompassSeen,
  resolveFiveMomentAction,
  shouldOfferFiveMomentsCompassFirstCard
} from './fiveMomentsCompassGate.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('fiveMomentsCompassGate', () => {
  it('starts unseen and offers first card', () => {
    const storage = memoryStorage();
    assert.equal(hasSeenFiveMomentsCompass(storage), false);
    assert.equal(shouldOfferFiveMomentsCompassFirstCard(storage), true);
  });

  it('markSeen stops offering', () => {
    const storage = memoryStorage();
    markFiveMomentsCompassSeen(storage);
    assert.equal(storage.getItem(FIVE_MOMENTS_COMPASS_SEEN_KEY), '1');
    assert.equal(hasSeenFiveMomentsCompass(storage), true);
    assert.equal(shouldOfferFiveMomentsCompassFirstCard(storage), false);
  });

  it('tolerates missing storage', () => {
    assert.equal(hasSeenFiveMomentsCompass(null), false);
    assert.equal(shouldOfferFiveMomentsCompassFirstCard(undefined), true);
    markFiveMomentsCompassSeen(null);
  });

  it('resolveFiveMomentAction maps chips to existing surfaces', () => {
    assert.deepEqual(resolveFiveMomentAction('arrive'), { type: 'arrival' });
    assert.deepEqual(resolveFiveMomentAction('focus'), { type: 'companion' });
    assert.deepEqual(resolveFiveMomentAction('recover'), {
      type: 'ritual',
      proxy: 'ritual-emotional-reset'
    });
    assert.deepEqual(resolveFiveMomentAction('transition'), {
      type: 'ritual',
      proxy: 'ritual-work-transition'
    });
    assert.deepEqual(resolveFiveMomentAction('reflect'), {
      type: 'journey-log'
    });
    assert.equal(resolveFiveMomentAction('nope'), null);
  });
});
