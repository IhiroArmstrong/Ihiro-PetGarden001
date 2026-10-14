/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_MINUS_MOOD_MARGIN,
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
  decideShadowProductPathC,
  decideShadowProductPathCNext,
  CONFIDE_ARBITRATION_CLASS_IDS
} from './confideRoutingArbitrationShadow.js';
import { resolveProductKnowledgeGateAction } from './confideProductKnowledgeSemantic.js';

describe('productClearlyOutranksMood', () => {
  it('requires product to beat mood by the given margin', () => {
    assert.equal(PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE, 0.01);
    assert.equal(PRODUCT_MINUS_MOOD_MARGIN, 0.01);
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
    assert.equal(CONFIDE_ARBITRATION_CLASS_IDS[0], 'life-emotion');
    assert.equal(CONFIDE_ARBITRATION_CLASS_IDS[3], 'badge-yin-coin');
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

  it('function C keeps live skip and asks catalog hits for a second check', () => {
    const clauses = [
      { productScore: 0.5, moodScore: 0.49, catalogHit: true, nearestScore: 0.5 }
    ];
    assert.equal(
      decideShadowProductPathC({
        liveProduct: false,
        catalogHit: true,
        clauses,
        wholeProductScore: 0.5,
        margin: 0.01
      }).via,
      'live_skip'
    );
    assert.equal(
      decideShadowProductPathC({
        liveProduct: true,
        catalogHit: false,
        clauses,
        wholeProductScore: 0.5,
        margin: 0.01
      }).via,
      'live_semantic'
    );
    assert.equal(
      decideShadowProductPathC({
        liveProduct: true,
        catalogHit: true,
        clauses,
        wholeProductScore: 0.3,
        margin: 0.01,
        floor: 0.42
      }).via,
      'below_floor'
    );
    const unconfirmed = decideShadowProductPathC({
      liveProduct: true,
      catalogHit: true,
      clauses,
      wholeProductScore: 0.5,
      margin: 0.05
    });
    assert.equal(unconfirmed.productPath, false);
    assert.equal(unconfirmed.via, 'catalog_unconfirmed');
    const near = decideShadowProductPathC({
      liveProduct: true,
      catalogHit: true,
      clauses: [{ productScore: 0.5, moodScore: 0.6, nearestScore: 0.81 }],
      wholeProductScore: 0.5,
      margin: 0.05
    });
    assert.equal(near.productPath, true);
    assert.equal(near.via, 'near_confirm');
  });

  it('function C-next does not treat neighbor 0.80 as a pass for short answers', () => {
    const nearOnly = [
      { productScore: 0.65, moodScore: 0.75, nearestScore: 0.82 }
    ];
    const blocked = decideShadowProductPathCNext({
      liveProduct: true,
      shortAnswerHit: true,
      clauses: nearOnly,
      margin: PRODUCT_MINUS_MOOD_MARGIN
    });
    assert.equal(blocked.productPath, false);
    assert.equal(blocked.via, 'short_answer_unconfirmed');
    const confirmed = decideShadowProductPathCNext({
      liveProduct: true,
      shortAnswerHit: true,
      clauses: [{ productScore: 0.6, moodScore: 0.4, nearestScore: 0.5 }],
      margin: PRODUCT_MINUS_MOOD_MARGIN
    });
    assert.equal(confirmed.productPath, true);
    assert.equal(confirmed.via, 'margin_confirm');
  });
});
