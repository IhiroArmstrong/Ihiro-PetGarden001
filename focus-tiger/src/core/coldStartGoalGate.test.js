/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COLD_START_DIRECT_SIT_HINT_KEY,
  COLD_START_DIRECT_SIT_PENDING_KEY,
  COLD_START_GOAL_OPTIONS_SEEN_KEY,
  COLD_START_GOAL_OPTIONS_VERSION,
  COLD_START_GOAL_OPTIONS_VERSION_BEFORE_T76,
  COLD_START_GOAL_SEEN_KEY,
  COLD_START_GOAL_SESSION_KEY,
  consumeColdStartDirectSitHint,
  markColdStartDirectSitPending,
  getColdStartGoalSessionChoice,
  getSeenColdStartGoalOptionsVersion,
  hasSeenColdStartGoalCard,
  markColdStartGoalSeen,
  markColdStartGoalOptionsVersionSeen,
  migrateColdStartGoalOptionsSeen,
  resolveColdStartGoalAction,
  setColdStartGoalSessionChoice,
  shouldOfferColdStartGoalCard,
  shouldOfferColdStartGoalOptionsRefresh
} from './coldStartGoalGate.js';

function makeStorage() {
  /** @type {Record<string, string>} */
  const map = {};
  return {
    getItem: (key) => (key in map ? map[key] : null),
    setItem: (key, value) => {
      map[key] = String(value);
    },
    removeItem: (key) => {
      delete map[key];
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
    assert.equal(
      storage.getItem(COLD_START_GOAL_OPTIONS_SEEN_KEY),
      String(COLD_START_GOAL_OPTIONS_VERSION)
    );
    assert.equal(hasSeenColdStartGoalCard(storage), true);
    assert.equal(shouldOfferColdStartGoalCard(storage), false);
  });

  it('session choice stays in sessionStorage only', () => {
    const session = makeStorage();
    setColdStartGoalSessionChoice(session, 'mindfulness');
    assert.equal(getColdStartGoalSessionChoice(session), 'mindfulness');
    assert.equal(session.getItem(COLD_START_GOAL_SESSION_KEY), 'mindfulness');
    setColdStartGoalSessionChoice(session, 'bogus');
    assert.equal(getColdStartGoalSessionChoice(session), 'mindfulness');
    session.setItem(COLD_START_GOAL_SESSION_KEY, 'focus');
    assert.equal(getColdStartGoalSessionChoice(session), null);
    assert.equal(session.getItem(COLD_START_GOAL_SESSION_KEY), null);
    session.setItem(COLD_START_GOAL_SESSION_KEY, 'calm');
    assert.equal(getColdStartGoalSessionChoice(session), null);
  });

  it('options refresh: migrate legacy seen without options key', () => {
    const storage = makeStorage();
    storage.setItem(COLD_START_GOAL_SEEN_KEY, '1');
    assert.equal(shouldOfferColdStartGoalOptionsRefresh(storage), true);
    migrateColdStartGoalOptionsSeen(storage);
    assert.equal(
      getSeenColdStartGoalOptionsVersion(storage),
      COLD_START_GOAL_OPTIONS_VERSION_BEFORE_T76
    );
    assert.equal(shouldOfferColdStartGoalOptionsRefresh(storage), true);
  });

  it('options refresh: stale version offers until mark', () => {
    const storage = makeStorage();
    storage.setItem(COLD_START_GOAL_SEEN_KEY, '1');
    storage.setItem(COLD_START_GOAL_OPTIONS_SEEN_KEY, '0');
    assert.equal(shouldOfferColdStartGoalOptionsRefresh(storage), true);
    markColdStartGoalOptionsVersionSeen(storage);
    assert.equal(shouldOfferColdStartGoalOptionsRefresh(storage), false);
  });

  it('options refresh: first-run unseen card never offers', () => {
    const storage = makeStorage();
    assert.equal(shouldOfferColdStartGoalOptionsRefresh(storage), false);
  });

  it('resolveColdStartGoalAction maps to product surfaces', () => {
    assert.deepEqual(resolveColdStartGoalAction('mindfulness'), {
      type: 'direct-sit',
      mode: 'stay',
      minutes: 10
    });
    assert.deepEqual(resolveColdStartGoalAction('breath'), {
      type: 'micro-ritual',
      minutes: 1
    });
    assert.deepEqual(resolveColdStartGoalAction('study-work'), {
      type: 'direct-sit',
      mode: 'acrossTools',
      minutes: 25
    });
    assert.deepEqual(resolveColdStartGoalAction('browse'), { type: 'browse' });
    assert.equal(resolveColdStartGoalAction('focus'), null);
    assert.equal(resolveColdStartGoalAction('calm'), null);
    assert.equal(resolveColdStartGoalAction('nope'), null);
  });

  it('direct-sit hint is once per install', () => {
    const local = makeStorage();
    const session = makeStorage();
    assert.equal(consumeColdStartDirectSitHint(local, session), false);
    markColdStartDirectSitPending(session);
    assert.equal(consumeColdStartDirectSitHint(local, session), true);
    assert.equal(local.getItem(COLD_START_DIRECT_SIT_HINT_KEY), '1');
    markColdStartDirectSitPending(session);
    assert.equal(consumeColdStartDirectSitHint(local, session), false);
    assert.equal(session.getItem(COLD_START_DIRECT_SIT_PENDING_KEY), null);
  });

  it('null storage is safe', () => {
    assert.equal(hasSeenColdStartGoalCard(null), false);
    assert.equal(shouldOfferColdStartGoalCard(null), true);
    markColdStartGoalSeen(null);
    assert.equal(getColdStartGoalSessionChoice(null), null);
    setColdStartGoalSessionChoice(null, 'mindfulness');
  });
});
