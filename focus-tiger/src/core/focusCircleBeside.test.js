/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BESIDE_UNUSED_QUOTA,
  besideSeatBlocksSit,
  besideSeatFigures,
  isBesideSeatClientEnabled,
  normalizeBesideCode,
  noteBesideSelfSeated,
  readBesideJoinQueryCode,
  readBesideSnapshot
} from './focusCircleBeside.js';

test('beside seat code is 8 characters and does not block sit', () => {
  assert.equal(BESIDE_UNUSED_QUOTA, 5);
  assert.equal(besideSeatBlocksSit(), false);
  assert.equal(normalizeBesideCode(' abcd2345 '), 'ABCD2345');
  assert.equal(normalizeBesideCode('ABCD23'), null);
  assert.equal(readBesideJoinQueryCode('?besideJoin=abcd2345'), 'ABCD2345');
  assert.equal(isBesideSeatClientEnabled('?besideSeat=0'), false);
  assert.equal(isBesideSeatClientEnabled('?focusCircle=0'), false);
});

test('five circle members draw five outlines, and only seated invitees are marked', () => {
  assert.deepEqual(besideSeatFigures({ memberCount: 5, seatedCount: 2 }), {
    total: 5,
    seated: 2
  });
  assert.deepEqual(besideSeatFigures({ memberCount: 12, seatedCount: 9 }), {
    total: 8,
    seated: 8
  });
  assert.deepEqual(besideSeatFigures({ memberCount: 3, seatedCount: 0 }), {
    total: 3,
    seated: 0
  });
});

test('sitting down with a code marks at least one figure before status returns', () => {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
  noteBesideSelfSeated(storage);
  assert.equal(readBesideSnapshot(storage)?.besideSeatedCount, 1);
  noteBesideSelfSeated(storage);
  assert.equal(readBesideSnapshot(storage)?.besideSeatedCount, 1);
});
