import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FIVE_MOMENTS_COMPASS_SEEN_KEY,
  hasSeenFiveMomentsCompass,
  markFiveMomentsCompassSeen,
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
});
