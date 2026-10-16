/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  catalogEntryEmbeddingPhrases,
  catalogEntryEmbeddingText,
  decideKbNearMatch,
  splitCatalogCapabilitySentences
} from './kbNearMatch.js';
import catalog from './productKnowledgeCatalog.json' with { type: 'json' };

describe('decideKbNearMatch', () => {
  it('hits the nearest entry only above the hit line', () => {
    assert.deepEqual(
      decideKbNearMatch({ nearestId: 'KB-FUNC-0002', nearestScore: 0.8, hitMin: 0.72, farMax: 0.62 }),
      { action: 'hit', id: 'KB-FUNC-0002', score: 0.8 }
    );
  });

  it('uses honesty between the two lines', () => {
    const row = decideKbNearMatch({
      nearestId: 'KB-FUNC-0002',
      nearestScore: 0.66,
      hitMin: 0.72,
      farMax: 0.62
    });
    assert.equal(row.action, 'honesty');
    assert.equal(row.id, null);
  });

  it('default hit line keeps the 0.79 wrong neighbor out and the 0.81 neighbor in', () => {
    assert.notEqual(
      decideKbNearMatch({ nearestId: 'KB-FUNC-0033', nearestScore: 0.786 }).action,
      'hit'
    );
    assert.equal(
      decideKbNearMatch({ nearestId: 'KB-FUNC-0014', nearestScore: 0.815 }).action,
      'hit'
    );
  });

  it('skips when every entry is far', () => {
    assert.equal(
      decideKbNearMatch({ nearestId: 'KB-FUNC-0001', nearestScore: 0.4, hitMin: 0.72, farMax: 0.62 }).action,
      'skip'
    );
  });
});

describe('catalogEntryEmbeddingText', () => {
  it('uses the short answer and ignores extra keyword phrasings', () => {
    const text = catalogEntryEmbeddingText({
      shortAnswerEn: 'Tap Sit with Yin on the home seat.',
      keywords: ['how can I take a breath', 'take a breath practice']
    });
    assert.match(text, /Tap Sit with Yin on the home seat/);
    assert.equal(text.includes('how can I take a breath'), false);
    assert.equal(text.includes('take a breath practice'), false);
  });

  it('does not change when failed-ask keywords are added without a capability sentence', () => {
    const card = { shortAnswerEn: 'You do not have to check in. Sit with Yin works without it.' };
    const withFailedAsk = {
      ...card,
      keywords: ['do I have to check in every day', 'why do I need a streak']
    };
    assert.equal(catalogEntryEmbeddingText(card), catalogEntryEmbeddingText(withFailedAsk));
  });

  it('uses fact keys for 0037 and 0038 (CR-49 slice 3)', () => {
    const byId = Object.fromEntries(catalog.entries.map((row) => [row.id, row]));
    assert.match(
      catalogEntryEmbeddingText(byId['KB-FUNC-0037']),
      /Where is the idle-screen control that turns background music or ambient sound on or off/
    );
    const checkinPhrases = catalogEntryEmbeddingPhrases(byId['KB-FUNC-0038']);
    assert.equal(checkinPhrases.length, 1);
    assert.match(
      checkinPhrases[0],
      /Is Honesty Check-in or a daily streak required, or can I sit with Yin without checking in/
    );
    assert.equal(
      checkinPhrases.some((row) => row.includes('You do not have to check in')),
      false
    );
    const eduPhrases = catalogEntryEmbeddingPhrases(byId['KB-EDU-0003']);
    assert.equal(eduPhrases.length, 1);
    assert.match(
      eduPhrases[0],
      /Are focus practice, meditation, and mindfulness the same thing/
    );
    assert.equal(eduPhrases[0].includes('Yin explains the words only'), false);
  });

  it('splits a two-sentence capability into two phrases and still ignores keyword asks', () => {
    const entry = {
      capabilityStatementEn:
        'Whether daily check-in is required. Missing a day takes nothing away.',
      shortAnswerEn: 'You do not have to check in. Sit with Yin works without it.',
      keywords: ['must I punch the clock each morning']
    };
    const phrases = catalogEntryEmbeddingPhrases(entry);
    assert.deepEqual(splitCatalogCapabilitySentences(entry.capabilityStatementEn), [
      'Whether daily check-in is required.',
      'Missing a day takes nothing away.'
    ]);
    assert.equal(phrases.includes('must I punch the clock each morning'), false);
    assert.equal(
      phrases.includes('You do not have to check in. Sit with Yin works without it.'),
      true
    );
    assert.equal(
      phrases.filter((row) => row === 'You do not have to check in.').length,
      0
    );
  });
});
