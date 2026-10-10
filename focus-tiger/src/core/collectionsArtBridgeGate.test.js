/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLLECTIONS_ART_BRIDGE_SEEN_KEY,
  hasSeenCollectionsArtBridge,
  isCollectionsArtBridgeInView,
  markCollectionsArtBridgeSeen,
  shouldPresentCollectionsArtBridge,
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

test('an owned piece can show the bridge until it has been seen', () => {
  const storage = createMapStorage();
  assert.equal(shouldPresentCollectionsArtBridge(storage, 0), false);
  assert.equal(shouldPresentCollectionsArtBridge(storage, 1), true);
  markCollectionsArtBridgeSeen(storage);
  assert.equal(shouldPresentCollectionsArtBridge(storage, 3), false);
});

test('a sentence below the panel is not in view', () => {
  const panel = { top: 0, bottom: 300 };
  assert.equal(
    isCollectionsArtBridgeInView(
      { top: 400, bottom: 480, height: 80, width: 200 },
      panel
    ),
    false
  );
  assert.equal(
    isCollectionsArtBridgeInView(
      { top: 20, bottom: 100, height: 80, width: 200 },
      panel
    ),
    true
  );
  assert.equal(
    isCollectionsArtBridgeInView(
      { top: 0, bottom: 0, height: 0, width: 0 },
      panel
    ),
    false
  );
});

test('missing storage does not throw and does not show a repeat', () => {
  assert.equal(shouldShowCollectionsArtBridge(null), true);
  assert.equal(hasSeenCollectionsArtBridge(null), false);
  assert.doesNotThrow(() => markCollectionsArtBridgeSeen(null));
});
