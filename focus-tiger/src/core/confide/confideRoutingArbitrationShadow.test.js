/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_MINUS_MOOD_MARGIN,
  productClearlyOutranksMood
} from './confideRoutingArbitrationShadow.js';

describe('productClearlyOutranksMood', () => {
  it('requires product to beat mood by the frozen margin', () => {
    assert.equal(Number.isFinite(PRODUCT_MINUS_MOOD_MARGIN), true);
    assert.ok(PRODUCT_MINUS_MOOD_MARGIN >= 0.02);
    assert.equal(productClearlyOutranksMood(0.5, 0.4, 0.02), true);
    assert.equal(productClearlyOutranksMood(0.5, 0.49, 0.02), false);
    assert.equal(productClearlyOutranksMood(0.5, 0.5, 0.02), false);
    assert.equal(productClearlyOutranksMood(0.4, 0.5, 0.02), false);
    assert.equal(productClearlyOutranksMood(Number.NaN, 0.1, 0.02), false);
  });
});
