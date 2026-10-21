/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS } from './confideSafetyDevsetZhV1.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  CONFIDE_SEMANTIC_CRISIS_KIND,
  CONFIDE_SEMANTIC_CRISIS_MODE,
  CONFIDE_SEMANTIC_CRISIS_OVERRIDE,
  CONFIDE_SEMANTIC_CRISIS_PROTOTYPES,
  DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE,
  applyConfideSemanticCrisis,
  buildSemanticCrisisTurnLog,
  looksLikeJapaneseConfideText,
  resolveConfideSemanticCrisisCosine,
  resolveConfideSemanticCrisisMode,
  scoreSemanticCrisisVectors,
  semanticCrisisScoreBucket,
  shouldAttemptConfideSemanticCrisis
} from './confideSemanticCrisisLayer.js';

const BANK = Object.freeze([
  { id: 'proto.en.want-to-die', vector: [1, 0, 0] },
  { id: 'proto.zh.xiang-si', vector: [0, 1, 0] }
]);

describe('confide semantic crisis layer (CR-44 S1)', () => {
  it('keeps a short bilingual explicit-crisis bank without Japanese or fixture copies', () => {
    assert.ok(CONFIDE_SEMANTIC_CRISIS_PROTOTYPES.length >= 10);
    assert.ok(CONFIDE_SEMANTIC_CRISIS_PROTOTYPES.length <= 24);
    assert.equal(
      CONFIDE_SEMANTIC_CRISIS_PROTOTYPES.some((row) => looksLikeJapaneseConfideText(row.text)),
      false
    );
    const texts = new Set(CONFIDE_SEMANTIC_CRISIS_PROTOTYPES.map((row) => row.text.trim()));
    for (const row of CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS) {
      assert.equal(texts.has(String(row.text || '').trim()), false, row.id);
    }
    assert.equal(texts.has('我撑不下去了'), false);
    assert.equal(texts.has('I want to disappear forever'), false);
  });

  it('defaults to live and rolls back with off / shadow', () => {
    assert.equal(resolveConfideSemanticCrisisMode({}), CONFIDE_SEMANTIC_CRISIS_MODE.LIVE);
    assert.equal(
      resolveConfideSemanticCrisisMode({ FT_CONFIDE_SEMANTIC_CRISIS: 'shadow' }),
      CONFIDE_SEMANTIC_CRISIS_MODE.SHADOW
    );
    assert.equal(
      resolveConfideSemanticCrisisMode({ FT_CONFIDE_SEMANTIC_CRISIS: 'off' }),
      CONFIDE_SEMANTIC_CRISIS_MODE.OFF
    );
    assert.equal(DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE, 0.78);
    assert.equal(
      resolveConfideSemanticCrisisCosine({ FT_CONFIDE_SEMANTIC_CRISIS_COSINE: '0.84' }),
      0.84
    );
  });

  it('does not attempt after literal safety / aggression, on narrow, Japanese, or off', () => {
    assert.equal(
      shouldAttemptConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.FALLBACK,
        text: 'plain',
        wideViewport: true
      }),
      true
    );
    assert.equal(
      shouldAttemptConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.SAFETY_REDIRECT,
        text: 'plain',
        wideViewport: true
      }),
      false
    );
    assert.equal(
      shouldAttemptConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
        text: 'plain',
        wideViewport: true
      }),
      false
    );
    assert.equal(
      shouldAttemptConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.FALLBACK,
        text: 'plain',
        wideViewport: false
      }),
      false
    );
    assert.equal(
      shouldAttemptConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.FALLBACK,
        text: '死にたい',
        wideViewport: true
      }),
      false
    );
    assert.equal(
      shouldAttemptConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.FALLBACK,
        text: 'plain',
        wideViewport: true,
        env: { FT_CONFIDE_SEMANTIC_CRISIS: 'off' }
      }),
      false
    );
  });

  it('scores max cosine and only live-applies when embedding is already ready', () => {
    assert.equal(scoreSemanticCrisisVectors([1, 0, 0], BANK).protoId, 'proto.en.want-to-die');
    assert.ok(scoreSemanticCrisisVectors([1, 0, 0], BANK).score >= 0.99);
    assert.ok(scoreSemanticCrisisVectors([0, 0, 1], BANK).score < 0.2);
    assert.deepEqual(
      applyConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.FALLBACK,
        score: 0.91,
        embeddingOk: true,
        mode: CONFIDE_SEMANTIC_CRISIS_MODE.LIVE
      }),
      {
        route: CONFIDE_ROUTE.SAFETY_REDIRECT,
        applied: true,
        wouldApply: true,
        override: CONFIDE_SEMANTIC_CRISIS_OVERRIDE
      }
    );
    assert.deepEqual(
      applyConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.FALLBACK,
        score: 0.91,
        embeddingOk: true,
        mode: CONFIDE_SEMANTIC_CRISIS_MODE.SHADOW
      }),
      {
        route: CONFIDE_ROUTE.FALLBACK,
        applied: false,
        wouldApply: true,
        override: null
      }
    );
    assert.equal(
      applyConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.FALLBACK,
        score: 0.91,
        embeddingOk: false,
        mode: CONFIDE_SEMANTIC_CRISIS_MODE.LIVE
      }).applied,
      false
    );
    assert.equal(
      applyConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.FALLBACK,
        score: 0.2,
        embeddingOk: true,
        mode: CONFIDE_SEMANTIC_CRISIS_MODE.LIVE
      }).route,
      CONFIDE_ROUTE.FALLBACK
    );
  });

  it('does not live-apply rhetorical death-talk even when cosine would hit', () => {
    const miss = applyConfideSemanticCrisis({
      literalRoute: CONFIDE_ROUTE.FALLBACK,
      score: 0.91,
      embeddingOk: true,
      mode: CONFIDE_SEMANTIC_CRISIS_MODE.LIVE,
      text: '想死你了'
    });
    assert.equal(miss.applied, false);
    assert.equal(miss.wouldApply, true);
    assert.equal(miss.route, CONFIDE_ROUTE.FALLBACK);
    const enMiss = applyConfideSemanticCrisis({
      literalRoute: CONFIDE_ROUTE.FALLBACK,
      score: 0.91,
      embeddingOk: true,
      mode: CONFIDE_SEMANTIC_CRISIS_MODE.LIVE,
      text: "I'm dying to see you"
    });
    assert.equal(enMiss.applied, false);
    assert.equal(enMiss.route, CONFIDE_ROUTE.FALLBACK);
    const killingMe = applyConfideSemanticCrisis({
      literalRoute: CONFIDE_ROUTE.FALLBACK,
      score: 0.91,
      embeddingOk: true,
      mode: CONFIDE_SEMANTIC_CRISIS_MODE.LIVE,
      text: 'this is killing me'
    });
    assert.equal(killingMe.applied, false);
    assert.equal(killingMe.route, CONFIDE_ROUTE.FALLBACK);
  });

  it('still live-applies banked self-directed prototypes', () => {
    for (const text of ['I want to die', '我想死', '我不想活了']) {
      const hit = applyConfideSemanticCrisis({
        literalRoute: CONFIDE_ROUTE.FALLBACK,
        score: 0.91,
        embeddingOk: true,
        mode: CONFIDE_SEMANTIC_CRISIS_MODE.LIVE,
        text
      });
      assert.equal(hit.applied, true, text);
      assert.equal(hit.route, CONFIDE_ROUTE.SAFETY_REDIRECT, text);
    }
    assert.equal(DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE, 0.78);
  });

  it('logs hash + protoId + score bucket and never the original sentence', () => {
    assert.equal(semanticCrisisScoreBucket(0.81), 'ge_80');
    const row = buildSemanticCrisisTurnLog({
      text: 'must-not-appear-in-log',
      protoId: 'proto.en.want-to-die',
      score: 0.81,
      applied: true
    });
    assert.equal(row.kind, CONFIDE_SEMANTIC_CRISIS_KIND);
    assert.equal(row.protoId, 'proto.en.want-to-die');
    assert.equal(row.scoreBucket, 'ge_80');
    assert.equal(Object.prototype.hasOwnProperty.call(row, 'text'), false);
    assert.equal(JSON.stringify(row).includes('must-not-appear-in-log'), false);
  });
});
