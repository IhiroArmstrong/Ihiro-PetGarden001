/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AWAKEN_STATES } from './InterventionOrchestrator.js';
import { clearAllFocusTigerLocalState } from './localStateKeys.js';
import {
  INVITE_OUTCOME_KINDS,
  INVITE_OUTCOME_MAX_ENTRIES,
  INVITE_OUTCOME_STORAGE_KEY,
  INVITE_OUTCOME_VALUES,
  clearInviteOutcomeRecords,
  inviteKindFromAwakenDecision,
  readInviteOutcomeRecords,
  recordInviteOutcome
} from './inviteOutcomeStore.js';
import { getStorage } from '../utils/Storage.js';

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
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: original
    });
  }
}

describe('inviteOutcomeStore', () => {
  it('maps orchestrator decisions to away / extend / long-sit kinds', () => {
    assert.equal(
      inviteKindFromAwakenDecision({
        show: true,
        kind: 'pause',
        state: AWAKEN_STATES.AWAY_INVITE
      }),
      INVITE_OUTCOME_KINDS.AWAY
    );
    assert.equal(
      inviteKindFromAwakenDecision({
        show: true,
        kind: 'extend',
        state: AWAKEN_STATES.FLOW_PROTECT
      }),
      INVITE_OUTCOME_KINDS.EXTEND
    );
    assert.equal(
      inviteKindFromAwakenDecision({
        show: true,
        kind: 'pause',
        state: AWAKEN_STATES.LONG_SIT_INVITE
      }),
      INVITE_OUTCOME_KINDS.LONG_SIT
    );
  });

  it('records accepted, dismissed, and ignored without copy fields', () => {
    withMockLocalStorage(() => {
      const ts = Date.UTC(2026, 9, 28, 8, 0, 0);
      assert.ok(
        recordInviteOutcome(
          INVITE_OUTCOME_KINDS.AWAY,
          INVITE_OUTCOME_VALUES.ACCEPTED,
          ts
        )
      );
      assert.ok(
        recordInviteOutcome(
          INVITE_OUTCOME_KINDS.EXTEND,
          INVITE_OUTCOME_VALUES.DISMISSED,
          ts + 1
        )
      );
      assert.ok(
        recordInviteOutcome(
          INVITE_OUTCOME_KINDS.LONG_SIT,
          INVITE_OUTCOME_VALUES.IGNORED,
          ts + 2
        )
      );
      const rows = readInviteOutcomeRecords();
      assert.equal(rows.length, 3);
      assert.deepEqual(rows[0], {
        kind: 'away',
        outcome: 'accepted',
        ts
      });
      assert.deepEqual(rows[1], {
        kind: 'extend',
        outcome: 'dismissed',
        ts: ts + 1
      });
      assert.deepEqual(rows[2], {
        kind: 'long-sit',
        outcome: 'ignored',
        ts: ts + 2
      });
      for (const row of rows) {
        assert.equal(Object.keys(row).sort().join(','), 'kind,outcome,ts');
      }
    });
  });

  it('keeps deterministic order for a fixed append sequence', () => {
    withMockLocalStorage(() => {
      const base = Date.UTC(2026, 9, 28, 9, 0, 0);
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.AWAY,
        INVITE_OUTCOME_VALUES.IGNORED,
        base
      );
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.AWAY,
        INVITE_OUTCOME_VALUES.DISMISSED,
        base + 1000
      );
      assert.deepEqual(readInviteOutcomeRecords(), [
        { kind: 'away', outcome: 'ignored', ts: base },
        { kind: 'away', outcome: 'dismissed', ts: base + 1000 }
      ]);
    });
  });

  it('drops oldest rows beyond the cap', () => {
    withMockLocalStorage(() => {
      for (let i = 0; i < INVITE_OUTCOME_MAX_ENTRIES + 3; i += 1) {
        recordInviteOutcome(
          INVITE_OUTCOME_KINDS.AWAY,
          INVITE_OUTCOME_VALUES.IGNORED,
          i
        );
      }
      const rows = readInviteOutcomeRecords();
      assert.equal(rows.length, INVITE_OUTCOME_MAX_ENTRIES);
      assert.equal(rows[0].ts, 3);
      assert.equal(rows.at(-1).ts, INVITE_OUTCOME_MAX_ENTRIES + 2);
    });
  });

  it('clearInviteOutcomeRecords empties the ledger for T58 forget', () => {
    withMockLocalStorage(() => {
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.EXTEND,
        INVITE_OUTCOME_VALUES.DISMISSED,
        1
      );
      assert.ok(clearInviteOutcomeRecords());
      assert.deepEqual(readInviteOutcomeRecords(), []);
    });
  });

  it('clearAllFocusTigerLocalState removes invite outcomes (whitelist regression)', () => {
    withMockLocalStorage((storage) => {
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.LONG_SIT,
        INVITE_OUTCOME_VALUES.ACCEPTED,
        42
      );
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.AWAY,
        INVITE_OUTCOME_VALUES.IGNORED,
        43
      );
      recordInviteOutcome(
        INVITE_OUTCOME_KINDS.EXTEND,
        INVITE_OUTCOME_VALUES.DISMISSED,
        44
      );
      assert.equal(getStorage(INVITE_OUTCOME_STORAGE_KEY, []).length, 3);
      clearAllFocusTigerLocalState(storage);
      assert.deepEqual(getStorage(INVITE_OUTCOME_STORAGE_KEY, []), []);
    });
  });

  it('does not persist when localStorage write is a no-op', () => {
    withMockLocalStorage(() => {
      globalThis.localStorage.setItem = () => {};
      assert.equal(
        recordInviteOutcome(
          INVITE_OUTCOME_KINDS.AWAY,
          INVITE_OUTCOME_VALUES.ACCEPTED,
          1
        ),
        false
      );
      assert.deepEqual(readInviteOutcomeRecords(), []);
    });
  });
});
