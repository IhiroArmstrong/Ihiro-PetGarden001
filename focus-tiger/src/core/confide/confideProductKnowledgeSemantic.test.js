/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyProductKnowledgeSemantic,
  isConfideMoodAsideFromProductKnowledge,
  isProductKnowledgeColdStartProbe,
  lifeChatOutranksProductLibrary,
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
    assert.equal(isConfideMoodAsideFromProductKnowledge('有点烦'), true);
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '有点烦',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false,
        nearAction: 'honesty'
      }),
      'skip'
    );
    // Was asserted as 'skip' until 2026-09-30. That contradicted anchor A10 of
    // task-confide-kb-embedding-near-match.md, which locks this exact sentence
    // ("What is the observation wing?") to the honesty empty state. Distance
    // may not overturn the gate: a product question the catalog cannot answer
    // gets "no manual", never free generation.
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '观察翼是什么',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false,
        nearAction: 'skip'
      }),
      'honesty'
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

  it('never lets embedding distance send a product question to free generation (K-1)', () => {
    for (const nearAction of ['hit', 'honesty', 'skip', null, undefined]) {
      assert.notEqual(
        resolveProductKnowledgeGateAction({
          text: '观察翼是什么',
          embeddingState: 'ready',
          semanticIsProduct: true,
          catalogHit: false,
          nearAction
        }),
        'skip',
        `nearAction ${String(nearAction)} must not reach free generation`
      );
    }
  });

  it('leaves non-product asks on their existing decision (K-1 blast radius)', () => {
    const expected = { hit: 'skip', honesty: 'honesty', skip: 'skip' };
    for (const [nearAction, want] of Object.entries(expected)) {
      assert.equal(
        resolveProductKnowledgeGateAction({
          text: '今天想去骑车',
          embeddingState: 'ready',
          semanticIsProduct: false,
          catalogHit: false,
          nearAction
        }),
        want,
        `nearAction ${nearAction}`
      );
    }
  });

  it('lets life chat out of the honesty line in every band (K-1 × life-outranks)', () => {
    for (const nearAction of ['hit', 'honesty', 'skip', null]) {
      assert.equal(
        resolveProductKnowledgeGateAction({
          text: 'Where can I eat noodle?',
          embeddingState: 'ready',
          semanticIsProduct: true,
          catalogHit: false,
          nearAction,
          lifeOutranksProduct: true
        }),
        'skip',
        `nearAction ${String(nearAction)} must still generate for life chat`
      );
    }
  });

  it('splits the cosine middle band: life chat generates, unanswered product stays honest', () => {
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: 'Where can I eat noodle?',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false,
        nearAction: 'honesty',
        lifeOutranksProduct: true
      }),
      'skip'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: 'So can I talk to you?',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false,
        nearAction: 'honesty',
        lifeOutranksProduct: true
      }),
      'skip'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: 'What is the observation wing?',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false,
        nearAction: 'honesty',
        lifeOutranksProduct: false
      }),
      'honesty'
    );
    assert.equal(lifeChatOutranksProductLibrary(0.508, 0.652), true);
    assert.equal(lifeChatOutranksProductLibrary(0.632, 0.762), true);
    assert.equal(lifeChatOutranksProductLibrary(0.453, 0.404), false);
    assert.equal(lifeChatOutranksProductLibrary(0.457, 0.425), false);
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
