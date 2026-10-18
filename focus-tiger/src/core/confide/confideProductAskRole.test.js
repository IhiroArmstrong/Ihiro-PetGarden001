/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  catalogEntryEligibleForAskRole,
  classifyConfideProductAskRole,
  pickNearestCatalogEmbeddingMatch
} from './confideProductAskRole.js';
import { catalogEntryEmbeddingPhrases } from './kbNearMatch.js';
import catalog from './productKnowledgeCatalog.json' with { type: 'json' };

describe('classifyConfideProductAskRole', () => {
  it('maps whether-required only with a product object, not activity-only', () => {
    assert.equal(
      classifyConfideProductAskRole('Do I have to check in every day?'),
      'whether-required'
    );
    assert.equal(
      classifyConfideProductAskRole('Is daily streak required for Honesty Check-in?'),
      'whether-required'
    );
    assert.equal(classifyConfideProductAskRole('Do I have to meditate?'), 'none');
    assert.equal(classifyConfideProductAskRole('Must I practice every day?'), 'none');
  });

  it('keeps where/how/what-is lanes separate from chitchat', () => {
    assert.equal(classifyConfideProductAskRole('Where is background music control?'), 'where');
    assert.equal(classifyConfideProductAskRole('How can I turn ambient sound off?'), 'how');
    assert.equal(classifyConfideProductAskRole('What is the observation wing?'), 'what-is');
    assert.equal(classifyConfideProductAskRole('I had noodles for lunch'), 'none');
  });

  it('CR-51: whether-required precedes motivation; why-compare is closed compare/benefit', () => {
    assert.equal(
      classifyConfideProductAskRole('Why should I do some meditation?'),
      'none'
    );
    assert.equal(
      classifyConfideProductAskRole('Are focus practice and meditation the same thing?'),
      'why-compare'
    );
    assert.equal(
      classifyConfideProductAskRole('Why do I have to check in every day?'),
      'whether-required'
    );
    assert.equal(classifyConfideProductAskRole('Do I have to meditate?'), 'none');
    assert.equal(classifyConfideProductAskRole('I had noodles for lunch'), 'none');
  });
});

describe('catalog fact keys and ask-role lanes', () => {
  const byId = Object.fromEntries(catalog.entries.map((row) => [row.id, row]));

  it('uses locked fact keys for 0020 / 0037 / 0038 without short-answer bleed', () => {
    assert.deepEqual(catalogEntryEmbeddingPhrases(byId['KB-FUNC-0037']), [
      'Where is the idle-screen control that turns background music or ambient sound on or off?'
    ]);
    assert.deepEqual(catalogEntryEmbeddingPhrases(byId['KB-FUNC-0038']), [
      'Is Honesty Check-in or a daily streak required, or can I sit with Yin without checking in?'
    ]);
    assert.deepEqual(catalogEntryEmbeddingPhrases(byId['KB-FUNC-0020']), [
      'Where do I open Honesty Check-in to record quiet time I already did elsewhere?'
    ]);
    const withFailedAsk = {
      ...byId['KB-FUNC-0038'],
      keywords: [...byId['KB-FUNC-0038'].keywords, 'do I have to check in every day']
    };
    assert.deepEqual(
      catalogEntryEmbeddingPhrases(byId['KB-FUNC-0038']),
      catalogEntryEmbeddingPhrases(withFailedAsk)
    );
  });

  it('splits 0020 vs 0038 by whether-required vs where', () => {
    assert.equal(catalogEntryEligibleForAskRole(byId['KB-FUNC-0038'], 'whether-required'), true);
    assert.equal(catalogEntryEligibleForAskRole(byId['KB-FUNC-0020'], 'whether-required'), false);
    assert.equal(catalogEntryEligibleForAskRole(byId['KB-FUNC-0020'], 'where'), true);
    assert.equal(catalogEntryEligibleForAskRole(byId['KB-FUNC-0038'], 'where'), false);
    assert.equal(catalogEntryEligibleForAskRole(byId['KB-EDU-0003'], 'what-is'), true);
    assert.equal(catalogEntryEligibleForAskRole(byId['KB-EDU-0003'], 'why-compare'), true);
    assert.equal(catalogEntryEligibleForAskRole(byId['KB-EDU-0003'], 'where'), false);
    assert.equal(catalogEntryEligibleForAskRole(byId['KB-FUNC-0038'], 'why-compare'), false);
  });

  it('locks EDU-0003 fact key; keywords do not become retrieval phrases', () => {
    const locked =
      'Are focus practice, meditation, and mindfulness the same thing, or is Sit with Yin a Focus sit rather than a generic meditation class?';
    assert.deepEqual(catalogEntryEmbeddingPhrases(byId['KB-EDU-0003']), [locked]);
    const withFailedAsk = {
      ...byId['KB-EDU-0003'],
      keywords: [...byId['KB-EDU-0003'].keywords, 'failed ask must not become a retrieval phrase']
    };
    assert.deepEqual(catalogEntryEmbeddingPhrases(byId['KB-EDU-0003']), catalogEntryEmbeddingPhrases(withFailedAsk));
  });

  it('pickNearest only searches the same ask-role lane', () => {
    const rows = [
      {
        id: 'KB-FUNC-0020',
        entry: byId['KB-FUNC-0020'],
        vector: [1, 0, 0]
      },
      {
        id: 'KB-FUNC-0038',
        entry: byId['KB-FUNC-0038'],
        vector: [0.99, 0.01, 0]
      }
    ];
    const whetherPick = pickNearestCatalogEmbeddingMatch(
      rows,
      [1, 0, 0],
      (a, b) => a[0] * b[0] + a[1] * b[1],
      'whether-required'
    );
    assert.equal(whetherPick.nearestId, 'KB-FUNC-0038');
    const wherePick = pickNearestCatalogEmbeddingMatch(
      rows,
      [1, 0, 0],
      (a, b) => a[0] * b[0] + a[1] * b[1],
      'where'
    );
    assert.equal(wherePick.nearestId, 'KB-FUNC-0020');
  });

  it('reports lead margin between the top two cards in the lane', () => {
    const rows = [
      { id: 'card-a', entry: { askRoleShapes: ['whether-required'] }, vector: [0.9, 0] },
      { id: 'card-a', entry: { askRoleShapes: ['whether-required'] }, vector: [0.85, 0] },
      { id: 'card-b', entry: { askRoleShapes: ['whether-required'] }, vector: [0.8, 0] }
    ];
    const pick = pickNearestCatalogEmbeddingMatch(
      rows,
      [1, 0],
      (a, b) => a[0] * b[0] + a[1] * b[1],
      'whether-required'
    );
    assert.equal(pick.nearestId, 'card-a');
    assert.ok(Math.abs(pick.leadMargin - 0.1) < 1e-9);
  });

  it('returns no neighbor when ask role is none', () => {
    const rows = [
      { id: 'KB-FUNC-0037', entry: byId['KB-FUNC-0037'], vector: [1, 0] }
    ];
    const pick = pickNearestCatalogEmbeddingMatch(rows, [1, 0], (a, b) => a[0] * b[0], 'none');
    assert.equal(pick.nearestId, null);
    assert.equal(pick.nearestScore, null);
  });
});
