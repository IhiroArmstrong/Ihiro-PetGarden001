/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildT54ResearchUploadPayload } from './t54ResearchUpload.js';
import { T54_RESEARCH_RECEIVE_FIELDS } from './t54ResearchReceive.js';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS, clearAllFocusTigerLocalState } from './localStateKeys.js';
import {
  PRACTICE_BACKUP_EXPORT_KEYS
} from './practiceBackup/localBackupStorageRegistry.js';
import { PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS } from './practiceBackup/practiceBackupSnapshot.js';
import {
  INVITE_OUTCOME_KINDS,
  INVITE_OUTCOME_VALUES,
  readInviteOutcomeRecords,
  recordInviteOutcome
} from './inviteOutcomeStore.js';
import {
  SESSION_DURATION_OFFER_STORAGE_KEY,
  beginCoPracticeTimedSession,
  clearSessionDurationOfferRecords,
  completeCoPracticeTimedSession,
  countCoPracticeBJoinDaySketches,
  endCoPracticeTimedSessionActive,
  evaluateCoPracticeRhythmStableProxy,
  mintCoPracticeSessionId,
  readSessionDurationOfferRows
} from './coPracticeSessionJoinLedger.js';
import { setYinAdaptationEnabled } from './yinAdaptationStore.js';

function mockStorage() {
  /** @type {Record<string, string>} */
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
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage
  });
  try {
    run(storage);
  } finally {
    endCoPracticeTimedSessionActive();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: original
    });
  }
}

describe('coPracticeSessionJoinLedger (T66)', () => {
  it('mints non-colliding session ids for the same millisecond', () => {
    const a = mintCoPracticeSessionId(1000);
    const b = mintCoPracticeSessionId(1000);
    assert.notEqual(a, b);
    assert.match(a, /^sit-1000-\d+$/);
  });

  it('opens ledger row at timed focus start with offered default minutes', () => {
    withMockLocalStorage(() => {
      const sessionId = beginCoPracticeTimedSession({
        offeredDefaultMinutes: 25,
        startedAtMs: 5000
      });
      assert.ok(sessionId);
      const rows = readSessionDurationOfferRows();
      assert.equal(rows.length, 1);
      assert.equal(rows[0].sessionId, sessionId);
      assert.equal(rows[0].offeredDefaultMinutes, 25);
      assert.equal(rows[0].actualCompletedMinutes, null);
      assert.equal(rows[0].source, 'timed');
    });
  });

  it('records invite outcomes with the same session id during focus', () => {
    withMockLocalStorage(() => {
      const sessionId = beginCoPracticeTimedSession({
        offeredDefaultMinutes: 15,
        startedAtMs: 9000
      });
      assert.ok(sessionId);
      assert.equal(
        recordInviteOutcome(
          INVITE_OUTCOME_KINDS.AWAY,
          INVITE_OUTCOME_VALUES.ACCEPTED,
          9100,
          undefined,
          sessionId
        ),
        true
      );
      const inv = readInviteOutcomeRecords();
      assert.equal(inv.at(-1)?.sessionId, sessionId);
    });
  });

  it('counts one B join day sketch when accepted invite and same session completed', () => {
    withMockLocalStorage(() => {
      const sessionId = beginCoPracticeTimedSession({
        offeredDefaultMinutes: 25,
        startedAtMs: 1
      });
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.EXTEND,
        INVITE_OUTCOME_VALUES.ACCEPTED,
        2,
        undefined,
        sessionId
      );
      completeCoPracticeTimedSession({
        actualCompletedMinutes: 25,
        completedAt: Date.UTC(2026, 9, 28, 12, 0, 0)
      });
      assert.equal(
        countCoPracticeBJoinDaySketches(undefined, undefined, {
          dayKeyFromTs: () => '2026-10-28'
        }),
        1
      );
    });
  });

  it('does not count B when accepted but session not completed', () => {
    withMockLocalStorage(() => {
      const sessionId = beginCoPracticeTimedSession({
        offeredDefaultMinutes: 25,
        startedAtMs: 1
      });
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.AWAY,
        INVITE_OUTCOME_VALUES.ACCEPTED,
        2,
        undefined,
        sessionId
      );
      endCoPracticeTimedSessionActive();
      assert.equal(countCoPracticeBJoinDaySketches(), 0);
    });
  });

  it('ignores legacy invite rows without sessionId for B', () => {
    withMockLocalStorage(() => {
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.AWAY,
        INVITE_OUTCOME_VALUES.ACCEPTED,
        1
      );
      const sessionId = beginCoPracticeTimedSession({
        offeredDefaultMinutes: 10,
        startedAtMs: 2
      });
      completeCoPracticeTimedSession({ actualCompletedMinutes: 10 });
      assert.equal(countCoPracticeBJoinDaySketches(), 0);
      assert.ok(sessionId);
    });
  });

  it('rhythm-stable proxy hits when actual minutes match offered within bandwidth', () => {
    withMockLocalStorage(() => {
      beginCoPracticeTimedSession({ offeredDefaultMinutes: 25, startedAtMs: 1 });
      completeCoPracticeTimedSession({ actualCompletedMinutes: 25 });
      const proxy = evaluateCoPracticeRhythmStableProxy(undefined, {
        bandwidthRatio: 0.2,
        sampleSize: 10,
        adaptationEnabled: true
      });
      assert.equal(proxy.available, true);
      assert.equal(proxy.hitCount, 1);
    });
  });

  it('rhythm-stable proxy misses when actual is far from offered', () => {
    withMockLocalStorage(() => {
      beginCoPracticeTimedSession({ offeredDefaultMinutes: 25, startedAtMs: 1 });
      completeCoPracticeTimedSession({ actualCompletedMinutes: 50 });
      const proxy = evaluateCoPracticeRhythmStableProxy(undefined, {
        bandwidthRatio: 0.2,
        sampleSize: 10,
        adaptationEnabled: true
      });
      assert.equal(proxy.hitCount, 0);
    });
  });

  it('marks rhythm-stable proxy unavailable when adaptation is off', () => {
    withMockLocalStorage(() => {
      setYinAdaptationEnabled(false);
      beginCoPracticeTimedSession({ offeredDefaultMinutes: 25, startedAtMs: 1 });
      completeCoPracticeTimedSession({ actualCompletedMinutes: 25 });
      const proxy = evaluateCoPracticeRhythmStableProxy();
      assert.equal(proxy.available, false);
      assert.equal(proxy.reason, 'adaptation_off');
    });
  });

  it('registers storage key on delete-all whitelist', () => {
    assert.ok(
      FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(SESSION_DURATION_OFFER_STORAGE_KEY)
    );
    withMockLocalStorage((storage) => {
      beginCoPracticeTimedSession({ offeredDefaultMinutes: 10, startedAtMs: 1 });
      assert.ok(storage.getItem(SESSION_DURATION_OFFER_STORAGE_KEY));
      clearAllFocusTigerLocalState(storage);
      assert.equal(storage.getItem(SESSION_DURATION_OFFER_STORAGE_KEY), null);
    });
  });

  it('excludes ledger keys from T54 research receive fields and upload payload', () => {
    assert.ok(
      !T54_RESEARCH_RECEIVE_FIELDS.some((f) =>
        /session-duration-offer|invite-outcome|sessionId/i.test(f)
      )
    );
    withMockLocalStorage((storage) => {
      beginCoPracticeTimedSession({ offeredDefaultMinutes: 15, startedAtMs: 1 });
      completeCoPracticeTimedSession({ actualCompletedMinutes: 15 });
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.LONG_SIT,
        INVITE_OUTCOME_VALUES.ACCEPTED,
        2,
        undefined,
        mintCoPracticeSessionId(3)
      );
      const payload = buildT54ResearchUploadPayload(storage);
      if (payload) {
        const blob = JSON.stringify(payload);
        assert.doesNotMatch(blob, /session-duration-offer/);
        assert.doesNotMatch(blob, /sessionId/);
      }
    });
  });

  it('excludes ledger from practice cloud backup and local export registries', () => {
    assert.ok(!PRACTICE_BACKUP_EXPORT_KEYS.includes(SESSION_DURATION_OFFER_STORAGE_KEY));
    assert.ok(
      !PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS.includes(SESSION_DURATION_OFFER_STORAGE_KEY)
    );
  });

  it('clearSessionDurationOfferRecords empties rows for T58 forget', () => {
    withMockLocalStorage(() => {
      beginCoPracticeTimedSession({ offeredDefaultMinutes: 10, startedAtMs: 1 });
      assert.equal(readSessionDurationOfferRows().length, 1);
      clearSessionDurationOfferRecords();
      assert.equal(readSessionDurationOfferRows().length, 0);
    });
  });
});
