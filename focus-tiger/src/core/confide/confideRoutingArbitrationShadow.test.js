/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE,
  productClearlyOutranksMood,
  todayGateLayer,
  arbitrationLayer,
  simulateEmbedNotReadyDegrade
} from './confideRoutingArbitrationShadow.js';
import { resolveProductKnowledgeGateAction } from './confideProductKnowledgeSemantic.js';

describe('productClearlyOutranksMood', () => {
  it('requires product to beat mood by the given margin', () => {
    assert.equal(PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE, 0.05);
    assert.equal(productClearlyOutranksMood(0.5, 0.4, 0.02), true);
    assert.equal(productClearlyOutranksMood(0.5, 0.49, 0.02), false);
    assert.equal(productClearlyOutranksMood(0.5, 0.5, 0.02), false);
    assert.equal(productClearlyOutranksMood(0.4, 0.5, 0.02), false);
    assert.equal(productClearlyOutranksMood(Number.NaN, 0.1, 0.02), false);
  });

  it('maps today gate actions and the shadow arbitration layer', () => {
    assert.equal(todayGateLayer('hit'), 'product_short');
    assert.equal(todayGateLayer('honesty'), 'product_honesty');
    assert.equal(todayGateLayer('skip'), 'mood_or_generate');
    assert.equal(arbitrationLayer(true), 'product');
    assert.equal(arbitrationLayer(false), 'mood');
  });

  it('degrades immediately when embedding is not ready', () => {
    const mood = simulateEmbedNotReadyDegrade(
      { text: '最近老是想起以前', catalogHit: false },
      resolveProductKnowledgeGateAction
    );
    assert.equal(mood.embed_not_ready, true);
    assert.equal(mood.action, 'skip');
    const ask = simulateEmbedNotReadyDegrade(
      { text: 'What is ground exercise?', catalogHit: false },
      resolveProductKnowledgeGateAction
    );
    assert.equal(ask.embed_not_ready, true);
    assert.equal(ask.action, 'honesty');
  });
});
