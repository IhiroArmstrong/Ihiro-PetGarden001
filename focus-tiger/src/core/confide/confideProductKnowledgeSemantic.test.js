/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyProductKnowledgeSemantic,
  isConfideMoodAsideFromProductKnowledge,
  isConfideOperationalProductAskShape,
  isProductKnowledgeColdStartProbe,
  lifeChatOutranksProductLibrary,
  resolveProductKnowledgeGateAction
} from './confideProductKnowledgeSemantic.js';
import { classifyConfideProductAskRole } from './confideProductAskRole.js';

const CR47_GENERATE_WHEN_PRODUCT_LIKE = Object.freeze([
  "I feel quite sleepy. I don't want to practice anymore.",
  "Why should I do some focus practicing? I don't like that.",
  'Why should I do some meditation?',
  "I want to drink some beer. I want to drink some alcohol and I don't like to practice.",
  "Today I'm quite happy. I want to do some focus practice."
]);

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
    assert.equal(isConfideMoodAsideFromProductKnowledge('会不会好一点？'), true);
    for (const text of ['最近老是想起以前', '我今天练习的太久啦。', '我不想练习，想喝酒。']) {
      assert.equal(isConfideMoodAsideFromProductKnowledge(text), true, text);
    }
    for (const text of ['以前的记录在哪', '我练了多久', '练太久会不会累？', '想起以前的练习记录']) {
      assert.equal(isConfideMoodAsideFromProductKnowledge(text), false, text);
    }
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
    for (const nearAction of ['hit', 'honesty', 'skip']) {
      assert.equal(
        resolveProductKnowledgeGateAction({
          text: '今天想去骑车',
          embeddingState: 'ready',
          semanticIsProduct: false,
          catalogHit: false,
          nearAction
        }),
        'skip',
        `nearAction ${nearAction}`
      );
    }
  });

  it('CR-47: motive / refusal / drink-to-avoid generate when embedding says product-like', () => {
    for (const text of CR47_GENERATE_WHEN_PRODUCT_LIKE) {
      assert.equal(isConfideOperationalProductAskShape(text), false, text);
      for (const nearAction of [undefined, 'honesty']) {
        assert.equal(
          resolveProductKnowledgeGateAction({
            text,
            embeddingState: 'ready',
            semanticIsProduct: true,
            catalogHit: false,
            nearAction
          }),
          'skip',
          `${text} nearAction=${nearAction}`
        );
      }
      assert.equal(
        resolveProductKnowledgeGateAction({
          text,
          embeddingState: 'not_ready',
          semanticIsProduct: false,
          catalogHit: false
        }),
        'skip',
        `${text} cold-start`
      );
    }
  });

  it('CR-49: whether-required shape with product object is operational; activity-only is not', () => {
    assert.equal(classifyConfideProductAskRole('Do I need to check in daily?'), 'whether-required');
    assert.equal(classifyConfideProductAskRole('Do I have to meditate?'), 'none');
    assert.equal(isConfideOperationalProductAskShape('Is daily streak required?'), true);
    assert.equal(isConfideOperationalProductAskShape('Do I have to meditate?'), false);
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: 'Do I need to check in every day?',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false
      }),
      'honesty'
    );
  });

  it('CR-47: confirmed product asks still must not invent steps', () => {
    assert.equal(isConfideOperationalProductAskShape('What is the observation wing?'), true);
    assert.equal(isConfideOperationalProductAskShape('观察翼是什么'), true);
    assert.equal(isConfideOperationalProductAskShape('how do I turn the reminder off'), true);
    assert.equal(isConfideOperationalProductAskShape('the reminder won\'t stop'), true);
    assert.equal(isConfideOperationalProductAskShape('Sit 按钮在哪'), true);
    assert.equal(isConfideOperationalProductAskShape('How can I meditate?'), true);
    assert.equal(isConfideOperationalProductAskShape('What is the point of practice'), false);
    assert.equal(isConfideOperationalProductAskShape("What's the weather like today?"), false);
    for (const text of [
      'What is the observation wing?',
      'how do I turn the reminder off',
      "the reminder won't stop",
      'Sit 按钮在哪',
      'How can I meditate?'
    ]) {
      assert.equal(
        resolveProductKnowledgeGateAction({
          text,
          embeddingState: 'ready',
          semanticIsProduct: true,
          catalogHit: false
        }),
        'honesty',
        text
      );
    }
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: 'How can I do some ground exercise',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: true
      }),
      'hit'
    );
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
