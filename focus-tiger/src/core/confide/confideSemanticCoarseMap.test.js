/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  buildConfideSemanticShadowLogRecord,
  resolveConfideLiteralCoarseBucket,
  shouldRunConfideSemanticShadow
} from './confideSemanticCoarseMap.js';

describe('confideSemanticCoarseMap', () => {
  it('skips semantic shadow for safety and aggression routes', () => {
    assert.equal(
      shouldRunConfideSemanticShadow({ route: CONFIDE_ROUTE.SAFETY_REDIRECT }),
      false
    );
    assert.equal(
      shouldRunConfideSemanticShadow({ route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS }),
      false
    );
    assert.equal(shouldRunConfideSemanticShadow({ route: CONFIDE_ROUTE.FALLBACK }), true);
  });

  it('maps literal coarse buckets from route + source without changing classify', () => {
    assert.equal(
      resolveConfideLiteralCoarseBucket({
        route: CONFIDE_ROUTE.TIRED,
        source: 'corpus'
      }),
      CONFIDE_SEMANTIC_BUCKET.EMOTIONAL
    );
    assert.equal(
      resolveConfideLiteralCoarseBucket({
        route: CONFIDE_ROUTE.FALLBACK,
        source: 'practice_facts'
      }),
      CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL
    );
    assert.equal(
      resolveConfideLiteralCoarseBucket({
        route: CONFIDE_ROUTE.FALLBACK,
        source: 'corpus'
      }),
      CONFIDE_SEMANTIC_BUCKET.GRAY
    );
    assert.equal(
      resolveConfideLiteralCoarseBucket({
        route: CONFIDE_ROUTE.SAFETY_REDIRECT,
        source: 'corpus'
      }),
      null
    );
  });

  it('builds shadow log rows with required text field', () => {
    const row = buildConfideSemanticShadowLogRecord({
      text: '累积了多久',
      route: CONFIDE_ROUTE.TIRED,
      source: 'corpus',
      literalCoarse: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
      semanticResult: {
        bucket: CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
        scoreA: 0.71,
        scoreB: 0.42,
        grayMargin: 0.08
      },
      ok: true,
      reason: 'ok',
      timing: { wallMs: 120, embedMs: 95 }
    });
    assert.equal(row.kind, 'semantic_shadow_classify');
    assert.equal(row.text, '累积了多久');
    assert.equal(row.literalCoarse, CONFIDE_SEMANTIC_BUCKET.EMOTIONAL);
    assert.equal(row.semanticCoarse, CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL);
  });

  it('degrades shadow logging when embedding fails', () => {
    const row = buildConfideSemanticShadowLogRecord({
      text: '忙啥',
      route: CONFIDE_ROUTE.FALLBACK,
      source: 'corpus',
      literalCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY,
      semanticResult: null,
      ok: false,
      reason: 'embed_failed'
    });
    assert.equal(row.ok, false);
    assert.equal(row.reason, 'embed_failed');
    assert.equal(row.semanticCoarse, null);
    assert.equal(row.text, '忙啥');
  });
});
