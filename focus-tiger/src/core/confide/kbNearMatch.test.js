/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decideKbNearMatch } from './kbNearMatch.js';

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
