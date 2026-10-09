/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import { CONFIDE_STAGE2_OVERRIDE } from './confideSemanticStage2.js';
import { decideStage2MReplay } from './stage2MReplayDecide.js';

describe('decideStage2MReplay', () => {
  it('keeps a gray-to-functional row on the same route', () => {
    const row = decideStage2MReplay({
      text: '想做一下呼吸练习',
      route: CONFIDE_ROUTE.FALLBACK,
      source: 'generate',
      literalCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY,
      semanticCoarse: CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
      skipped: false
    });
    assert.equal(row.mCandidate, true);
    assert.equal(row.stillGrayToFunctional, true);
    assert.equal(row.routeChanged, false);
    assert.equal(row.replayRoute, CONFIDE_ROUTE.FALLBACK);
    assert.equal(row.override, null);
  });

  it('does not call a gray-to-functional row stable when the live route moves', () => {
    const row = decideStage2MReplay({
      text: '情绪被误判',
      route: CONFIDE_ROUTE.SAD,
      source: 'generate',
      literalCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY,
      semanticCoarse: CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
      skipped: false
    });
    assert.equal(row.mCandidate, true);
    assert.equal(row.routeChanged, true);
    assert.equal(row.stillGrayToFunctional, false);
    assert.equal(row.replayRoute, CONFIDE_ROUTE.FALLBACK);
    assert.equal(row.override, CONFIDE_STAGE2_OVERRIDE.EMOTION_FALSE_POSITIVE);
  });

  it('leaves an emotional literal row outside the gray-to-functional set', () => {
    const row = decideStage2MReplay({
      text: '我有点难过',
      route: CONFIDE_ROUTE.SAD,
      source: 'generate',
      literalCoarse: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
      semanticCoarse: CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
      skipped: false
    });
    assert.equal(row.mCandidate, false);
    assert.equal(row.stillGrayToFunctional, false);
    assert.equal(row.routeChanged, true);
  });
});
