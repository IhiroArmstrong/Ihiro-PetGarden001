/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SESSION_PRESENCE_RING_STORAGE_KEY,
  SESSION_PRESENCE_RING_MAX,
  SESSION_PRESENCE_LABELS,
  buildSessionPresenceSummary,
  estimateSessionPresence,
  snapshotFocusSessionForPresence,
  appendSessionPresenceSummary,
  readSessionPresenceRing,
  SessionPresenceCollector
} from './sessionPresenceSummary.js';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from './localStateKeys.js';

const FORBIDDEN_KEYS = [
  'focus-tiger.practice-days.v1',
  'focus-tiger.lotus-pond.v1',
  'focus-tiger.daily-completions.v1',
  'focus-tiger.journey-log.v1',
  'focus-tiger.growth-journey-stage.v1',
  'focus-tiger.presence-signals.v1',
  'focus-tiger.retention-funnel.v1',
  'focus-tiger.practice-backup.v1',
  'focus-tiger.focus-coins.v1'
];

function createMapStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    _map: map
  };
}

/** Persona seeds — Brief table. Thresholds live in SESSION_PRESENCE_ESTIMATE_THRESHOLDS. */
const PERSONAS = Object.freeze([
  Object.freeze({
    id: 'stay-settled',
    seed: {
      companionMode: 'stay',
      plannedMinutes: 25,
      actualSeconds: 25 * 60,
      leaveDurationsSeconds: [],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    summary: { endedEarly: false, leaveCountMax: 1 },
    estimate: SESSION_PRESENCE_LABELS.SETTLED
  }),
  Object.freeze({
    id: 'stay-drifting',
    seed: {
      companionMode: 'stay',
      plannedMinutes: 25,
      actualSeconds: 25 * 60,
      leaveDurationsSeconds: [21, 22, 23],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    summary: { leaveCountMin: 3 },
    estimate: SESSION_PRESENCE_LABELS.DRIFTING
  }),
  Object.freeze({
    id: 'stay-struggling',
    seed: {
      companionMode: 'stay',
      plannedMinutes: 25,
      actualSeconds: 8 * 60,
      leaveDurationsSeconds: [],
      pauseCount: 3,
      extended: false,
      endedEarly: true,
      durationMode: 'fixed'
    },
    summary: { endedEarlyOrPause: true },
    estimate: SESSION_PRESENCE_LABELS.STRUGGLING
  }),
  Object.freeze({
    id: 'across-tools-busy',
    seed: {
      companionMode: 'acrossTools',
      plannedMinutes: 25,
      actualSeconds: 25 * 60,
      leaveDurationsSeconds: [21, 25, 30, 40, 22],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    summary: { leaveCountMin: 3 },
    estimate: SESSION_PRESENCE_LABELS.SETTLED
  }),
  Object.freeze({
    id: 'step-away-offline',
    seed: {
      companionMode: 'stepAway',
      plannedMinutes: 25,
      actualSeconds: 25 * 60,
      leaveDurationsSeconds: [600],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    summary: { highLeaveSeconds: true },
    estimate: SESSION_PRESENCE_LABELS.SETTLED
  }),
  Object.freeze({
    id: 'too-short',
    seed: {
      companionMode: 'stay',
      plannedMinutes: 10,
      actualSeconds: 45,
      leaveDurationsSeconds: [],
      pauseCount: 0,
      extended: false,
      endedEarly: true,
      durationMode: 'fixed'
    },
    summary: { stillWrites: true },
    estimate: SESSION_PRESENCE_LABELS.UNKNOWN
  }),
  Object.freeze({
    id: 'tray-hide-not-leave',
    seed: {
      companionMode: 'stay',
      plannedMinutes: 25,
      actualSeconds: 25 * 60,
      leaveDurationsSeconds: [],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    summary: { leaveCount: 0 },
    estimate: SESSION_PRESENCE_LABELS.SETTLED
  })
]);

test('persona table locks summary numbers and estimator (labels never on summary)', () => {
  for (const persona of PERSONAS) {
    const summary = buildSessionPresenceSummary(persona.seed);
    assert.equal(summary.companionMode, persona.seed.companionMode, persona.id);
    assert.equal('estimate' in summary, false, `${persona.id} must not embed a label`);
    if (persona.summary.endedEarly === false) {
      assert.equal(summary.endedEarly, false, persona.id);
    }
    if (persona.summary.leaveCountMax != null) {
      assert.ok(summary.leaveCount <= persona.summary.leaveCountMax, persona.id);
    }
    if (persona.summary.leaveCountMin != null) {
      assert.ok(summary.leaveCount >= persona.summary.leaveCountMin, persona.id);
    }
    if (persona.summary.endedEarlyOrPause) {
      assert.ok(summary.endedEarly || summary.pauseCount >= 3, persona.id);
    }
    if (persona.summary.highLeaveSeconds) {
      assert.ok(summary.leaveTotalSeconds >= 60, persona.id);
    }
    if (persona.summary.stillWrites) {
      assert.equal(typeof summary.actualSeconds, 'number', persona.id);
    }
    if (persona.summary.leaveCount != null) {
      assert.equal(summary.leaveCount, persona.summary.leaveCount, persona.id);
    }
    const label = estimateSessionPresence(summary);
    assert.equal(label, persona.estimate, persona.id);
    if (persona.id === 'across-tools-busy' || persona.id === 'step-away-offline') {
      assert.notEqual(label, SESSION_PRESENCE_LABELS.DRIFTING, persona.id);
    }
  }
});

test('open-ended plannedMinutes is null', () => {
  const summary = buildSessionPresenceSummary({
    companionMode: 'stay',
    plannedMinutes: 25,
    actualSeconds: 120,
    leaveDurationsSeconds: [],
    pauseCount: 0,
    extended: false,
    endedEarly: false,
    durationMode: 'open'
  });
  assert.equal(summary.plannedMinutes, null);
  assert.equal(summary.durationMode, 'open');
});

test('collector drops raw leave stream after finalize; only summary hits storage', () => {
  const logs = [];
  const storage = createMapStorage();
  for (const key of FORBIDDEN_KEYS) storage.setItem(key, 'keep');
  const collector = new SessionPresenceCollector({
    storage,
    now: () => 1_000_000,
    log: (...args) => logs.push(args)
  });
  collector.begin();
  collector.noteLeave(21_000);
  collector.noteLeave(22_000);
  collector.noteUserPause();
  const summary = collector.finalize({
    companionMode: 'stay',
    plannedMinutes: 25,
    actualSeconds: 600,
    durationMode: 'fixed',
    endedEarly: false
  });
  assert.equal(summary.leaveCount, 2);
  assert.equal(collector.leaveDurationsSeconds.length, 0);
  assert.equal(collector.active, false);
  assert.deepEqual(logs[0][0], '[SessionPresence]');
  assert.equal('estimate' in logs[0][1], false);
  const ring = readSessionPresenceRing(storage);
  assert.equal(ring.length, 1);
  assert.equal(ring[0].leaveCount, 2);
  assert.equal('events' in ring[0], false);
  for (const key of FORBIDDEN_KEYS) {
    assert.equal(storage.getItem(key), 'keep', key);
  }
});

test('in-progress away ≥20s at finalize counts; sub-threshold does not', () => {
  let now = 0;
  const collector = new SessionPresenceCollector({
    storage: createMapStorage(),
    now: () => now,
    log: () => {}
  });
  collector.begin();
  collector.noteAwayStart();
  now = 19_999;
  const short = collector.finalize({
    companionMode: 'stay',
    plannedMinutes: 10,
    actualSeconds: 120,
    durationMode: 'fixed',
    endedEarly: false
  });
  assert.equal(short.leaveCount, 0);

  now = 0;
  collector.begin();
  collector.noteAwayStart();
  now = 20_000;
  const counted = collector.finalize({
    companionMode: 'stay',
    plannedMinutes: 10,
    actualSeconds: 120,
    durationMode: 'fixed',
    endedEarly: false
  });
  assert.equal(counted.leaveCount, 1);
});

test('tray-style resume without onReturn does not increment leaveCount (SB-18)', () => {
  const collector = new SessionPresenceCollector({
    storage: createMapStorage(),
    log: () => {}
  });
  collector.begin();
  collector.noteAwayStart();
  collector.noteAwayResume();
  const summary = collector.finalize({
    companionMode: 'stay',
    plannedMinutes: 25,
    actualSeconds: 25 * 60,
    durationMode: 'fixed',
    endedEarly: false
  });
  assert.equal(summary.leaveCount, 0);
});

test('leaves shorter than 20s are ignored', () => {
  const collector = new SessionPresenceCollector({
    storage: createMapStorage(),
    log: () => {}
  });
  collector.begin();
  collector.noteLeave(19_999);
  const summary = collector.finalize({
    companionMode: 'stay',
    plannedMinutes: 10,
    actualSeconds: 120,
    durationMode: 'fixed',
    endedEarly: false
  });
  assert.equal(summary.leaveCount, 0);
});

test('ring caps at 40 summaries', () => {
  const storage = createMapStorage();
  for (let i = 0; i < SESSION_PRESENCE_RING_MAX + 3; i += 1) {
    appendSessionPresenceSummary(
      buildSessionPresenceSummary({
        companionMode: 'stay',
        plannedMinutes: 10,
        actualSeconds: 60 + i,
        leaveDurationsSeconds: [],
        pauseCount: 0,
        extended: false,
        endedEarly: false,
        durationMode: 'fixed'
      }),
      storage
    );
  }
  const ring = readSessionPresenceRing(storage);
  assert.equal(ring.length, SESSION_PRESENCE_RING_MAX);
  assert.equal(ring[0].actualSeconds, 63);
});

test('append refuses to write a forbidden ledger key', () => {
  const storage = createMapStorage();
  appendSessionPresenceSummary(
    { companionMode: 'stay' },
    storage,
    'focus-tiger.practice-days.v1'
  );
  assert.equal(storage.getItem('focus-tiger.practice-days.v1'), null);
});

test('ring key is on the DEV reset whitelist and is not a presence-signals alias', () => {
  assert.equal(
    FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(SESSION_PRESENCE_RING_STORAGE_KEY),
    true
  );
  assert.notEqual(
    SESSION_PRESENCE_RING_STORAGE_KEY,
    'focus-tiger.presence-signals.v1'
  );
});

test('snapshotFocusSessionForPresence uses wall-clock elapsed and open planned null', () => {
  const fixed = {
    companionMode: 'stay',
    targetMinutes: 25,
    durationMode: 'fixed',
    isOpenEnded: () => false,
    getElapsedSeconds: () => 90.8
  };
  assert.deepEqual(snapshotFocusSessionForPresence(fixed, { endedEarly: true }), {
    companionMode: 'stay',
    plannedMinutes: 25,
    actualSeconds: 90,
    durationMode: 'fixed',
    endedEarly: true
  });
  const open = {
    ...fixed,
    durationMode: 'open',
    isOpenEnded: () => true
  };
  assert.equal(
    snapshotFocusSessionForPresence(open, { endedEarly: false }).plannedMinutes,
    null
  );
});

test('peek does not log or reset; finalize still writes once and takePendingLabel is one-shot', () => {
  const logs = [];
  const storage = createMapStorage();
  const collector = new SessionPresenceCollector({
    storage,
    log: (...args) => logs.push(args)
  });
  collector.begin();
  collector.noteLeave(21_000);
  collector.noteLeave(22_000);
  collector.noteLeave(23_000);
  const snap = {
    companionMode: 'stay',
    plannedMinutes: 25,
    actualSeconds: 25 * 60,
    durationMode: 'fixed',
    endedEarly: false
  };
  const peeked = collector.peek(snap);
  assert.equal(peeked.leaveCount, 3);
  assert.equal(logs.length, 0);
  assert.equal(readSessionPresenceRing(storage).length, 0);
  const summary = collector.finalize(snap);
  assert.equal(summary.leaveCount, 3);
  assert.equal(logs.length, 1);
  assert.equal(readSessionPresenceRing(storage).length, 1);
  assert.equal(collector.takePendingLabel(), SESSION_PRESENCE_LABELS.DRIFTING);
  assert.equal(collector.takePendingLabel(), null);
  assert.equal(collector.finalize(snap), null);
});

test('complete-path pause must not be counted unless noteUserPause ran', () => {
  const collector = new SessionPresenceCollector({
    storage: createMapStorage(),
    log: () => {}
  });
  collector.begin();
  const summary = collector.finalize({
    companionMode: 'stay',
    plannedMinutes: 25,
    actualSeconds: 25 * 60,
    durationMode: 'fixed',
    endedEarly: false
  });
  assert.equal(summary.pauseCount, 0);
});
