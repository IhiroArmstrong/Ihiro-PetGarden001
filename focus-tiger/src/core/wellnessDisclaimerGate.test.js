/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  WELLNESS_DISCLAIMER_SEEN_KEY,
  hasSeenWellnessDisclaimer,
  markWellnessDisclaimerSeen,
  shouldOfferWellnessDisclaimerFirstCard
} from './wellnessDisclaimerGate.js';

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

describe('wellnessDisclaimerGate', () => {
  it('starts unseen and does not auto-offer the first card', () => {
    const storage = memoryStorage();
    assert.equal(hasSeenWellnessDisclaimer(storage), false);
    assert.equal(shouldOfferWellnessDisclaimerFirstCard(storage), false);
    assert.equal(
      shouldOfferWellnessDisclaimerFirstCard(storage, '?product=1'),
      false
    );
  });

  it('markSeen still records lookup; still does not auto-offer', () => {
    const storage = memoryStorage();
    markWellnessDisclaimerSeen(storage);
    assert.equal(storage.getItem(WELLNESS_DISCLAIMER_SEEN_KEY), '1');
    assert.equal(hasSeenWellnessDisclaimer(storage), true);
    assert.equal(shouldOfferWellnessDisclaimerFirstCard(storage), false);
  });

  it('?wellnessFirst=0 never offers; =1 offers even after seen', () => {
    const storage = memoryStorage();
    markWellnessDisclaimerSeen(storage);
    assert.equal(
      shouldOfferWellnessDisclaimerFirstCard(storage, '?product=1&wellnessFirst=0'),
      false
    );
    assert.equal(
      shouldOfferWellnessDisclaimerFirstCard(storage, '?product=1&wellnessFirst=1'),
      true
    );
  });

  it('tolerates missing storage', () => {
    assert.equal(hasSeenWellnessDisclaimer(null), false);
    assert.equal(shouldOfferWellnessDisclaimerFirstCard(undefined), false);
    markWellnessDisclaimerSeen(null);
  });
});
