import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SLEEP_BREATH_BACK,
  SLEEP_BREATH_SCALE_Y_PEAK,
  sleepBreathScaleYAt,
  sleepBreathEllipseInDisplayRect
} from './spriteSleepBreath.js';

test('sleepBreathScaleYAt oscillates between 1 and peak', () => {
  assert.equal(sleepBreathScaleYAt(0, 4000, 1.12), 1);
  const mid = sleepBreathScaleYAt(2000, 4000, 1.12);
  assert.ok(Math.abs(mid - 1.12) < 1e-9);
  assert.equal(sleepBreathScaleYAt(4000, 4000, 1.12), 1);
});

test('sleepBreathEllipseInDisplayRect places back mound mid-right of content', () => {
  const e = sleepBreathEllipseInDisplayRect({
    left: 100,
    top: 50,
    width: 400,
    height: 300
  });
  assert.ok(e.cx > 100 + 400 * 0.5);
  assert.ok(e.rx > 0 && e.ry > 0);
  assert.equal(SLEEP_BREATH_BACK.cx, 0.56);
  assert.ok(SLEEP_BREATH_SCALE_Y_PEAK > 1);
});
