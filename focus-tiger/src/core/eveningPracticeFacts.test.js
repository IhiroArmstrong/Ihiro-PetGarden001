/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { clearAllFocusTigerLocalState } from './localStateKeys.js';
import {
  EVENING_PRACTICE_FACTS_CONSENT_KEY,
  EVENING_PRACTICE_FACTS_KEY,
  countLateEveningDaysInWindow,
  getEveningPracticePaperFact,
  isQualifyingEveningEndLocalTime,
  readEveningFactsState,
  recordEveningPracticeFactFromJourneyEntry,
  readEveningFactsConsent,
  setEveningPracticeFactsConsent,
  clearEveningPracticeFactsLedger
} from './eveningPracticeFacts.js';
import { buildT54ResearchUploadPayload } from './t54ResearchUpload.js';
import { setT54ResearchConsent } from './t54ResearchLedger.js';

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

test('qualifying window is 01:00–05:59 local end', () => {
  assert.equal(isQualifyingEveningEndLocalTime(0, 59), false);
  assert.equal(isQualifyingEveningEndLocalTime(1, 0), true);
  assert.equal(isQualifyingEveningEndLocalTime(5, 59), true);
  assert.equal(isQualifyingEveningEndLocalTime(6, 0), false);
  assert.equal(isQualifyingEveningEndLocalTime(23, 0), false);
});

test('no write without consent', () => {
  const storage = mem();
  const ok = recordEveningPracticeFactFromJourneyEntry(storage, {
    at: '2026-10-28T17:30:00.000Z',
    minutes: 120
  });
  assert.equal(ok, false);
  assert.equal(readEveningFactsState(storage).entries.length, 0);
});

test('records qualifying end and counts rolling 7 days', () => {
  const storage = mem();
  setEveningPracticeFactsConsent(storage, true, () => new Date(2026, 9, 28, 12, 0, 0));
  const start = new Date(2026, 9, 27, 0, 45, 0);
  const ok = recordEveningPracticeFactFromJourneyEntry(storage, {
    at: start.toISOString(),
    minutes: 30
  });
  assert.equal(ok, true);
  const state = readEveningFactsState(storage);
  assert.equal(state.entries.length, 1);
  assert.equal(state.entries[0].date, '2026-10-27');
  const fact = getEveningPracticePaperFact(storage, '2026-10-28');
  assert.ok(fact);
  assert.equal(fact.count, 1);
});

test('disabling consent clears ledger (PO §2.4 B)', () => {
  const storage = mem();
  setEveningPracticeFactsConsent(storage, true);
  const start = new Date(2026, 9, 27, 0, 45, 0);
  recordEveningPracticeFactFromJourneyEntry(storage, {
    at: start.toISOString(),
    minutes: 30
  });
  setEveningPracticeFactsConsent(storage, false);
  assert.equal(storage.getItem(EVENING_PRACTICE_FACTS_KEY), null);
  assert.equal(readEveningFactsState(storage).entries.length, 0);
});

test('clear ledger keeps consent', () => {
  const storage = mem();
  setEveningPracticeFactsConsent(storage, true);
  const start = new Date(2026, 9, 27, 0, 45, 0);
  recordEveningPracticeFactFromJourneyEntry(storage, {
    at: start.toISOString(),
    minutes: 30
  });
  clearEveningPracticeFactsLedger(storage);
  assert.equal(getEveningPracticePaperFact(storage, '2026-10-28'), null);
  assert.equal(readEveningFactsConsent(storage).enabled, true);
});

test('evening keys cleared by clearAllFocusTigerLocalState', () => {
  const storage = mem();
  setEveningPracticeFactsConsent(storage, true);
  const start = new Date(2026, 9, 27, 0, 45, 0);
  recordEveningPracticeFactFromJourneyEntry(storage, {
    at: start.toISOString(),
    minutes: 30
  });
  clearAllFocusTigerLocalState(storage);
  assert.equal(storage.getItem(EVENING_PRACTICE_FACTS_KEY), null);
  assert.equal(storage.getItem(EVENING_PRACTICE_FACTS_CONSENT_KEY), null);
});

test('T54 upload payload never includes evening practice keys', () => {
  const storage = mem();
  setT54ResearchConsent(storage, true, () => new Date('2026-10-28T00:00:00.000Z'));
  storage.setItem(
    EVENING_PRACTICE_FACTS_KEY,
    JSON.stringify({ entries: [{ date: '2026-10-27', endHour: 2, endMinute: 0 }] })
  );
  const payload = buildT54ResearchUploadPayload(storage);
  assert.ok(payload);
  const blob = JSON.stringify(payload);
  assert.doesNotMatch(blob, /evening-practice-facts/);
});
