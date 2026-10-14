/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE,
  PRODUCT_SCORE_FLOOR_CANDIDATE,
  productClearlyOutranksMood,
  todayGateLayer,
  arbitrationLayer,
  simulateEmbedNotReadyDegrade,
  splitUtteranceByPunctuation,
  maxClauseProductMinusMood,
  decideShadowProductPathA,
  decideShadowProductPathB,
  CONFIDE_ARBITRATION_CLASS_IDS
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

  it('splits only on punctuation, not on product words', () => {
    assert.deepEqual(splitUtteranceByPunctuation('太累了，怎么关提醒？'), [
      '太累了',
      '怎么关提醒'
    ]);
    assert.deepEqual(splitUtteranceByPunctuation('focus vs meditation'), [
      'focus vs meditation'
    ]);
    assert.equal(CONFIDE_ARBITRATION_CLASS_IDS.length, 8);
  });

  it('function A uses the max clause product-minus-mood', () => {
    const maxDelta = maxClauseProductMinusMood([
      { productScore: 0.2, moodScore: 0.5 },
      { productScore: 0.6, moodScore: 0.4 }
    ]);
    assert.ok(Math.abs(maxDelta - 0.2) < 1e-9);
    assert.equal(decideShadowProductPathA({ maxDelta, margin: 0.05 }), true);
    assert.equal(decideShadowProductPathA({ maxDelta, margin: 0.2 }), false);
  });

  it('function B bypasses margin only for catalog/near at the product floor', () => {
    const moodish = [{ productScore: 0.3, moodScore: 0.5, catalogHit: true, nearestScore: 0.9 }];
    assert.equal(decideShadowProductPathB({ clauses: moodish, margin: 0 }).productPath, false);
    const trusted = [
      { productScore: 0.2, moodScore: 0.5, catalogHit: false, nearestScore: 0.1 },
      {
        productScore: PRODUCT_SCORE_FLOOR_CANDIDATE,
        moodScore: 0.5,
        catalogHit: true,
        nearestScore: 0.5
      }
    ];
    const hit = decideShadowProductPathB({ clauses: trusted, margin: 0.1 });
    assert.equal(hit.productPath, true);
    assert.equal(hit.via, 'trusted_hit');
  });
});
