/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  CONFIDE_SEMANTIC_ROUTING_MODE,
  CONFIDE_STAGE2B_ROUTING_MODE,
  resolveConfideSemanticRoutingMode,
  resolveConfideStage2bRoutingMode
} from './confideSemanticRoutingConfig.js';
import { applyConfideStage2Route } from './confideSemanticStage2.js';
import { resolveConfideDesktopSource } from './confideAcceptanceResolve.js';
import { buildConfideSemanticShadowLogRecord } from './confideSemanticCoarseMap.js';
import { STAGE2B_NEGATIVE_CONTROL_TEXTS } from './stage2bNegativeControlTexts.js';
import { STAGE2B_NEGATIVE_CONTROL_TEXTS as DESKTOP_NEGATIVE_CONTROL_TEXTS } from '../../../desktop/companion/stage2bNegativeControlTexts.js';
import {
  CONFIDE_STAGE2B_REASON,
  CONFIDE_STAGE2B_SEED_SOURCE,
  applyConfideStage2bLive,
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
      for (const seedSource of ['lab_seeded', 'po_seeded', 'natural', 'spoof', null]) {
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
  it('FT_CONFIDE_SEED_SOURCE=lab_seeded (or legacy po_seeded) marks lab rows', () => {
    for (const resolve of [resolveConfideStage2bSeedSource, resolveStage2bSeedSource]) {
      assert.equal(resolve({ FT_CONFIDE_SEED_SOURCE: 'lab_seeded' }), 'lab_seeded');
      assert.equal(resolve({ FT_CONFIDE_SEED_SOURCE: 'po_seeded' }), 'lab_seeded');
      assert.equal(resolve({ FT_CONFIDE_SEED_SOURCE: ' PO_SEEDED ' }), 'lab_seeded');
      assert.equal(resolve({ FT_CONFIDE_SEED_SOURCE: 'lab' }), 'natural');
      assert.equal(resolve({}), 'natural');
      assert.equal(resolve(undefined), 'natural');
    }
    assert.equal(CONFIDE_STAGE2B_SEED_SOURCE.LAB_SEEDED, 'lab_seeded');
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

  it('desktop row keeps lab_seeded when the runtime passes lab or legacy po', () => {
    assert.equal(
      buildSemanticShadowTurnLogRecord({ ...payload, seedSource: 'lab_seeded' }).seedSource,
      'lab_seeded'
    );
    assert.equal(
      buildSemanticShadowTurnLogRecord({ ...payload, seedSource: 'po_seeded' }).seedSource,
      'lab_seeded'
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

function loadStage2bNegativeControlLines() {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(
    join(here, '../../../docs/lab-inputs/stage2b-negative-control.txt'),
    'utf8'
  );
  return raw
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

const ADVERSARIAL_FUNCTIONAL = Object.freeze({
  route: CONFIDE_ROUTE.FALLBACK,
  source: 'generate',
  literalCoarse: GRAY,
  semanticCoarse: FUNCTIONAL
});

const HARD_CONSTRAINT_NEIGHBORS = Object.freeze([
  '呼吸有点急，心跳也快',
  '专注不了，脑子很乱',
  '刚停下来心里还是空',
  '练完了还是静不下来',
  '最近老是想起以前',
  '以前的事不想再提了',
  '想打开心扉聊聊以前的事',
  '我感觉自己今天一点都不值钱',
  '攒了半天好像什么都没留下',
  '这些心情我想先放下，不想再存着',
  '不想把今天的事再记一份',
  '身体一直在叫我该休息了',
  '最近总忘了提醒自己休息',
  '不想再被各种会员推销缠着',
  '看那些开通入口就烦'
]);

describe('Stage 2b hard constraints and live apply', () => {
  it('negative-control txt lines lockstep with src and desktop arrays', () => {
    const fromTxt = loadStage2bNegativeControlLines();
    assert.deepEqual(STAGE2B_NEGATIVE_CONTROL_TEXTS, fromTxt);
    assert.deepEqual(DESKTOP_NEGATIVE_CONTROL_TEXTS, fromTxt);
  });

  it('every non-comment negative-control line refuses promote (adversarial functional)', () => {
    const lines = loadStage2bNegativeControlLines();
    assert.ok(lines.length >= 20, `expected ≥20 negatives, got ${lines.length}`);
    for (const text of lines) {
      const decided = decideConfideStage2bShadow({ ...ADVERSARIAL_FUNCTIONAL, text });
      assert.equal(decided.wouldPromote, false, text);
      assert.deepEqual(
        buildStage2bShadowFields({ ...ADVERSARIAL_FUNCTIONAL, text }),
        buildConfideStage2bShadowFields({ ...ADVERSARIAL_FUNCTIONAL, text }),
        text
      );
    }
  });

  it('hard-constraint-2 family neighbour lines refuse promote', () => {
    for (const text of HARD_CONSTRAINT_NEIGHBORS) {
      const decided = decideConfideStage2bShadow({ ...ADVERSARIAL_FUNCTIONAL, text });
      assert.equal(decided.wouldPromote, false, text);
    }
  });

  it('nearby function word allows past-record family; bare 打开 does not', () => {
    const allow = decideConfideStage2bShadow({
      ...ADVERSARIAL_FUNCTIONAL,
      text: '之前留下的练习记录在哪里'
    });
    assert.equal(allow.wouldPromote, true);
    assert.equal(allow.reason, CONFIDE_STAGE2B_REASON.GRAY_TO_FUNCTIONAL);
    const look = decideConfideStage2bShadow({
      ...ADVERSARIAL_FUNCTIONAL,
      text: '想看看之前做过的练习'
    });
    assert.equal(look.wouldPromote, true);
    const heart = decideConfideStage2bShadow({
      ...ADVERSARIAL_FUNCTIONAL,
      text: '想打开心扉聊聊以前的事'
    });
    assert.equal(heart.wouldPromote, false);
    const far = decideConfideStage2bShadow({
      ...ADVERSARIAL_FUNCTIONAL,
      text: '想起以前那些事，过了很久才问练习记录在哪里'
    });
    assert.equal(far.wouldPromote, false);
    assert.equal(far.reason, CONFIDE_STAGE2B_REASON.PAST_RECALL_WITHOUT_FUNCTION_WORD);
  });

  it('有点烦 does not promote and 累积了多久 stays practice_facts', () => {
    const annoyed = decideConfideStage2bShadow({
      ...ADVERSARIAL_FUNCTIONAL,
      semanticCoarse: EMOTIONAL,
      text: '有点烦'
    });
    assert.equal(annoyed.wouldPromote, false);
    assert.equal(resolveConfideDesktopSource('累积了多久'), 'practice_facts');
  });

  it('default env and shadow 2b do not change a gray live reply', () => {
    assert.equal(
      resolveConfideStage2bRoutingMode({}),
      CONFIDE_STAGE2B_ROUTING_MODE.SHADOW
    );
    const grayApply = applyConfideStage2bLive({
      ...ADVERSARIAL_FUNCTIONAL,
      text: '想看看之前做过的练习',
      semanticMode: CONFIDE_SEMANTIC_ROUTING_MODE.LIVE,
      env: {}
    });
    assert.equal(grayApply.promote, false);
    assert.equal(grayApply.route, CONFIDE_ROUTE.FALLBACK);
    const live2b = applyConfideStage2bLive({
      ...ADVERSARIAL_FUNCTIONAL,
      text: '想看看之前做过的练习',
      semanticMode: CONFIDE_SEMANTIC_ROUTING_MODE.LIVE,
      stage2bMode: CONFIDE_STAGE2B_ROUTING_MODE.LIVE
    });
    assert.equal(live2b.promote, true);
  });

  it('FT_CONFIDE_SEMANTIC_ROUTING=shadow blocks Stage 2 and Stage 2b live together', () => {
    assert.equal(
      resolveConfideSemanticRoutingMode({ FT_CONFIDE_SEMANTIC_ROUTING: 'shadow' }),
      CONFIDE_SEMANTIC_ROUTING_MODE.SHADOW
    );
    const stage2 = applyConfideStage2Route({
      literalRoute: CONFIDE_ROUTE.TIRED,
      semanticCoarse: FUNCTIONAL,
      mode: CONFIDE_SEMANTIC_ROUTING_MODE.SHADOW
    });
    assert.equal(stage2.route, CONFIDE_ROUTE.TIRED);
    const stage2b = applyConfideStage2bLive({
      ...ADVERSARIAL_FUNCTIONAL,
      text: '想看看之前做过的练习',
      semanticMode: CONFIDE_SEMANTIC_ROUTING_MODE.SHADOW,
      stage2bMode: CONFIDE_STAGE2B_ROUTING_MODE.LIVE
    });
    assert.equal(stage2b.promote, false);
  });
});
