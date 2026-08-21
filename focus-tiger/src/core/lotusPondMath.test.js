/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LOTUS_POND_FIRST_BLOOM_MINUTES,
  LOTUS_POND_RING_CAPACITY,
  LOTUS_POND_SPIRAL,
  LOTUS_POND_SPIRAL_WIDE,
  bloomCountForMinutes,
  minutesToSeedQaBloomCount,
  newBloomIndices,
  spiralForViewportWidth,
  spiralSlotForBloomIndex,
  thresholdMinutesForBloom
} from './lotusPondMath.js';

describe('lotusPondMath thresholds', () => {
  it('first bloom is 25 minutes (一炷香) and early steps stay 25', () => {
    assert.equal(thresholdMinutesForBloom(1), 25);
    assert.equal(thresholdMinutesForBloom(2), 50);
    assert.equal(thresholdMinutesForBloom(3), 75);
    assert.equal(thresholdMinutesForBloom(4), 100);
    assert.equal(thresholdMinutesForBloom(5), 125);
  });

  it('later blooms use the longer step through the ring cap', () => {
    assert.equal(thresholdMinutesForBloom(6), 170);
    assert.equal(thresholdMinutesForBloom(12), 440);
    assert.equal(thresholdMinutesForBloom(13), 440);
  });

  it('visible count caps at 12 even when minutes keep growing', () => {
    assert.equal(bloomCountForMinutes(0), 0);
    assert.equal(bloomCountForMinutes(24), 0);
    assert.equal(bloomCountForMinutes(25), 1);
    assert.equal(bloomCountForMinutes(49), 1);
    assert.equal(bloomCountForMinutes(50), 2);
    assert.equal(bloomCountForMinutes(439), 11);
    assert.equal(bloomCountForMinutes(440), 12);
    assert.equal(bloomCountForMinutes(10_000), 12);
  });

  it('newBloomIndices is the 0-based half-open range, capped', () => {
    assert.deepEqual(newBloomIndices(0, 1), [0]);
    assert.deepEqual(newBloomIndices(11, 12), [11]);
    assert.deepEqual(newBloomIndices(12, 12), []);
    assert.deepEqual(newBloomIndices(12, 20), []);
    assert.deepEqual(newBloomIndices(9, 12), [9, 10, 11]);
  });
});

describe('lotusPondMath QA seed minutes', () => {
  it('seeds just below the next threshold so a 1-minute sit can birth', () => {
    assert.equal(minutesToSeedQaBloomCount(0), 24);
    assert.equal(bloomCountForMinutes(24), 0);
    assert.equal(minutesToSeedQaBloomCount(1), 49);
    assert.equal(bloomCountForMinutes(49), 1);
    assert.equal(minutesToSeedQaBloomCount(11), 439);
    assert.equal(bloomCountForMinutes(439), 11);
    assert.equal(
      minutesToSeedQaBloomCount(12),
      thresholdMinutesForBloom(LOTUS_POND_RING_CAPACITY)
    );
    assert.equal(bloomCountForMinutes(minutesToSeedQaBloomCount(12)), 12);
  });

  it('keeps first-bloom / ring constants as the documented initial values', () => {
    assert.equal(LOTUS_POND_FIRST_BLOOM_MINUTES, 25);
    assert.equal(LOTUS_POND_RING_CAPACITY, 12);
  });
});

describe('lotusPondMath spiral slots', () => {
  it('12 slots share one width and stay distinct (no shrinking / crowding)', () => {
    const slots = Array.from({ length: 12 }, (_, i) =>
      spiralSlotForBloomIndex(i)
    );
    const widths = new Set(slots.map((s) => s.widthCss));
    assert.equal(widths.size, 1);
    for (let i = 0; i < slots.length; i += 1) {
      for (let j = i + 1; j < slots.length; j += 1) {
        const dx = slots[i].leftPct - slots[j].leftPct;
        const dy = slots[i].bottomPct - slots[j].bottomPct;
        assert.ok(
          dx * dx + dy * dy > 1,
          `slots ${i} and ${j} too close`
        );
      }
    }
  });

  it('wide spiral is farther from origin than the narrow ring', () => {
    assert.equal(spiralForViewportWidth(375), LOTUS_POND_SPIRAL);
    assert.equal(spiralForViewportWidth(480), LOTUS_POND_SPIRAL_WIDE);
    assert.ok(LOTUS_POND_SPIRAL_WIDE.rInnerPct > LOTUS_POND_SPIRAL.rInnerPct);
    assert.ok(LOTUS_POND_SPIRAL_WIDE.rOuterPct > LOTUS_POND_SPIRAL.rOuterPct);
  });
});
