/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from './localStateKeys.js';
import {
  pickT54ResearchReceiveFields,
  canUploadT54ResearchPayload,
  T54_RESEARCH_RECEIVE_FIELDS
} from './t54ResearchReceive.js';
import {
  T54_RESEARCH_LOG_STORAGE_KEY,
  T54_RESEARCH_CONSENT_STORAGE_KEY,
  T54_LOG_SOURCE,
  T54_LOG_END,
  FORBIDDEN_LEDGER_KEYS,
  appendT54TimedFocusLog,
  shouldAppendT54TimedFocusLog,
  shouldPostT54ResearchIngest,
  isT54LabUploadEnabled,
  noteTimedFocusEndedForT54
} from './t54ResearchLedger.js';

function mem() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

test('scenario 7: honesty makeup and ritual are not timed-focus return rows', () => {
  assert.equal(
    shouldAppendT54TimedFocusLog({ source: T54_LOG_SOURCE.HONESTY_MAKEUP }),
    false
  );
  assert.equal(
    shouldAppendT54TimedFocusLog({ source: T54_LOG_SOURCE.RITUAL }),
    false
  );
  const storage = mem();
  assert.equal(
    appendT54TimedFocusLog({
      storage,
      source: T54_LOG_SOURCE.HONESTY_MAKEUP,
      startedAtMs: 1_700_000_000_000,
      actualMinutes: 20,
      endKind: T54_LOG_END.COMPLETED
    }),
    null
  );
  assert.equal(storage.getItem(T54_RESEARCH_LOG_STORAGE_KEY), null);
});

test('timed focus self-open appends one local row without touching forbidden ledgers', () => {
  const storage = mem();
  for (const key of FORBIDDEN_LEDGER_KEYS) storage.setItem(key, 'keep');
  const row = appendT54TimedFocusLog({
    storage,
    source: T54_LOG_SOURCE.SELF_OPEN,
    startedAtMs: 1_700_000_000_000,
    plannedMinutes: 25,
    actualMinutes: 24,
    endKind: T54_LOG_END.EARLY_RISE
  });
  assert.equal(row.source, T54_LOG_SOURCE.SELF_OPEN);
  assert.equal(row.nudgeId, null);
  const parsed = JSON.parse(storage.getItem(T54_RESEARCH_LOG_STORAGE_KEY));
  assert.equal(parsed.length, 1);
  for (const key of FORBIDDEN_LEDGER_KEYS) {
    assert.equal(storage.getItem(key), 'keep');
  }
});

test('scenario 1: without consent lab switch still cannot upload', () => {
  assert.equal(canUploadT54ResearchPayload({}), false);
  assert.equal(
    canUploadT54ResearchPayload({ consented: false, labUploadEnabled: true }),
    false
  );
  const storage = mem();
  assert.equal(
    shouldPostT54ResearchIngest({ storage, search: '?t54ResearchUpload=1' }),
    false
  );
  storage.setItem(
    T54_RESEARCH_CONSENT_STORAGE_KEY,
    JSON.stringify({ granted: true })
  );
  assert.equal(
    shouldPostT54ResearchIngest({ storage, search: '?t54ResearchUpload=1' }),
    true
  );
  assert.equal(shouldPostT54ResearchIngest({ storage, search: '' }), false);
  assert.equal(isT54LabUploadEnabled(''), false);
});

test('scenario 12: extra receive fields are dropped and listed', () => {
  const { accepted, dropped, ok } = pickT54ResearchReceiveFields({
    studyId: 't54-r1',
    arm: 'A',
    localResearchCode: 'abc',
    enrolledAt: '2026-10-25T00:00:00.000Z',
    firstEligibleSilence: true,
    observationStatus: 'observing',
    returnedWithin14d: null,
    daysUntilReturn: null,
    satWithin6h: null,
    exited: false,
    email: 'nope@example.com',
    utterance: 'secret'
  });
  assert.equal(ok, true);
  assert.equal(accepted.studyId, 't54-r1');
  assert.equal(accepted.email, undefined);
  assert.deepEqual(dropped.sort(), ['email', 'utterance']);
  assert.ok(T54_RESEARCH_RECEIVE_FIELDS.includes('observationStatus'));
});

test('noteTimedFocusEndedForT54 records self_open and does not ingest by default', () => {
  const storage = mem();
  const session = {
    startedAtMs: 1_700_000_000_000,
    targetMinutes: 25,
    getElapsedSeconds: () => 1500,
    isOpenEnded: () => false
  };
  const result = noteTimedFocusEndedForT54({
    session,
    endedEarly: false,
    storage,
    search: ''
  });
  assert.equal(result.ingestPath, null);
  assert.equal(result.row.source, T54_LOG_SOURCE.SELF_OPEN);
  assert.equal(result.row.endKind, T54_LOG_END.COMPLETED);
});

test('DEV reset whitelist includes T54 keys', () => {
  assert.ok(FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(T54_RESEARCH_LOG_STORAGE_KEY));
  assert.ok(
    FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(T54_RESEARCH_CONSENT_STORAGE_KEY)
  );
});
