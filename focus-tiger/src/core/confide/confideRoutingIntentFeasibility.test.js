/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIDE_EMOTION_BUCKETS, CONFIDE_ROUTE } from './confideRoutes.js';
import {
  goldIntentFromClass,
  templateGroupOf,
  intentFromProductMinusMood,
  intentFromProductPath,
  bothIntentMetrics,
  pickMarginOnTrain,
  leaveOneTemplateOutMargin,
  emotionHalfMayMerge,
  percentileSorted,
  ROUTING_INTENT_ASK_FEATURE,
  ROUTING_INTENT_VENT
} from './confideRoutingIntentFeasibility.js';

describe('confideRoutingIntentFeasibility', () => {
  it('maps class ids to ask-feature vs vent', () => {
    assert.equal(goldIntentFromClass('product-honest-empty'), ROUTING_INTENT_ASK_FEATURE);
    assert.equal(goldIntentFromClass('life-emotion'), ROUTING_INTENT_VENT);
    assert.equal(goldIntentFromClass('unknown'), null);
    assert.equal(templateGroupOf({ dim: 'ui', class: 'mixed' }), 'ui');
    assert.equal(templateGroupOf({ class: 'mixed' }), 'mixed');
  });

  it('scores both classes and picks a train margin', () => {
    const gold = [
      ROUTING_INTENT_ASK_FEATURE,
      ROUTING_INTENT_ASK_FEATURE,
      ROUTING_INTENT_VENT,
      ROUTING_INTENT_VENT
    ];
    const pred = [
      ROUTING_INTENT_ASK_FEATURE,
      ROUTING_INTENT_VENT,
      ROUTING_INTENT_VENT,
      ROUTING_INTENT_VENT
    ];
    const m = bothIntentMetrics(gold, pred);
    assert.equal(m.n, 4);
    assert.equal(m.ask_feature.recall, 0.5);
    assert.equal(intentFromProductPath(true), ROUTING_INTENT_ASK_FEATURE);
    assert.equal(intentFromProductMinusMood(0.6, 0.4, 0.01), ROUTING_INTENT_ASK_FEATURE);
    const picked = pickMarginOnTrain([
      { gold: ROUTING_INTENT_ASK_FEATURE, product: 0.6, mood: 0.4 },
      { gold: ROUTING_INTENT_VENT, product: 0.4, mood: 0.6 }
    ]);
    assert.equal(typeof picked.margin, 'number');
  });

  it('leave-one-template-out does not train on the held-out group', () => {
    const rows = [
      { group: 'a', gold: ROUTING_INTENT_ASK_FEATURE, product: 0.7, mood: 0.4 },
      { group: 'a', gold: ROUTING_INTENT_ASK_FEATURE, product: 0.65, mood: 0.41 },
      { group: 'b', gold: ROUTING_INTENT_VENT, product: 0.4, mood: 0.7 },
      { group: 'b', gold: ROUTING_INTENT_VENT, product: 0.39, mood: 0.68 }
    ];
    const out = leaveOneTemplateOutMargin(rows);
    assert.equal(out.groups, 2);
    assert.equal(out.n, 4);
    assert.equal(out.pooled.accuracy, 1);
  });

  it('blocks merge when mood is below floor or bucket is not concrete', () => {
    const floor = 0.5;
    assert.equal(
      emotionHalfMayMerge({
        moodScore: 0.6,
        emotionBucket: CONFIDE_ROUTE.TIRED,
        moodFloor: floor,
        emotionBuckets: CONFIDE_EMOTION_BUCKETS
      }),
      true
    );
    assert.equal(
      emotionHalfMayMerge({
        moodScore: 0.4,
        emotionBucket: CONFIDE_ROUTE.TIRED,
        moodFloor: floor,
        emotionBuckets: CONFIDE_EMOTION_BUCKETS
      }),
      false
    );
    assert.equal(
      emotionHalfMayMerge({
        moodScore: 0.7,
        emotionBucket: CONFIDE_ROUTE.FALLBACK,
        moodFloor: floor,
        emotionBuckets: CONFIDE_EMOTION_BUCKETS
      }),
      false
    );
    assert.equal(percentileSorted([0.4, 0.5, 0.6], 0.5), 0.5);
  });
});
