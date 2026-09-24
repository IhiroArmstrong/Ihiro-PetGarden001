/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confideClassify } from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { shouldUseDesktopCompanionGenerate } from '../desktopCompanionL2Route.js';
import {
  buildKbRetrievalMissTurnLog,
  isConfideKbRetrievalCandidate,
  isConfideKbRetrievalEnabled,
  isProductKnowledgeQuestion,
  listRetrievableProductKnowledgeEntries,
  mayTryConfideProductKnowledge,
  pickProductKnowledgeHit,
  probeProductKnowledgeCatalog,
  retrieveProductKnowledge,
  scoreProductKnowledgeEntries
} from './confideProductKnowledge.js';
import { resolveProductKnowledgeGateAction } from './confideProductKnowledgeSemantic.js';

const readyOpen = {
  generateEnabled: true,
  generateLayerOpen: true,
  hasGenerateFn: true
};

describe('confide product knowledge retrieval', () => {
  it('indexes exactly 20 approved entries (excludes 0009 cloud backup)', () => {
    const ids = listRetrievableProductKnowledgeEntries().map((row) => row.id);
    assert.equal(ids.length, 20);
    assert.equal(ids.includes('KB-FUNC-0006'), true);
    assert.equal(ids.includes('KB-FUNC-0009'), false);
    assert.equal(ids.includes('KB-FUNC-0001'), true);
    assert.equal(ids.includes('KB-FUNC-0017'), true);
    assert.equal(ids.includes('KB-FUNC-0018'), true);
    assert.equal(ids.includes('KB-FUNC-0019'), true);
    assert.equal(ids.includes('KB-FUNC-0020'), true);
    assert.equal(ids.includes('KB-FUNC-0021'), true);
  });

  it('kill switch FT_CONFIDE_KB_RETRIEVAL=off disables retrieval', () => {
    assert.equal(isConfideKbRetrievalEnabled({ FT_CONFIDE_KB_RETRIEVAL: 'off' }), false);
    assert.equal(isConfideKbRetrievalEnabled({ FT_CONFIDE_KB_RETRIEVAL: 'on' }), true);
    assert.equal(
      mayTryConfideProductKnowledge({
        route: CONFIDE_ROUTE.FALLBACK,
        text: 'Where is Ground exercise?',
        wideViewport: true,
        hasBridge: true,
        enabled: false
      }),
      false
    );
  });

  it('hits ground exercise and sit start questions with template output only', () => {
    const ground = retrieveProductKnowledge('Where is the Ground exercise menu?');
    assert.equal(ground.hit, true);
    assert.equal(ground.id, 'KB-FUNC-0002');
    assert.match(ground.text || '', /Ground exercise/i);
    assert.doesNotMatch(ground.text || '', /RESET_GROUND_/);

    const sit = retrieveProductKnowledge('怎么开始同坐？');
    assert.equal(sit.hit, true);
    assert.equal(sit.id, 'KB-FUNC-0001');
    assert.match(sit.text || '', /Sit with Yin/i);
  });

  it('semi-hit step detail still returns pointer-only answer', () => {
    const result = retrieveProductKnowledge(
      'How do I do the Ground exercise steps? Walk me through Feel the Ground'
    );
    assert.equal(result.hit, true);
    assert.equal(result.semiHit, true);
    assert.match(result.text || '', /does not read the steps aloud/i);
  });

  it('probes catalog without regex gate and logs miss shape', () => {
    const result = probeProductKnowledgeCatalog('the weather feels heavy today');
    assert.equal(result.attempted, true);
    assert.equal(result.hit, false);
    const miss = buildKbRetrievalMissTurnLog({
      text: 'how do I export my soul',
      reason: 'below_threshold',
      locale: 'en'
    });
    assert.equal(miss.kind, 'kb_retrieval_miss');
    assert.equal(miss.reason, 'below_threshold');
  });

  it('does not steal CI-00 practice duration asks', () => {
    const text = 'How long have I practiced?';
    const route = confideClassify(text);
    assert.equal(route, CONFIDE_ROUTE.FALLBACK);
    assert.equal(isConfideKbRetrievalCandidate(route, text), false);
    assert.equal(probeProductKnowledgeCatalog(text).hit, false);
  });

  it('blocks generate when product knowledge hits on fallback', () => {
    const text = 'How do I open Confide to Yin?';
    const route = confideClassify(text);
    assert.equal(route, CONFIDE_ROUTE.FALLBACK);
    assert.equal(
      mayTryConfideProductKnowledge({
        route,
        text,
        wideViewport: true,
        hasBridge: true
      }),
      true
    );
    const kb = retrieveProductKnowledge(text);
    assert.equal(kb.hit, true);
    assert.equal(kb.id, 'KB-FUNC-0010');
    assert.equal(
      shouldUseDesktopCompanionGenerate({ ...readyOpen, route }) &&
        !isConfideKbRetrievalCandidate(route, text),
      false
    );
  });

  it('high-threshold picker rejects equal top scores', () => {
    const ranked = [
      { id: 'KB-FUNC-0001', score: 2, shortAnswerEn: 'a' },
      { id: 'KB-FUNC-0002', score: 2, shortAnswerEn: 'b' }
    ];
    assert.equal(pickProductKnowledgeHit('x', ranked), null);
  });

  it('treats 哪些 / 包不包含 as product questions without swallowing mood 会不会', () => {
    assert.equal(isProductKnowledgeQuestion('备份里包不包含练习记录？'), true);
    assert.equal(isProductKnowledgeQuestion('导出文件装了什么？'), true);
    assert.equal(isProductKnowledgeQuestion('会不会好一点'), false);
  });

  it('routes backup contents asks to 0015 instead of the 0003 entry pointer', () => {
    const contents = retrieveProductKnowledge('备份装了什么？');
    assert.equal(contents.hit, true);
    assert.equal(contents.id, 'KB-FUNC-0015');
    const scope = retrieveProductKnowledge('备份能够备份哪些数据？');
    assert.equal(scope.hit, true);
    assert.equal(scope.id, 'KB-FUNC-0015');
    const where = retrieveProductKnowledge('备份从哪里进？');
    assert.equal(where.hit, true);
    assert.equal(where.id, 'KB-FUNC-0003');
  });

  it('Step 3 expanded keywords hit approved registry-linked entries', () => {
    const breath = retrieveProductKnowledge('左球在哪做呼吸练习？');
    assert.equal(breath.hit, true);
    assert.equal(breath.id, 'KB-FUNC-0006');

    const breathDiff = retrieveProductKnowledge('Breath 和 Sit 有什么区别？');
    assert.equal(breathDiff.hit, true);
    assert.equal(breathDiff.id, 'KB-FUNC-0011');

    const journey = retrieveProductKnowledge('journey log 在哪看练习记录？');
    assert.equal(journey.hit, true);
    assert.equal(journey.id, 'KB-FUNC-0012');

    const presence = retrieveProductKnowledge('presence signals 情绪面板在哪？');
    assert.equal(presence.hit, true);
    assert.equal(presence.id, 'KB-FUNC-0013');

    const hud = retrieveProductKnowledge('top left progress bar 是什么？');
    assert.equal(hud.hit, true);
    assert.equal(hud.id, 'KB-FUNC-0004');
  });

  it('hits focus-coins earn FAQ with the approved short answer', () => {
    const coins = retrieveProductKnowledge('怎么获得寅币？');
    assert.equal(coins.hit, true);
    assert.equal(coins.id, 'KB-FUNC-0018');
    assert.match(coins.text || '', /focus coins/i);
    assert.doesNotMatch(coins.text || '', /\b36\b|FOMO/i);
  });

  it('hits batch-2 Step 4 Five Moments and Honesty entry questions', () => {
    const five = retrieveProductKnowledge('Five Moments 罗盘从哪开？');
    assert.equal(five.hit, true);
    assert.equal(five.id, 'KB-FUNC-0019');
    assert.match(five.text || '', /The 5 Moments/i);

    const honesty = retrieveProductKnowledge('Honesty Check-in 怎么补登？');
    assert.equal(honesty.hit, true);
    assert.equal(honesty.id, 'KB-FUNC-0020');
    assert.match(honesty.text || '', /Honesty Check-in/i);
    assert.match(honesty.text || '', /optional/i);
  });

  it('hits batch-2 Step 4 Daily quote entry questions', () => {
    const quote = retrieveProductKnowledge('今日静语从哪开？');
    assert.equal(quote.hit, true);
    assert.equal(quote.id, 'KB-FUNC-0021');
    assert.match(quote.text || '', /A Quiet Line/i);
    assert.match(quote.text || '', /Save image/i);

    const quoteEn = retrieveProductKnowledge('Where is the daily quote menu?');
    assert.equal(quoteEn.hit, true);
    assert.equal(quoteEn.id, 'KB-FUNC-0021');
  });

  it('semantic-ready miss on product ask resolves to honesty not generate path', () => {
    const action = resolveProductKnowledgeGateAction({
      text: 'What is the observation wing?',
      embeddingState: 'ready',
      semanticIsProduct: true,
      catalogHit: false
    });
    assert.equal(action, 'honesty');
  });
});
