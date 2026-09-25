/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyProductKnowledgeSemantic,
  isProductKnowledgeColdStartProbe,
  resolveProductKnowledgeGateAction
} from './confideProductKnowledgeSemantic.js';

describe('confideProductKnowledgeSemantic', () => {
  it('cold-start probe blocks product-like misses without semantic', () => {
    assert.equal(isProductKnowledgeColdStartProbe('Sit 按钮在哪'), true);
    assert.equal(isProductKnowledgeColdStartProbe('观察翼是什么'), true);
    assert.equal(isProductKnowledgeColdStartProbe('有点烦'), false);
    assert.equal(isProductKnowledgeColdStartProbe('我太累了'), false);
  });

  it('resolveProductKnowledgeGateAction honors ready semantic gate', () => {
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '观察翼是什么',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false
      }),
      'honesty'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '有点烦',
        embeddingState: 'ready',
        semanticIsProduct: false,
        catalogHit: false
      }),
      'skip'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '怎么开始坐',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: true
      }),
      'hit'
    );
  });

  it('not-ready path allows catalog hit and cold-start honesty', () => {
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: 'Sit 按钮在哪',
        embeddingState: 'not_ready',
        semanticIsProduct: false,
        catalogHit: true
      }),
      'hit'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '怎么开始同坐',
        embeddingState: 'not_ready',
        semanticIsProduct: false,
        catalogHit: true
      }),
      'hit'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '有点烦',
        embeddingState: 'not_ready',
        semanticIsProduct: false,
        catalogHit: false
      }),
      'skip'
    );
  });

  it('classifyProductKnowledgeSemantic uses library score threshold', () => {
    const library = [[1, 0, 0], [0.9, 0.1, 0]];
    const hit = classifyProductKnowledgeSemantic([1, 0, 0], library, {
      minScore: 0.5,
      topK: 2
    });
    assert.equal(hit.isProduct, true);
    const miss = classifyProductKnowledgeSemantic([0, 1, 0], library, {
      minScore: 0.9,
      topK: 2
    });
    assert.equal(miss.isProduct, false);
  });
});
