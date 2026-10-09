/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { voiceLevelUnit } from './voiceLevelMeter.js';

test('silence and missing samples stay flat', () => {
  assert.equal(voiceLevelUnit(0), 0);
  assert.equal(voiceLevelUnit(0.001), 0);
  assert.equal(voiceLevelUnit(Number.NaN), 0);
  assert.equal(voiceLevelUnit(undefined), 0);
});

test('a normal speaking level lifts the bar', () => {
  const unit = voiceLevelUnit(0.02);
  assert.ok(unit > 0.4 && unit < 0.7);
});

test('a loud sample fills the bar', () => {
  assert.equal(voiceLevelUnit(0.2), 1);
});
