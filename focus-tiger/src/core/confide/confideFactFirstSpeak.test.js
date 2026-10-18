/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  catalogKeywordSpeakAllowed,
  resolveConfideFactFirstSpeak
} from './confideFactFirstSpeak.js';
import { getRetrievableProductKnowledgeEntry } from './confideProductKnowledge.js';
import {
  formatHelpCenterExcerpt,
  helpCenterEmbeddingPhrases,
  decideHelpCenterExcerpt
} from './confideHelpCenterExcerpt.js';
import { findHelpCenterArticle } from '../helpCenterCatalog.js';
import {
  CONFIDE_RECORD_INTENT_KIND,
  CONFIDE_RECORD_INTENT_PROTOTYPES,
  decideConfideRecordIntent,
  pickNearestRecordIntent
} from './confideRecordIntent.js';
import { DEFAULT_KB_NEAR_HIT_MIN } from './kbNearMatch.js';

describe('CR-50 fact-first speak', () => {
  it('does not retune the near-match hit line', () => {
    assert.equal(DEFAULT_KB_NEAR_HIT_MIN, 0.8);
  });

  it('rejects a keyword hit when embeddings say a different card', () => {
    const entry = getRetrievableProductKnowledgeEntry('KB-FUNC-0020');
    assert.equal(
      catalogKeywordSpeakAllowed({
        catalogHit: true,
        catalogId: 'KB-FUNC-0020',
        embeddingState: 'ready',
        nearestId: 'KB-FUNC-0038',
        nearestScore: 0.91,
        text: 'Is daily check-in required?',
        entry
      }),
      false
    );
  });

  it('T17: semantic product ask can hit below 0.80 when lead margin clears', () => {
    const spoken = resolveConfideFactFirstSpeak({
      text: 'Is a daily streak required, or can I skip check-in?',
      catalogResult: { hit: false },
      embeddingState: 'ready',
      semanticIsProduct: true,
      nearestId: 'KB-FUNC-0038',
      nearestScore: 0.71,
      leadMargin: 0.06
    });
    assert.equal(spoken.action, 'product_knowledge');
    assert.equal(spoken.id, 'KB-FUNC-0038');
  });

  it('T17: without semantic product confirm, sub-0.80 must not speak a card', () => {
    const spoken = resolveConfideFactFirstSpeak({
      text: 'I feel tired and want to vent.',
      catalogResult: { hit: false },
      embeddingState: 'ready',
      semanticIsProduct: false,
      nearestId: 'KB-FUNC-0038',
      nearestScore: 0.71,
      leadMargin: 0.06
    });
    assert.notEqual(spoken.action, 'product_knowledge');
  });

  it('allows a keyword hit only when the near-match is the same card', () => {
    const entry = getRetrievableProductKnowledgeEntry('KB-FUNC-0038');
    assert.equal(
      catalogKeywordSpeakAllowed({
        catalogHit: true,
        catalogId: 'KB-FUNC-0038',
        embeddingState: 'ready',
        nearestId: 'KB-FUNC-0038',
        nearestScore: 0.91,
        text: 'Is daily check-in required?',
        entry
      }),
      true
    );
  });

  it('cold-start still speaks a keyword hit; ready embeddings require the same card', () => {
    assert.equal(
      catalogKeywordSpeakAllowed({
        catalogHit: true,
        catalogId: 'KB-FUNC-0038',
        embeddingState: 'not_ready',
        text: 'I want noodles for dinner'
      }),
      true
    );
    assert.equal(
      catalogKeywordSpeakAllowed({
        catalogHit: true,
        catalogId: 'KB-FUNC-0020',
        embeddingState: 'ready',
        nearestId: null,
        nearestScore: null,
        text: 'Is daily streak required?'
      }),
      false
    );
  });

  it('device-record intent wins over a catalog card', () => {
    const spoken = resolveConfideFactFirstSpeak({
      text: 'Is daily streak required?',
      catalogResult: { hit: true, id: 'KB-FUNC-0038', text: 'optional' },
      embeddingState: 'ready',
      semanticIsProduct: true,
      nearestId: 'KB-FUNC-0038',
      nearestScore: 0.91,
      recordKind: CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD,
      recordScore: 0.88
    });
    assert.equal(spoken.action, 'practice_facts');
  });

  it('after a rejected card, a Help excerpt is preferred to honesty', () => {
    const spoken = resolveConfideFactFirstSpeak({
      text: 'Where do the collections come from?',
      catalogResult: { hit: false },
      embeddingState: 'ready',
      semanticIsProduct: true,
      nearestId: 'KB-FUNC-0011',
      nearestScore: 0.5,
      helpNearestId: 'HELP-BUY-COLLECTIONS',
      helpNearestScore: 0.86
    });
    assert.equal(spoken.action, 'help_center_excerpt');
    assert.equal(spoken.id, 'HELP-BUY-COLLECTIONS');
  });

  it('design-duration without an excerpt goes to companionship, not practice facts', () => {
    const spoken = resolveConfideFactFirstSpeak({
      text: 'How long is one sitting meant to last?',
      catalogResult: { hit: false },
      embeddingState: 'ready',
      semanticIsProduct: true,
      nearestScore: 0.4,
      recordKind: CONFIDE_RECORD_INTENT_KIND.DESIGN_DURATION,
      recordScore: 0.87
    });
    assert.equal(spoken.action, 'skip');
  });

  it('Help excerpts are the first paragraph, never the full article', () => {
    const article = findHelpCenterArticle('HELP-BREATH-DURATION');
    assert.ok(article);
    const phrases = helpCenterEmbeddingPhrases(article);
    assert.equal(phrases.length >= 1, true);
    const body =
      'Breath practice on the left orb offers 1, 3, 5, 10, or 20 minutes. Twenty minutes is the longest Breath sitting.\n\nA full Sit with Yin starts at 10 minutes.';
    const excerpt = formatHelpCenterExcerpt(body);
    assert.match(excerpt, /1, 3, 5, 10, or 20/);
    assert.equal(excerpt.includes('full Sit'), false);
    assert.equal(decideHelpCenterExcerpt({ nearestId: article.id, nearestScore: 0.5 }).action, 'skip');
    assert.equal(
      decideHelpCenterExcerpt({ nearestId: article.id, nearestScore: 0.81 }).action,
      'hit'
    );
  });

  it('record intent uses the same 0.80 door, not a new phrase list', () => {
    assert.equal(
      decideConfideRecordIntent({
        kind: CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD,
        score: 0.79
      }),
      CONFIDE_RECORD_INTENT_KIND.COMPANION
    );
    assert.equal(
      decideConfideRecordIntent({
        kind: CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD,
        score: 0.8
      }),
      CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD
    );
    const picked = pickNearestRecordIntent(
      [
        { kind: CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD, vector: [1, 0] },
        { kind: CONFIDE_RECORD_INTENT_KIND.DESIGN_DURATION, vector: [0, 1] }
      ],
      [0, 1],
      (a, b) => a[0] * b[0] + a[1] * b[1]
    );
    assert.equal(picked.kind, CONFIDE_RECORD_INTENT_KIND.DESIGN_DURATION);
  });

  it('record prototypes contrast this-device log with designed session length', () => {
    const device = CONFIDE_RECORD_INTENT_PROTOTYPES.filter(
      (row) => row.kind === CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD
    );
    const design = CONFIDE_RECORD_INTENT_PROTOTYPES.filter(
      (row) => row.kind === CONFIDE_RECORD_INTENT_KIND.DESIGN_DURATION
    );
    assert.equal(device.length, 3);
    assert.equal(design.length, 1);
    assert.equal(
      device.every((row) => /this (?:device|machine)|already counted on this device/i.test(row.text)),
      true
    );
    assert.match(design[0].text, /designed to last/);
    assert.match(design[0].text, /not my lifetime total/);
    assert.equal(
      CONFIDE_RECORD_INTENT_PROTOTYPES.some((row) => /how long have I practiced according/i.test(row.text)),
      false
    );
  });
});
