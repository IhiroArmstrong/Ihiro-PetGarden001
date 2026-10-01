/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  LANDSCAPE_HINT_STORAGE_KEY,
  readLandscapeSuggestDismissed,
  shouldShowLandscapeSuggest,
  writeLandscapeSuggestDismissed
} from './landscapeSuggestGate.js';

describe('landscapeSuggestGate', () => {
  it('shows only on narrow portrait before dismiss', () => {
    assert.equal(
      shouldShowLandscapeSuggest({
        narrow: true,
        portrait: true,
        dismissed: false
      }),
      true
    );
    assert.equal(
      shouldShowLandscapeSuggest({
        narrow: false,
        portrait: true,
        dismissed: false
      }),
      false
    );
    assert.equal(
      shouldShowLandscapeSuggest({
        narrow: true,
        portrait: false,
        dismissed: false
      }),
      false
    );
    assert.equal(
      shouldShowLandscapeSuggest({
        narrow: true,
        portrait: true,
        dismissed: true
      }),
      false
    );
  });

  it('persists dismiss', () => {
    const bag = new Map();
    const storage = {
      getItem: (k) => (bag.has(k) ? bag.get(k) : null),
      setItem: (k, v) => bag.set(k, v)
    };
    assert.equal(readLandscapeSuggestDismissed(storage), false);
    writeLandscapeSuggestDismissed(storage);
    assert.equal(bag.get(LANDSCAPE_HINT_STORAGE_KEY), '1');
    assert.equal(readLandscapeSuggestDismissed(storage), true);
  });
});
