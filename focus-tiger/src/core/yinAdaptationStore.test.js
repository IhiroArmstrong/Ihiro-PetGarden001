/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AWAKEN_COOLDOWN_MS, decideAwakenInvite } from './InterventionOrchestrator.js';
import {
  FOCUS_DURATION_STORAGE_KEY,
  savePreferredFocusDurationMinutes
} from './focusDuration.js';
import { appendAwakenCheckIn, AWAKEN_CHECKIN_STORAGE_KEY } from './awakenCheckInStore.js';
import {
  INVITE_OUTCOME_KINDS,
  INVITE_OUTCOME_VALUES
} from './inviteOutcomeStore.js';
import {
  YIN_ADAPTATION_STORAGE_KEY,
  applyInviteOutcomeForAdaptation,
  focusDurationOneTierBelow,
  isInviteKindAdaptationPaused,
  readYinAdaptationState,
  resolveAdaptedFocusDurationHighlightMinutes,
  resolveFocusDurationAnchorMinutes,
  setYinAdaptationEnabled
} from './yinAdaptationStore.js';
import { T54_RESEARCH_RECEIVE_FIELDS } from './t54ResearchReceive.js';

function mockStorage() {
  const data = {};
  return {
    getItem(k) {
      return data[k] ?? null;
    },
    setItem(k, v) {
      data[k] = v;
    },
    removeItem(k) {
      delete data[k];
    }
  };
}

function withMockLocalStorage(run) {
  const storage = mockStorage();
  const original = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  try {
    run(storage);
  } finally {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: original });
  }
}

describe('yinAdaptationStore', () => {
  it('pauses after 3 dismissed, not after 3 ignored', () => {
    withMockLocalStorage(() => {
      const kind = INVITE_OUTCOME_KINDS.AWAY;
      const t0 = 1_000_000;
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.DISMISSED, t0);
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.DISMISSED, t0 + 1);
      assert.equal(isInviteKindAdaptationPaused(kind, t0 + 2), false);
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.DISMISSED, t0 + 2);
      assert.equal(isInviteKindAdaptationPaused(kind, t0 + 3), true);
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.IGNORED, t0 + 4);
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.IGNORED, t0 + 5);
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.IGNORED, t0 + 6);
      assert.equal(isInviteKindAdaptationPaused(INVITE_OUTCOME_KINDS.EXTEND, t0 + 7), false);
    });
  });

  it('accepted clears consecutive dismiss streak', () => {
    withMockLocalStorage(() => {
      const kind = INVITE_OUTCOME_KINDS.AWAY;
      const t0 = 2_000_000;
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.DISMISSED, t0);
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.DISMISSED, t0 + 1);
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.ACCEPTED, t0 + 2);
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.DISMISSED, t0 + 3);
      applyInviteOutcomeForAdaptation(kind, INVITE_OUTCOME_VALUES.DISMISSED, t0 + 4);
      assert.equal(isInviteKindAdaptationPaused(kind, t0 + 5), false);
    });
  });

  it('decideAwakenInvite denies when adaptation paused without changing cooldown constant', () => {
    assert.equal(AWAKEN_COOLDOWN_MS, 10 * 60 * 1000);
    const denied = decideAwakenInvite({
      focusing: true,
      kind: 'away',
      displayEligible: true,
      refocusSlotConsumed: true,
      now: 3_000_000,
      inviteAdaptationPaused: true
    });
    assert.equal(denied.reason, 'adaptation-pause');
  });

  it('suggest one tier below anchor when tired enough; never cumulative', () => {
    withMockLocalStorage((storage) => {
      savePreferredFocusDurationMinutes(25, storage);
      storage.setItem(
        'focus-tiger.focus-duration-manual-anchor.v1',
        JSON.stringify({ minutes: 25, ts: 1 })
      );
      for (let i = 0; i < 3; i += 1) {
        appendAwakenCheckIn(
          { sessionId: `s${i}`, ts: 1000 + i, label: 'tired', phase: 'end' },
          AWAKEN_CHECKIN_STORAGE_KEY
        );
      }
      assert.equal(focusDurationOneTierBelow(25), 15);
      assert.equal(resolveAdaptedFocusDurationHighlightMinutes(storage), 15);
      assert.equal(resolveAdaptedFocusDurationHighlightMinutes(storage), 15);
      assert.equal(focusDurationOneTierBelow(10), 10);
    });
  });

  it('legacy pref seeds anchor when no manual marker yet', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(FOCUS_DURATION_STORAGE_KEY, JSON.stringify({ minutes: 25, mode: 'fixed' }));
      assert.equal(resolveFocusDurationAnchorMinutes(storage), 25);
      assert.equal(readYinAdaptationState().legacyPrefSeeded, true);
    });
  });

  it('adaptation off restores default highlight', () => {
    withMockLocalStorage((storage) => {
      savePreferredFocusDurationMinutes(25, storage);
      setYinAdaptationEnabled(false);
      assert.equal(resolveAdaptedFocusDurationHighlightMinutes(storage), 25);
    });
  });

  it('T54 receive whitelist excludes adaptation and invite outcome keys', () => {
    assert.equal(T54_RESEARCH_RECEIVE_FIELDS.includes('inviteOutcomes'), false);
    assert.equal(T54_RESEARCH_RECEIVE_FIELDS.includes('yinAdaptation'), false);
    for (const forbidden of [
      YIN_ADAPTATION_STORAGE_KEY,
      'focus-tiger.invite-outcomes.v1',
      AWAKEN_CHECKIN_STORAGE_KEY
    ]) {
      assert.equal(T54_RESEARCH_RECEIVE_FIELDS.includes(forbidden), false);
    }
  });
});
