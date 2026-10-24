/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  containRectCrisp,
  snapUpscaleToInteger
} from './spriteCrispRendering.js';

describe('spriteCrispRendering (T46)', () => {
  it('floors upscale to integer multiples', () => {
    assert.equal(snapUpscaleToInteger(1.9), 1);
    assert.equal(snapUpscaleToInteger(2.01), 2);
    assert.equal(snapUpscaleToInteger(0.72), 0.72);
  });

  it('centers crisp contain box with integer pixel dimensions when upscaling', () => {
    const box = containRectCrisp(1056, 864, 2400, 1800);
    assert.equal(box.scale, 2);
    assert.equal(box.width, 2112);
    assert.equal(box.height, 1728);
    assert.equal(box.left, Math.round((2400 - 2112) * 0.5));
    assert.equal(box.top, Math.round((1800 - 1728) * 0.5));
  });

  it('uses fractional scale when downscaling', () => {
    const box = containRectCrisp(1056, 864, 400, 300);
    assert.ok(box.scale < 1);
    assert.equal(box.width, Math.round(1056 * box.scale));
    assert.equal(box.height, Math.round(864 * box.scale));
  });

  it('respects maxUpscale cap', () => {
    const box = containRectCrisp(100, 100, 500, 500, { maxUpscale: 1 });
    assert.equal(box.scale, 1);
    assert.equal(box.width, 100);
    assert.equal(box.height, 100);
  });
});
