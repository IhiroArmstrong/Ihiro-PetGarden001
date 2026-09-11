/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COLD_START_GOAL_SEEN_KEY,
  COLD_START_GOAL_SESSION_KEY,
  getColdStartGoalSessionChoice,
  hasSeenColdStartGoalCard,
  markColdStartGoalSeen,
  resolveColdStartGoalAction,
  setColdStartGoalSessionChoice,
  shouldOfferColdStartGoalCard
} from './coldStartGoalGate.js';

function makeStorage() {
  /** @type {Record<string, string>} */
  const map = {};
  return {
    getItem: (key) => (key in map ? map[key] : null),
    setItem: (key, value) => {
      map[key] = String(value);
    }
  };
}

describe('coldStartGoalGate', () => {
  it('seen gate: offer only before mark', () => {
    const storage = makeStorage();
    assert.equal(hasSeenColdStartGoalCard(storage), false);
    assert.equal(shouldOfferColdStartGoalCard(storage), true);
    markColdStartGoalSeen(storage);
    assert.equal(storage.getItem(COLD_START_GOAL_SEEN_KEY), '1');
    assert.equal(hasSeenColdStartGoalCard(storage), true);
    assert.equal(shouldOfferColdStartGoalCard(storage), false);
  });

  it('session choice stays in sessionStorage only', () => {
    const session = makeStorage();
    setColdStartGoalSessionChoice(session, 'focus');
    assert.equal(getColdStartGoalSessionChoice(session), 'focus');
    assert.equal(session.getItem(COLD_START_GOAL_SESSION_KEY), 'focus');
    setColdStartGoalSessionChoice(session, 'bogus');
    assert.equal(getColdStartGoalSessionChoice(session), 'focus');
  });

  it('resolveColdStartGoalAction maps to product surfaces', () => {
    assert.deepEqual(resolveColdStartGoalAction('focus'), {
      type: 'micro-ritual',
      minutes: 1
    });
    assert.deepEqual(resolveColdStartGoalAction('study-work'), {
      type: 'micro-ritual',
      minutes: 20
    });
    assert.deepEqual(resolveColdStartGoalAction('calm'), {
      type: 'companion'
    });
    assert.deepEqual(resolveColdStartGoalAction('browse'), { type: 'browse' });
    assert.equal(resolveColdStartGoalAction('nope'), null);
  });

  it('null storage is safe', () => {
    assert.equal(hasSeenColdStartGoalCard(null), false);
    assert.equal(shouldOfferColdStartGoalCard(null), true);
    markColdStartGoalSeen(null);
    assert.equal(getColdStartGoalSessionChoice(null), null);
    setColdStartGoalSessionChoice(null, 'focus');
  });
});
