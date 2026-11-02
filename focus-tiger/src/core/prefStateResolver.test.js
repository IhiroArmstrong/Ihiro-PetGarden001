/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { appendAwakenCheckIn, AWAKEN_CHECKIN_STORAGE_KEY } from './awakenCheckInStore.js';
import {
  FOCUS_DURATION_STORAGE_KEY,
  savePreferredFocusDurationMinutes
} from './focusDuration.js';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS, clearAllFocusTigerLocalState } from './localStateKeys.js';
import {
  noteFocusDurationChipChosen,
  noteRecipeFocusDurationWrite,
  PREF_STATE_READ_STORAGE_KEY,
  resolveHabitualFocusMinutesFromPicks,
  resolveHighlightFocusMinutes,
  resolvePrefStateReadModel,
  setHabitualHighlightConsent
} from './prefStateResolver.js';
import { T54_RESEARCH_RECEIVE_FIELDS } from './t54ResearchReceive.js';
import { setYinAdaptationEnabled } from './yinAdaptationStore.js';

function mockStorage() {
  const data = {};
  return {
    getItem(k) {
      return data[k] ?? null;
    },
    setItem(k, v) {
      data[k] = String(v);
    },
    removeItem(k) {
      delete data[k];
    }
  };
}

function withMockLocalStorage(run) {
  const storage = mockStorage();
  const original = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage
  });
  try {
    return run(storage);
  } finally {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: original
    });
  }
}

describe('prefStateResolver', () => {
  it('new user: default 10, no habitual, no stored last', () => {
    withMockLocalStorage((storage) => {
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.highlightFocusMinutes, 10);
      assert.equal(model.habitualFocusMinutes, null);
      assert.equal(model.hasStoredFocusDurationPreference, false);
      assert.equal(model.tiredSuggestsShorter, false);
    });
  });

  it('one or two qualifying picks of the same tier: no habitual, highlight last', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(
        PREF_STATE_READ_STORAGE_KEY,
        JSON.stringify({
          qualifyingManualPicks: [
            { minutes: 15, at: 1 },
            { minutes: 15, at: 2 }
          ]
        })
      );
      savePreferredFocusDurationMinutes(15, storage);
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.habitualFocusMinutes, null);
      assert.equal(model.highlightFocusMinutes, 15);
    });
  });

  it('three qualifying picks of one tier in the window: habitual and highlight that tier', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(
        PREF_STATE_READ_STORAGE_KEY,
        JSON.stringify({
          qualifyingManualPicks: [
            { minutes: 25, at: 1 },
            { minutes: 25, at: 2 },
            { minutes: 25, at: 3 }
          ]
        })
      );
      savePreferredFocusDurationMinutes(25, storage);
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.habitualFocusMinutes, 25);
      assert.equal(model.highlightFocusMinutes, 25);
    });
  });

  it('tied counts at ≥3: no habitual (strict unique first; do not take newest)', () => {
    const picks = [];
      const tiers = [15, 25, 45, 10];
    for (let round = 0; round < 3; round += 1) {
      for (const minutes of tiers) {
        picks.push({ minutes, at: round * 10 + minutes });
      }
    }
    assert.equal(resolveHabitualFocusMinutesFromPicks(picks), null);
    withMockLocalStorage((storage) => {
      savePreferredFocusDurationMinutes(45, storage);
      let at = 1;
      for (let round = 0; round < 3; round += 1) {
        for (const minutes of tiers) {
          noteFocusDurationChipChosen({ minutes, storage, at });
          savePreferredFocusDurationMinutes(minutes, storage);
          at += 1;
        }
      }
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.habitualFocusMinutes, null);
      assert.equal(model.highlightFocusMinutes, 10);
    });
  });

  it('accepting the current highlight is not a qualifying pick (intentional: habitual does not age out)', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(
        PREF_STATE_READ_STORAGE_KEY,
        JSON.stringify({
          qualifyingManualPicks: [
            { minutes: 25, at: 1 },
            { minutes: 25, at: 2 },
            { minutes: 25, at: 3 }
          ]
        })
      );
      savePreferredFocusDurationMinutes(25, storage);
      assert.equal(resolvePrefStateReadModel(storage).habitualFocusMinutes, 25);
      const before = JSON.parse(storage.getItem(PREF_STATE_READ_STORAGE_KEY));
      const pickCount = before.qualifyingManualPicks.length;
      const result = noteFocusDurationChipChosen({ minutes: 25, storage, at: 99 });
      assert.equal(result.acceptedHighlight, true);
      assert.equal(result.recordedQualifying, false);
      const after = JSON.parse(storage.getItem(PREF_STATE_READ_STORAGE_KEY));
      assert.equal(after.qualifyingManualPicks.length, pickCount);
      assert.equal(after.highlightAcceptedCount, 1);
      assert.equal(resolvePrefStateReadModel(storage).habitualFocusMinutes, 25);
    });
  });

  it('tired short-tier wins over habitual 25 (T58 one-below, not cumulative)', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(
        'focus-tiger.focus-duration-manual-anchor.v1',
        JSON.stringify({ minutes: 25, ts: 1 })
      );
      savePreferredFocusDurationMinutes(25, storage);
      storage.setItem(
        PREF_STATE_READ_STORAGE_KEY,
        JSON.stringify({
          qualifyingManualPicks: [
            { minutes: 25, at: 1 },
            { minutes: 25, at: 2 },
            { minutes: 25, at: 3 }
          ]
        })
      );
      for (let i = 0; i < 3; i += 1) {
        appendAwakenCheckIn(
          { sessionId: `s${i}`, ts: 1000 + i, label: 'tired', phase: 'end' },
          AWAKEN_CHECKIN_STORAGE_KEY
        );
      }
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.habitualFocusMinutes, 25);
      assert.equal(model.tiredSuggestsShorter, true);
      assert.equal(model.highlightFocusMinutes, 15);
    });
  });

  it('window of last 12 drops an old habitual 25 after twelve newer 10s', () => {
    withMockLocalStorage((storage) => {
      const old25 = [1, 2, 3].map((at) => ({ minutes: 25, at }));
      const new10 = Array.from({ length: 12 }, (_, i) => ({
        minutes: 10,
        at: 100 + i
      }));
      storage.setItem(
        PREF_STATE_READ_STORAGE_KEY,
        JSON.stringify({ qualifyingManualPicks: [...old25, ...new10] })
      );
      savePreferredFocusDurationMinutes(10, storage);
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.habitualFocusMinutes, 10);
      assert.equal(model.highlightFocusMinutes, 10);
    });
  });

  it('recipe write-back does not count toward habitual', () => {
    withMockLocalStorage((storage) => {
      savePreferredFocusDurationMinutes(10, storage);
      for (let i = 0; i < 3; i += 1) {
        noteRecipeFocusDurationWrite(45, storage);
        savePreferredFocusDurationMinutes(45, storage);
      }
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.habitualFocusMinutes, null);
      assert.equal(model.lastStoredFocusMinutes, 45);
      assert.equal(model.highlightFocusMinutes, 45);
    });
  });

  it('adaptation off: no tired short-tier; habitual still highlights', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(
        'focus-tiger.focus-duration-manual-anchor.v1',
        JSON.stringify({ minutes: 25, ts: 1 })
      );
      savePreferredFocusDurationMinutes(25, storage);
      storage.setItem(
        PREF_STATE_READ_STORAGE_KEY,
        JSON.stringify({
          qualifyingManualPicks: [
            { minutes: 25, at: 1 },
            { minutes: 25, at: 2 },
            { minutes: 25, at: 3 }
          ]
        })
      );
      for (let i = 0; i < 3; i += 1) {
        appendAwakenCheckIn(
          { sessionId: `t${i}`, ts: 2000 + i, label: 'tired', phase: 'end' },
          AWAKEN_CHECKIN_STORAGE_KEY
        );
      }
      setYinAdaptationEnabled(false);
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.adaptationEnabled, false);
      assert.equal(model.tiredSuggestsShorter, false);
      assert.equal(model.habitualFocusMinutes, 25);
      assert.equal(model.highlightFocusMinutes, 25);
    });
  });

  it('delete-all clears pref-state ledger; T54 payload fields stay unchanged', () => {
    withMockLocalStorage((storage) => {
      noteFocusDurationChipChosen({ minutes: 15, storage, at: 1 });
      assert.ok(storage.getItem(PREF_STATE_READ_STORAGE_KEY));
      clearAllFocusTigerLocalState(storage);
      assert.equal(storage.getItem(PREF_STATE_READ_STORAGE_KEY), null);
      assert.equal(resolvePrefStateReadModel(storage).habitualFocusMinutes, null);
    });
    assert.ok(FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(PREF_STATE_READ_STORAGE_KEY));
    assert.equal(T54_RESEARCH_RECEIVE_FIELDS.includes(PREF_STATE_READ_STORAGE_KEY), false);
    assert.equal(T54_RESEARCH_RECEIVE_FIELDS.includes('habitualFocusMinutes'), false);
    assert.equal(T54_RESEARCH_RECEIVE_FIELDS.includes('qualifyingManualPicks'), false);
    assert.equal(T54_RESEARCH_RECEIVE_FIELDS.includes('habitualHighlightConsent'), false);
    assert.equal(T54_RESEARCH_RECEIVE_FIELDS.includes('habitualProposalAcceptedCount'), false);
  });

  it('reject habitual: highlight falls back to last; tired still wins after accept', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(
        PREF_STATE_READ_STORAGE_KEY,
        JSON.stringify({
          qualifyingManualPicks: [
            { minutes: 25, at: 1 },
            { minutes: 25, at: 2 },
            { minutes: 25, at: 3 }
          ]
        })
      );
      savePreferredFocusDurationMinutes(25, storage);
      assert.equal(resolvePrefStateReadModel(storage).needsHabitualConfirm, true);
      assert.equal(setHabitualHighlightConsent('rejected', storage, 50), true);
      const afterNo = resolvePrefStateReadModel(storage);
      assert.equal(afterNo.habitualFocusMinutes, 25);
      assert.equal(afterNo.needsHabitualConfirm, false);
      assert.equal(afterNo.skipHabitualHighlight, true);
      assert.equal(afterNo.highlightFocusMinutes, 25);
      savePreferredFocusDurationMinutes(10, storage);
      assert.equal(resolvePrefStateReadModel(storage).highlightFocusMinutes, 10);
    });
  });

  it('accept habitual does not change highlight order; tired still wins', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(
        'focus-tiger.focus-duration-manual-anchor.v1',
        JSON.stringify({ minutes: 25, ts: 1 })
      );
      savePreferredFocusDurationMinutes(25, storage);
      storage.setItem(
        PREF_STATE_READ_STORAGE_KEY,
        JSON.stringify({
          qualifyingManualPicks: [
            { minutes: 25, at: 1 },
            { minutes: 25, at: 2 },
            { minutes: 25, at: 3 }
          ]
        })
      );
      assert.equal(setHabitualHighlightConsent('accepted', storage, 40), true);
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.needsHabitualConfirm, false);
      assert.equal(model.highlightFocusMinutes, 25);
      for (let i = 0; i < 3; i += 1) {
        appendAwakenCheckIn(
          { sessionId: `yes${i}`, ts: 3000 + i, label: 'tired', phase: 'end' },
          AWAKEN_CHECKIN_STORAGE_KEY
        );
      }
      const tired = resolvePrefStateReadModel(storage);
      assert.equal(tired.tiredSuggestsShorter, true);
      assert.equal(tired.highlightFocusMinutes, 15);
    });
  });

  it('after reject, three new qualifying 25s re-ask and still skip until answered', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(
        PREF_STATE_READ_STORAGE_KEY,
        JSON.stringify({
          qualifyingManualPicks: [
            { minutes: 25, at: 1 },
            { minutes: 25, at: 2 },
            { minutes: 25, at: 3 }
          ]
        })
      );
      savePreferredFocusDurationMinutes(25, storage);
      setHabitualHighlightConsent('rejected', storage, 10);
      savePreferredFocusDurationMinutes(10, storage);
      for (let i = 0; i < 3; i += 1) {
        noteFocusDurationChipChosen({ minutes: 25, storage, at: 20 + i });
      }
      savePreferredFocusDurationMinutes(25, storage);
      const model = resolvePrefStateReadModel(storage);
      assert.equal(model.habitualFocusMinutes, 25);
      assert.equal(model.needsHabitualConfirm, true);
      assert.equal(model.skipHabitualHighlight, true);
      assert.equal(model.highlightFocusMinutes, 25);
    });
  });

  it('resolveHighlightFocusMinutes matches the read model highlight', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(FOCUS_DURATION_STORAGE_KEY, JSON.stringify({ minutes: 15, mode: 'fixed' }));
      assert.equal(resolveHighlightFocusMinutes(storage), 15);
    });
  });
});
