/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BESIDE_UNUSED_QUOTA,
  besideSeatBlocksSit,
  isBesideSeatClientEnabled,
  normalizeBesideCode,
  readBesideJoinQueryCode
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
