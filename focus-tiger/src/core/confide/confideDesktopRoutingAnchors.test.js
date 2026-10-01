/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Freezes 2026-09-30 user-reported Confide desktop routing anchors.
 * Batch 1 (security) + batch 2 (KB honesty) — deterministic only; no LLM/TTS assertions.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confideClassify } from './confideClassify.js';
import {
  mayTryConfideProductKnowledge,
  probeProductKnowledgeCatalog
} from './confideProductKnowledge.js';
import {
  isConfideMoodAsideFromProductKnowledge,
  resolveProductKnowledgeGateAction
} from './confideProductKnowledgeSemantic.js';
import {
  resolveConfideDesktopSource,
  resolveConfideMetaQueryBucket
} from './confideAcceptanceResolve.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

const DESKTOP_OPTS = Object.freeze({
  wideViewport: true,
  hasBridge: true,
  hasMemoryBridge: true
});

describe('confideDesktopRoutingAnchors · 2026-09-30 user report', () => {
  it('attack sentences classify aggression and never enter KB path', () => {
    for (const text of ['俺企图收拾别人一顿', '我想揍别人', '我想打人']) {
      const route = confideClassify(text);
      assert.equal(route, CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS, text);
      assert.equal(
        mayTryConfideProductKnowledge({ route, text, ...DESKTOP_OPTS }),
        false,
        text
      );
      assert.equal(resolveConfideDesktopSource(text), 'corpus', text);
      assert.notEqual(resolveConfideDesktopSource(text), 'product_knowledge_honesty', text);
    }
  });

  it('mood aside 有点烦 skips KB honesty even when embedding says product-like', () => {
    assert.equal(isConfideMoodAsideFromProductKnowledge('有点烦'), true);
    assert.equal(probeProductKnowledgeCatalog('有点烦').hit, false);
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '有点烦',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false
      }),
      'skip'
    );
    assert.equal(resolveConfideDesktopSource('有点烦'), 'generate');
    assert.notEqual(resolveConfideMetaQueryBucket('有点烦'), 'product_knowledge_honesty');
  });

  it('reminder functional asks hit product_knowledge not honesty empty state', () => {
    for (const text of ['提醒我练习', 'How to remind me to practice?']) {
      assert.equal(resolveConfideDesktopSource(text), 'product_knowledge', text);
      assert.notEqual(resolveConfideDesktopSource(text), 'product_knowledge_honesty', text);
    }
  });

  it('I need to practice focus hits Sit catalog entry on desktop resolver', () => {
    const text = 'I need to practice focus.';
    assert.equal(probeProductKnowledgeCatalog(text).hit, true);
    assert.equal(probeProductKnowledgeCatalog(text).id, 'KB-FUNC-0001');
    assert.equal(resolveConfideDesktopSource(text), 'product_knowledge');
  });

  it('semantic-ready product miss uses honesty not generate bucket', () => {
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '观察翼是什么',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false
      }),
      'honesty'
    );
    assert.equal(resolveConfideMetaQueryBucket('观察翼是什么'), 'product_knowledge_honesty');
  });
});
