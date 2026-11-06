/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import {
  FOCUS_DURATION_MODE_FIXED,
  FOCUS_DURATION_MODE_OPEN,
  FOCUS_DURATION_STORAGE_KEY,
  savePreferredFocusDurationMinutes,
  savePreferredOpenEndedFocus
} from './focusDuration.js';
import {
  defaultStablePrefsState,
  FOCUS_STABLE_PROMOTE_MIN,
  FOCUS_STABLE_SUPPRESS_MS,
  FOCUS_STABLE_WINDOW,
  normalizeStablePrefsState,
  onFocusSessionBeginStablePrefs,
  readStablePrefsState,
  rejectStableFocusNotQuite,
  setFocusStableAwaitingVoteExplicit,
  setFocusStableAwaitingVoteForOpenEnded,
  setFocusStableAwaitingVoteFromChip
} from './stablePrefsStore.js';
import { YIN_ADAPTATION_STORAGE_KEY } from './yinAdaptationStore.js';
import { noteFocusDurationChipChosen } from './prefStateResolver.js';

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

describe('stablePrefsStore T87', () => {
  /** @type {Storage} */
  let storage;

  beforeEach(() => {
    storage = memStorage();
    storage.setItem(
      YIN_ADAPTATION_STORAGE_KEY,
      JSON.stringify({
        enabled: true,
        kindState: {},
        suspendedRules: {},
        hiddenLines: {},
        legacyPrefSeeded: false
      })
    );
  });

  it('default state normalizes cleanly', () => {
    assert.deepEqual(normalizeStablePrefsState(null), defaultStablePrefsState());
  });

  it('does not count vote when accepting default (no chip rewrite)', () => {
    savePreferredFocusDurationMinutes(25, storage);
    setFocusStableAwaitingVoteFromChip(false, storage);
    const r = onFocusSessionBeginStablePrefs({
      durationMode: FOCUS_DURATION_MODE_FIXED,
      targetMinutes: 25,
      storage,
      at: 1000
    });
    assert.equal(r.countedVote, false);
    const st = readStablePrefsState(storage);
    assert.equal(st.focusVoteWindow?.length ?? 0, 0);
  });

  it('counts vote only after chip rewrite then begin', () => {
    savePreferredFocusDurationMinutes(25, storage);
    const note = noteFocusDurationChipChosen({ minutes: 15, storage, at: 1 });
    assert.equal(note.recordedQualifying, true);
    setFocusStableAwaitingVoteFromChip(note.recordedQualifying, storage);
    const r = onFocusSessionBeginStablePrefs({
      durationMode: FOCUS_DURATION_MODE_FIXED,
      targetMinutes: 15,
      storage,
      at: 2000
    });
    assert.equal(r.countedVote, true);
    const st = readStablePrefsState(storage);
    assert.equal(st.focusVoteWindow?.length, 1);
  });

  it('rolling 25,15,25,25 promotes 25 (not consecutive)', () => {
    const minutesSeq = [25, 15, 25, 25];
    let t = 0;
    for (const m of minutesSeq) {
      savePreferredFocusDurationMinutes(m, storage);
      setFocusStableAwaitingVoteFromChip(true, storage);
      onFocusSessionBeginStablePrefs({
        durationMode: FOCUS_DURATION_MODE_FIXED,
        targetMinutes: m,
        storage,
        at: t
      });
      t += 1;
    }
    const st = readStablePrefsState(storage);
    assert.equal(st.focusMinutes?.kind, FOCUS_DURATION_MODE_FIXED);
    assert.equal(st.focusMinutes?.minutes, 25);
  });

  it('promotion requires ≥3 in last 5 votes', () => {
    let t = 0;
    for (let i = 0; i < FOCUS_STABLE_PROMOTE_MIN - 1; i += 1) {
      savePreferredFocusDurationMinutes(25, storage);
      setFocusStableAwaitingVoteFromChip(true, storage);
      onFocusSessionBeginStablePrefs({
        durationMode: FOCUS_DURATION_MODE_FIXED,
        targetMinutes: 25,
        storage,
        at: t
      });
      t += 1;
    }
    let st = readStablePrefsState(storage);
    assert.equal(st.focusMinutes, undefined);

    savePreferredFocusDurationMinutes(25, storage);
    setFocusStableAwaitingVoteFromChip(true, storage);
    onFocusSessionBeginStablePrefs({
      durationMode: FOCUS_DURATION_MODE_FIXED,
      targetMinutes: 25,
      storage,
      at: t
    });
    st = readStablePrefsState(storage);
    assert.ok(st.focusMinutes);
    assert.equal(st.focusMinutes?.minutes, 25);
  });

  it('suppress blocks promotion for 14d', () => {
    rejectStableFocusNotQuite(storage, 1_000_000);
    let t = 2_000_000;
    for (let i = 0; i < FOCUS_STABLE_PROMOTE_MIN; i += 1) {
      savePreferredFocusDurationMinutes(25, storage);
      setFocusStableAwaitingVoteFromChip(true, storage);
      onFocusSessionBeginStablePrefs({
        durationMode: FOCUS_DURATION_MODE_FIXED,
        targetMinutes: 25,
        storage,
        at: t
      });
      t += 1;
    }
    const st = readStablePrefsState(storage);
    assert.equal(st.focusMinutes, undefined);
    assert.ok((st.focusSuppressUntil || 0) >= 1_000_000 + FOCUS_STABLE_SUPPRESS_MS - 1);
  });

  it('open-ended path counts when switching from fixed', () => {
    savePreferredFocusDurationMinutes(25, storage);
    storage.setItem(
      FOCUS_DURATION_STORAGE_KEY,
      JSON.stringify({ minutes: 25, mode: FOCUS_DURATION_MODE_FIXED })
    );
    setFocusStableAwaitingVoteForOpenEnded(false, storage);
    onFocusSessionBeginStablePrefs({
      durationMode: FOCUS_DURATION_MODE_OPEN,
      targetMinutes: 25,
      storage,
      at: 5000
    });
    const st = readStablePrefsState(storage);
    assert.equal(st.focusVoteWindow?.length, 1);
    assert.equal(st.focusVoteWindow?.[0]?.kind, FOCUS_DURATION_MODE_OPEN);
  });

  it('explicit path (cold start) can arm a vote', () => {
    setFocusStableAwaitingVoteExplicit(true, storage);
    savePreferredFocusDurationMinutes(25, storage);
    onFocusSessionBeginStablePrefs({
      durationMode: FOCUS_DURATION_MODE_FIXED,
      targetMinutes: 25,
      storage,
      at: 8000
    });
    const st = readStablePrefsState(storage);
    assert.equal(st.focusVoteWindow?.length, 1);
  });

  it('vote window never exceeds five', () => {
    let t = 0;
    for (let i = 0; i < FOCUS_STABLE_WINDOW + 2; i += 1) {
      savePreferredFocusDurationMinutes(15, storage);
      setFocusStableAwaitingVoteFromChip(true, storage);
      onFocusSessionBeginStablePrefs({
        durationMode: FOCUS_DURATION_MODE_FIXED,
        targetMinutes: 15,
        storage,
        at: t
      });
      t += 1;
    }
    const st = readStablePrefsState(storage);
    assert.equal(st.focusVoteWindow?.length, FOCUS_STABLE_WINDOW);
  });

  it('tie in window does not promote', () => {
    const seq = [25, 15, 10, 25, 15];
    let t = 0;
    for (const m of seq) {
      savePreferredFocusDurationMinutes(m, storage);
      setFocusStableAwaitingVoteFromChip(true, storage);
      onFocusSessionBeginStablePrefs({
        durationMode: FOCUS_DURATION_MODE_FIXED,
        targetMinutes: m,
        storage,
        at: t
      });
      t += 1;
    }
    const st = readStablePrefsState(storage);
    assert.equal(st.focusMinutes, undefined);
  });
});
