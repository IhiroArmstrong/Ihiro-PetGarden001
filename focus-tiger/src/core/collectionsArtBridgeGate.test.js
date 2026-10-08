/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLLECTIONS_ART_BRIDGE_SEEN_KEY,
  hasSeenCollectionsArtBridge,
  markCollectionsArtBridgeSeen,
  shouldShowCollectionsArtBridge
} from './collectionsArtBridgeGate.js';

function createMapStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    }
  };
}

test('art bridge shows once, then stays hidden', () => {
  const storage = createMapStorage();
  assert.equal(shouldShowCollectionsArtBridge(storage), true);
  assert.equal(hasSeenCollectionsArtBridge(storage), false);
  markCollectionsArtBridgeSeen(storage);
  assert.equal(storage.getItem(COLLECTIONS_ART_BRIDGE_SEEN_KEY), '1');
  assert.equal(shouldShowCollectionsArtBridge(storage), false);
  assert.equal(hasSeenCollectionsArtBridge(storage), true);
});

test('missing storage does not throw and does not show a repeat', () => {
  assert.equal(shouldShowCollectionsArtBridge(null), true);
  assert.equal(hasSeenCollectionsArtBridge(null), false);
  assert.doesNotThrow(() => markCollectionsArtBridgeSeen(null));
});
