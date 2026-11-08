/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import {
  COMPANION_MODE_ACROSS_TOOLS,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY
} from './FocusSession.js';
import {
  FOCUS_STABLE_PROMOTE_MIN,
  FOCUS_STABLE_SUPPRESS_MS,
  FOCUS_STABLE_WINDOW
} from './stablePrefsStore.js';
import {
  noteBreathMinutesChipChosen,
  noteCompanionModeManualPick,
  onBreathSessionBeginStablePrefs,
  onCompanionSessionBeginStablePrefs,
  rejectStableBreathNotQuite,
  rejectStableCompanionNotQuite,
  resolveStableBreathMinutes,
  resolveStableCompanionMode,
  setBreathStableAwaitingVoteFromChip,
  setCompanionStableAwaitingVoteFromPick
} from './stableBreathCompanionPrefs.js';
import { YIN_ADAPTATION_STORAGE_KEY } from './yinAdaptationStore.js';

function memStorage() {
  /** @type {Map<string, string>} */
  const map = new Map();
  return /** @type {Storage} */ ({
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    }
  });
}

describe('stableBreathCompanionPrefs T78', () => {
  /** @type {Storage} */
  let storage;

  beforeEach(() => {
    storage = memStorage();
    storage.setItem(YIN_ADAPTATION_STORAGE_KEY, JSON.stringify({ enabled: true }));
  });

  it('breath: accept default highlight does not count toward promote', () => {
    const note = noteBreathMinutesChipChosen({ minutes: 1, storage });
    assert.equal(note.recordedQualifying, false);
    setBreathStableAwaitingVoteFromChip(note.recordedQualifying, storage);
    const r = onBreathSessionBeginStablePrefs({ minutes: 1, storage, at: 1000 });
    assert.equal(r.countedVote, false);
    assert.equal(resolveStableBreathMinutes(storage, 1000), null);
  });

  it('breath: manual pick promotes after 3/5 votes', () => {
    let at = 1000;
    for (let i = 0; i < FOCUS_STABLE_PROMOTE_MIN; i++) {
      const note = noteBreathMinutesChipChosen({ minutes: 5, storage });
      setBreathStableAwaitingVoteFromChip(note.recordedQualifying, storage);
      onBreathSessionBeginStablePrefs({ minutes: 5, storage, at });
      at += 60_000;
    }
    assert.equal(resolveStableBreathMinutes(storage, at), 5);
  });

  it('breath: not quite suppresses promotion for 14d', () => {
    let at = 1_000_000;
    for (let i = 0; i < FOCUS_STABLE_WINDOW; i++) {
      const note = noteBreathMinutesChipChosen({ minutes: 3, storage });
      setBreathStableAwaitingVoteFromChip(note.recordedQualifying, storage);
      onBreathSessionBeginStablePrefs({ minutes: 3, storage, at });
      at += 60_000;
    }
    rejectStableBreathNotQuite(storage, at);
    at += 1000;
    const note = noteBreathMinutesChipChosen({ minutes: 3, storage });
    setBreathStableAwaitingVoteFromChip(note.recordedQualifying, storage);
    const r = onBreathSessionBeginStablePrefs({ minutes: 3, storage, at });
    assert.equal(r.countedVote, true);
    assert.equal(r.promoted, false);
    assert.equal(resolveStableBreathMinutes(storage, at + FOCUS_STABLE_SUPPRESS_MS - 1), null);
  });

  it('companion: promotes stay after 3 qualifying begins', () => {
    let at = 2000;
    for (let i = 0; i < FOCUS_STABLE_PROMOTE_MIN; i++) {
      const note = noteCompanionModeManualPick({
        mode: COMPANION_MODE_ACROSS_TOOLS,
        storage
      });
      setCompanionStableAwaitingVoteFromPick(note.recordedQualifying, storage);
      onCompanionSessionBeginStablePrefs({
        mode: COMPANION_MODE_ACROSS_TOOLS,
        storage,
        at
      });
      at += 60_000;
    }
    assert.equal(resolveStableCompanionMode(storage, at), COMPANION_MODE_ACROSS_TOOLS);
  });

  it('companion: matching highlight does not vote', () => {
    const note = noteCompanionModeManualPick({ mode: COMPANION_MODE_STAY, storage });
    assert.equal(note.recordedQualifying, false);
    setCompanionStableAwaitingVoteFromPick(note.recordedQualifying, storage);
    const r = onCompanionSessionBeginStablePrefs({
      mode: COMPANION_MODE_STAY,
      storage,
      at: 3000
    });
    assert.equal(r.countedVote, false);
    assert.equal(resolveStableCompanionMode(storage, 3000), null);
  });

  it('companion: not quite clears stable and suppresses', () => {
    let at = 4000;
    for (let i = 0; i < FOCUS_STABLE_PROMOTE_MIN; i++) {
      const note = noteCompanionModeManualPick({
        mode: COMPANION_MODE_STEP_AWAY,
        storage
      });
      setCompanionStableAwaitingVoteFromPick(note.recordedQualifying, storage);
      onCompanionSessionBeginStablePrefs({
        mode: COMPANION_MODE_STEP_AWAY,
        storage,
        at
      });
      at += 60_000;
    }
    assert.equal(resolveStableCompanionMode(storage, at), COMPANION_MODE_STEP_AWAY);
    rejectStableCompanionNotQuite(storage, at);
    assert.equal(resolveStableCompanionMode(storage, at + 1000), null);
  });
});
