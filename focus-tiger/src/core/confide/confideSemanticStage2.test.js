/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  CONFIDE_SEMANTIC_ROUTING_MODE,
  resolveConfideSemanticRoutingMode
} from './confideSemanticRoutingConfig.js';
import {
  CONFIDE_STAGE2_OVERRIDE,
  applyConfideStage2Route,
  shouldAwaitConfideSemanticLiveClassify
} from './confideSemanticStage2.js';

describe('confide semantic Stage 2 live override', () => {
  it('does not await live classify until embedding is already ready', () => {
    assert.equal(shouldAwaitConfideSemanticLiveClassify('ready'), true);
    assert.equal(shouldAwaitConfideSemanticLiveClassify('unknown'), false);
    assert.equal(shouldAwaitConfideSemanticLiveClassify('loading'), false);
    assert.equal(shouldAwaitConfideSemanticLiveClassify('error'), false);
    assert.equal(shouldAwaitConfideSemanticLiveClassify(null), false);
  });

  it('defaults to live and rolls back with FT_CONFIDE_SEMANTIC_ROUTING=shadow', () => {
    assert.equal(resolveConfideSemanticRoutingMode({}), CONFIDE_SEMANTIC_ROUTING_MODE.LIVE);
    assert.equal(
      resolveConfideSemanticRoutingMode({ FT_CONFIDE_SEMANTIC_ROUTING: 'shadow' }),
      CONFIDE_SEMANTIC_ROUTING_MODE.SHADOW
    );
  });

  it('never moves safety or aggression', () => {
    assert.deepEqual(
      applyConfideStage2Route({
        literalRoute: CONFIDE_ROUTE.SAFETY_REDIRECT,
        semanticCoarse: CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
        mode: CONFIDE_SEMANTIC_ROUTING_MODE.LIVE
      }),
      { route: CONFIDE_ROUTE.SAFETY_REDIRECT, override: null }
    );
    assert.deepEqual(
      applyConfideStage2Route({
        literalRoute: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
        semanticCoarse: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
        mode: CONFIDE_SEMANTIC_ROUTING_MODE.LIVE
      }),
      { route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS, override: null }
    );
  });

  it('coerces emotion false-positives to fallback when semantic is functional', () => {
    const applied = applyConfideStage2Route({
      literalRoute: CONFIDE_ROUTE.TIRED,
      semanticCoarse: CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
      mode: CONFIDE_SEMANTIC_ROUTING_MODE.LIVE
    });
    assert.equal(applied.route, CONFIDE_ROUTE.FALLBACK);
    assert.equal(applied.override, CONFIDE_STAGE2_OVERRIDE.EMOTION_FALSE_POSITIVE);
  });

  it('keeps gray emotional unmatched on fallback so observe generate can still run', () => {
    const applied = applyConfideStage2Route({
      literalRoute: CONFIDE_ROUTE.FALLBACK,
      semanticCoarse: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
      mode: CONFIDE_SEMANTIC_ROUTING_MODE.LIVE
    });
    assert.equal(applied.route, CONFIDE_ROUTE.FALLBACK);
    assert.equal(applied.override, null);
  });

  it('does nothing in shadow mode or when embedding is gray/unavailable', () => {
    assert.deepEqual(
      applyConfideStage2Route({
        literalRoute: CONFIDE_ROUTE.TIRED,
        semanticCoarse: CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
        mode: CONFIDE_SEMANTIC_ROUTING_MODE.SHADOW
      }),
      { route: CONFIDE_ROUTE.TIRED, override: null }
    );
    assert.deepEqual(
      applyConfideStage2Route({
        literalRoute: CONFIDE_ROUTE.TIRED,
        semanticCoarse: null,
        mode: CONFIDE_SEMANTIC_ROUTING_MODE.LIVE
      }),
      { route: CONFIDE_ROUTE.TIRED, override: null }
    );
  });
});
