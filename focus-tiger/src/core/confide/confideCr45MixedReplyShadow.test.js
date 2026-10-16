/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cr45MixedShapeFromClauses,
  evaluateCr45ShadowMergeOutcome,
  isAllowedCr45FirstSegmentLine,
  isCr45ForbiddenFirstSegmentId,
  isCr45MergeStructurallyCorrect,
  pickCr45ShadowFirstSegment
} from './confideCr45MixedReplyShadow.js';
import { PRODUCT_MINUS_MOOD_MARGIN } from './confideRoutingArbitrationShadow.js';

describe('confideCr45MixedReplyShadow', () => {
  it('forbids crisis / fallback ids for first segment', () => {
    assert.equal(isCr45ForbiddenFirstSegmentId('safety-01'), true);
    assert.equal(isCr45ForbiddenFirstSegmentId('aggression-01'), true);
    assert.equal(isAllowedCr45FirstSegmentLine('tired-01', 'en'), true);
  });

  it('detects mixed shape from clause deltas', () => {
    const mixed = cr45MixedShapeFromClauses([
      { productScore: 0.9, moodScore: 0.1 },
      { productScore: 0.2, moodScore: 0.8 }
    ]);
    assert.equal(mixed.mixed, true);
    const notMixed = cr45MixedShapeFromClauses([
      { productScore: 0.9, moodScore: 0.1 },
      { productScore: 0.85, moodScore: 0.1 }
    ]);
    assert.equal(notMixed.mixed, false);
  });

  it('merge structural pass requires allowed first id and zero-rewrite second', () => {
    assert.equal(
      isCr45MergeStructurallyCorrect({
        mergeTriggered: true,
        firstSegmentId: 'tired-01',
        secondKind: 'honesty',
        secondText: 'same',
        canonicalSecondText: 'same'
      }),
      true
    );
    assert.equal(
      isCr45MergeStructurallyCorrect({
        mergeTriggered: true,
        firstSegmentId: 'safety-01',
        secondKind: 'honesty',
        secondText: 'same',
        canonicalSecondText: 'same'
      }),
      false
    );
  });

  it('picks first segment only when mood floor and bucket pass', () => {
    const picked = pickCr45ShadowFirstSegment({
      moodClauseText: '太累了',
      moodScore: 0.55,
      locale: 'zh',
      salt: 3
    });
    assert.ok(picked?.id);
    assert.equal(isCr45ForbiddenFirstSegmentId(picked.id), false);
  });

  it('AE anchor blocks merge evaluation', () => {
    const out = evaluateCr45ShadowMergeOutcome({
      text: '接地练习在哪',
      clauses: [
        { text: '有点烦', productScore: 0.2, moodScore: 0.7 },
        { text: '接地练习在哪', productScore: 0.9, moodScore: 0.2 }
      ],
      aeAnchor: true,
      classId: 'product-short-answer',
      secondKind: 'hit',
      canonicalSecondText: 'x',
      actualSecondText: 'x'
    });
    assert.equal(out.mergeTriggered, false);
  });
});
