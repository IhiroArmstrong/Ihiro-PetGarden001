/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import { CONFIDE_SEMANTIC_ROUTING_MODE } from './confideSemanticRoutingConfig.js';
import { applyConfideStage2Route } from './confideSemanticStage2.js';
import { buildConfideSemanticShadowLogRecord } from './confideSemanticCoarseMap.js';
import {
  CONFIDE_STAGE2B_REASON,
  CONFIDE_STAGE2B_SEED_SOURCE,
  buildConfideStage2bShadowFields,
  decideConfideStage2bShadow,
  resolveConfideStage2bSeedSource
} from './confideSemanticStage2b.js';
import {
  buildStage2bShadowFields,
  resolveStage2bSeedSource
} from '../../../desktop/companion/l1SemanticStage2bShadow.js';
import { buildSemanticShadowTurnLogRecord } from '../../../desktop/companion/l1SemanticShadowLog.js';

const { GRAY, FUNCTIONAL, EMOTIONAL } = CONFIDE_SEMANTIC_BUCKET;

const MATRIX = [
  {
    name: 'gray literal + functional semantic + generate → would promote',
    ctx: { route: CONFIDE_ROUTE.FALLBACK, source: 'generate', literalCoarse: GRAY, semanticCoarse: FUNCTIONAL },
    wouldPromote: true,
    reason: CONFIDE_STAGE2B_REASON.GRAY_TO_FUNCTIONAL
  },
  {
    name: 'corpus reply counts as Yin talking',
    ctx: { route: CONFIDE_ROUTE.FALLBACK, source: 'corpus', literalCoarse: GRAY, semanticCoarse: FUNCTIONAL },
    wouldPromote: true,
    reason: CONFIDE_STAGE2B_REASON.GRAY_TO_FUNCTIONAL
  },
  {
    name: 'KB already answered → not a Stage 2b change',
    ctx: { route: CONFIDE_ROUTE.FALLBACK, source: 'product_knowledge', literalCoarse: GRAY, semanticCoarse: FUNCTIONAL },
    wouldPromote: false,
    reason: CONFIDE_STAGE2B_REASON.ALREADY_HANDLED
  },
  {
    name: 'KB honest empty state → already handled',
    ctx: { route: CONFIDE_ROUTE.FALLBACK, source: 'product_knowledge_honesty', literalCoarse: GRAY, semanticCoarse: FUNCTIONAL },
    wouldPromote: false,
    reason: CONFIDE_STAGE2B_REASON.ALREADY_HANDLED
  },
  {
    name: 'emotional semantic stays (有点烦)',
    ctx: { route: CONFIDE_ROUTE.FALLBACK, source: 'generate', literalCoarse: GRAY, semanticCoarse: EMOTIONAL },
    wouldPromote: false,
    reason: CONFIDE_STAGE2B_REASON.SEMANTIC_NOT_FUNCTIONAL
  },
  {
    name: 'gray semantic stays (今天想去骑车)',
    ctx: { route: CONFIDE_ROUTE.FALLBACK, source: 'generate', literalCoarse: GRAY, semanticCoarse: GRAY },
    wouldPromote: false,
    reason: CONFIDE_STAGE2B_REASON.SEMANTIC_NOT_FUNCTIONAL
  },
  {
    name: 'embedding not ready → no claim',
    ctx: { route: CONFIDE_ROUTE.FALLBACK, source: 'generate', literalCoarse: GRAY, semanticCoarse: null },
    wouldPromote: false,
    reason: CONFIDE_STAGE2B_REASON.SEMANTIC_MISSING
  },
  {
    name: 'literal emotion is narrow Stage 2, not 2b',
    ctx: { route: CONFIDE_ROUTE.TIRED, source: 'corpus', literalCoarse: EMOTIONAL, semanticCoarse: FUNCTIONAL },
    wouldPromote: false,
    reason: CONFIDE_STAGE2B_REASON.LITERAL_NOT_GRAY
  },
  {
    name: 'safety never moves',
    ctx: { route: CONFIDE_ROUTE.SAFETY_REDIRECT, source: 'corpus', literalCoarse: GRAY, semanticCoarse: FUNCTIONAL },
    wouldPromote: false,
    reason: CONFIDE_STAGE2B_REASON.PROTECTED_ROUTE
  },
  {
    name: 'aggression never moves',
    ctx: { route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS, source: 'corpus', literalCoarse: GRAY, semanticCoarse: FUNCTIONAL },
    wouldPromote: false,
    reason: CONFIDE_STAGE2B_REASON.PROTECTED_ROUTE
  }
];

describe('decideConfideStage2bShadow', () => {
  for (const row of MATRIX) {
    it(row.name, () => {
      const decided = decideConfideStage2bShadow(row.ctx);
      assert.equal(decided.wouldPromote, row.wouldPromote);
      assert.equal(decided.reason, row.reason);
    });
  }

  it('desktop copy agrees with src on every matrix row', () => {
    for (const row of MATRIX) {
      for (const seedSource of ['po_seeded', 'natural', 'spoof', null]) {
        assert.deepEqual(
          buildStage2bShadowFields({ ...row.ctx, seedSource }),
          buildConfideStage2bShadowFields({ ...row.ctx, seedSource }),
          `${row.name} · seed=${seedSource}`
        );
      }
    }
  });

  it('shadow mode never changes the route for a would-promote turn', () => {
    const ctx = MATRIX[0].ctx;
    assert.equal(decideConfideStage2bShadow(ctx).wouldPromote, true);
    for (const mode of [CONFIDE_SEMANTIC_ROUTING_MODE.LIVE, CONFIDE_SEMANTIC_ROUTING_MODE.SHADOW]) {
      const applied = applyConfideStage2Route({
        literalRoute: ctx.route,
        semanticCoarse: ctx.semanticCoarse,
        mode
      });
      assert.equal(applied.route, CONFIDE_ROUTE.FALLBACK);
      assert.equal(applied.override, null);
    }
  });
});

describe('Stage 2b seed source', () => {
  it('only FT_CONFIDE_SEED_SOURCE=po_seeded marks PO rows', () => {
    for (const resolve of [resolveConfideStage2bSeedSource, resolveStage2bSeedSource]) {
      assert.equal(resolve({ FT_CONFIDE_SEED_SOURCE: 'po_seeded' }), 'po_seeded');
      assert.equal(resolve({ FT_CONFIDE_SEED_SOURCE: ' PO_SEEDED ' }), 'po_seeded');
      assert.equal(resolve({ FT_CONFIDE_SEED_SOURCE: 'lab' }), 'natural');
      assert.equal(resolve({}), 'natural');
      assert.equal(resolve(undefined), 'natural');
    }
    assert.equal(CONFIDE_STAGE2B_SEED_SOURCE.PO_SEEDED, 'po_seeded');
  });
});

describe('semantic_shadow_classify rows carry Stage 2b fields', () => {
  const payload = {
    text: '想做一下呼吸练习',
    route: CONFIDE_ROUTE.FALLBACK,
    source: 'generate',
    literalCoarse: GRAY,
    semanticResult: { bucket: FUNCTIONAL, scoreA: 0.7, scoreB: 0.4, grayMargin: 0.08 },
    ok: true,
    reason: 'ok'
  };

  it('desktop row marks would-promote and defaults to natural', () => {
    const row = buildSemanticShadowTurnLogRecord(payload);
    assert.equal(row.kind, 'semantic_shadow_classify');
    assert.equal(row.stage2bWouldPromote, true);
    assert.equal(row.stage2bReason, 'gray_to_functional');
    assert.equal(row.seedSource, 'natural');
    assert.equal(row.route, CONFIDE_ROUTE.FALLBACK);
    assert.equal(row.source, 'generate');
  });

  it('desktop row keeps po_seeded only when the runtime passes it', () => {
    assert.equal(
      buildSemanticShadowTurnLogRecord({ ...payload, seedSource: 'po_seeded' }).seedSource,
      'po_seeded'
    );
    assert.equal(
      buildSemanticShadowTurnLogRecord({ ...payload, seedSource: 'anything' }).seedSource,
      'natural'
    );
  });

  it('failed embedding rows say semantic_missing, not promote', () => {
    const row = buildSemanticShadowTurnLogRecord({
      ...payload,
      ok: false,
      reason: 'embed_failed',
      semanticResult: null
    });
    assert.equal(row.stage2bWouldPromote, false);
    assert.equal(row.stage2bReason, 'semantic_missing');
  });

  it('src mirror row matches desktop Stage 2b fields', () => {
    const desktop = buildSemanticShadowTurnLogRecord(payload);
    const mirror = buildConfideSemanticShadowLogRecord(payload);
    for (const key of ['stage2bWouldPromote', 'stage2bReason', 'seedSource']) {
      assert.equal(mirror[key], desktop[key], key);
    }
  });
});
