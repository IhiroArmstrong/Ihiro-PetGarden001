/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildObserveShuffleGuessRows,
  evaluateObserveShuffleScreen,
  guessFixtureIdForReply
} from './l3ObserveShuffleScreen.js';

describe('l3ObserveShuffleScreen', () => {
  it('picks the closest fixture vector for a reply', () => {
    const fixtureVectors = [
      { id: 'a', vector: [1, 0, 0] },
      { id: 'b', vector: [0, 1, 0] }
    ];
    const towardA = guessFixtureIdForReply([0.95, 0.05, 0], fixtureVectors);
    assert.equal(towardA.guessedId, 'a');
    assert.ok(towardA.score > 0.9);
    const towardB = guessFixtureIdForReply([0.05, 0.95, 0], fixtureVectors);
    assert.equal(towardB.guessedId, 'b');
    assert.ok(towardB.score > 0.9);
  });

  it('scores shuffle matches with the existing pass bar', () => {
    const rows = buildObserveShuffleGuessRows([
      {
        expectedId: 'a',
        replyVector: [1, 0, 0],
        fixtureVectors: [
          { id: 'a', vector: [1, 0, 0] },
          { id: 'b', vector: [0, 1, 0] }
        ]
      },
      {
        expectedId: 'b',
        replyVector: [0, 1, 0],
        fixtureVectors: [
          { id: 'a', vector: [1, 0, 0] },
          { id: 'b', vector: [0, 1, 0] }
        ]
      }
    ]);
    assert.equal(rows.length, 2);
    const scored = evaluateObserveShuffleScreen(rows);
    assert.equal(scored.hits, 2);
    assert.equal(scored.pass, false);
    assert.equal(scored.passBar, 8);
    assert.equal(scored.minN, 12);
  });
});
