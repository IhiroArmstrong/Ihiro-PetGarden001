/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LATE_NIGHT_END_HOUR,
  LATE_NIGHT_HOUR,
  isLateNightHour
} from './lateNightHour.js';

test('isLateNightHour matches wellness: ≥23 or <06', () => {
  assert.equal(LATE_NIGHT_HOUR, 23);
  assert.equal(LATE_NIGHT_END_HOUR, 6);
  assert.equal(isLateNightHour(new Date('2026-08-20T23:00:00')), true);
  assert.equal(isLateNightHour(new Date('2026-08-20T02:00:00')), true);
  assert.equal(isLateNightHour(new Date('2026-08-20T05:59:00')), true);
  assert.equal(isLateNightHour(new Date('2026-08-20T06:00:00')), false);
  assert.equal(isLateNightHour(new Date('2026-08-20T15:00:00')), false);
  assert.equal(isLateNightHour(new Date('2026-08-20T22:59:00')), false);
});
