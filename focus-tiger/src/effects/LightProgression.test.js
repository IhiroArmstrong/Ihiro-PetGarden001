import test from 'node:test';
import assert from 'node:assert/strict';

import {
  arrivalBackdropForWarmth,
  ARRIVAL_WARM_TRANSITION_MS,
  DOLLY_BG_SCALE,
  DOLLY_YIN_SCALE,
  dollyScaleForLayer,
  GOLD_BREATH_PERIOD_SEC,
  RECOVER_BRIGHTNESS_DIP,
  RECOVER_SETTLE_MS,
  rimBaseOpacity,
  rimOpacityWithBreath
} from './LightProgression.js';

test('arrival backdrop interpolates cold gray toward warm gold tint', () => {
  const cold = arrivalBackdropForWarmth(0);
  const warm = arrivalBackdropForWarmth(1);
  const mid = arrivalBackdropForWarmth(0.5);

  assert.match(cold, /rgb\(232,230,225\)/);
  assert.match(warm, /rgb\(242,228,200\)/);
  assert.match(mid, /rgb\(237,229,213\)/);
  assert.notEqual(cold, warm);
});

test('recover settle timing stays at 5s with ~20% brightness dip', () => {
  assert.equal(RECOVER_SETTLE_MS, 5000);
  assert.equal(RECOVER_BRIGHTNESS_DIP, 0.8);
  assert.equal(ARRIVAL_WARM_TRANSITION_MS, 1500);
});

test('dolly parallax: background slower than yin midground', () => {
  assert.equal(dollyScaleForLayer('bg', false), 1);
  assert.equal(dollyScaleForLayer('yin', false), 1);
  assert.equal(dollyScaleForLayer('bg', true), DOLLY_BG_SCALE);
  assert.equal(dollyScaleForLayer('yin', true), DOLLY_YIN_SCALE);
  assert.ok(DOLLY_YIN_SCALE > DOLLY_BG_SCALE);
  assert.ok(DOLLY_BG_SCALE > 1);
  assert.ok(DOLLY_YIN_SCALE <= 1.15);
});

test('rim base opacity stays off near idle and rises with focusLevel', () => {
  assert.equal(rimBaseOpacity(0), 0);
  assert.equal(rimBaseOpacity(0.05), 0);
  assert.ok(rimBaseOpacity(0.3) > 0.2);
  assert.ok(rimBaseOpacity(1) > rimBaseOpacity(0.3));
  assert.ok(rimBaseOpacity(1) <= 0.75);
});

test('rim breath modulation uses 4s period and stays in range', () => {
  assert.equal(GOLD_BREATH_PERIOD_SEC, 4);
  const base = rimBaseOpacity(0.6);
  const a = rimOpacityWithBreath(base, 0);
  const b = rimOpacityWithBreath(base, 1);
  const c = rimOpacityWithBreath(base, 2);
  assert.ok(a >= 0 && a <= 1);
  assert.ok(b >= 0 && b <= 1);
  assert.ok(c >= 0 && c <= 1);
  assert.notEqual(a, b);
  assert.equal(rimOpacityWithBreath(0, 1), 0);
});
