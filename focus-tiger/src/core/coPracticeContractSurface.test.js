/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  REMINDER_PREFERENCE_STORAGE_KEY
} from './reminderPreference.js';
import {
  WORK_END_PREFERENCE_STORAGE_KEY
} from './workEndPreference.js';
import {
  T54_RESEARCH_CONSENT_STORAGE_KEY
} from './t54ResearchLedger.js';
import { INVITE_OUTCOME_KINDS } from './inviteOutcomeStore.js';
import { YIN_ADAPTATION_STORAGE_KEY } from './yinAdaptationStore.js';
import {
  buildCoPracticeContractRows,
  CO_PRACTICE_CONTRACT_ROW_IDS,
  formatCoPracticeClockTime
} from './coPracticeContractSurface.js';

function memoryStorage() {
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

describe('coPracticeContractSurface', () => {
  it('formats clock times with leading zeros', () => {
    assert.equal(formatCoPracticeClockTime({ hour: 9, minute: 5 }), '09:05');
  });

  it('marks reminder and work-end off when prefs are empty', () => {
    const storage = memoryStorage();
    const rows = buildCoPracticeContractRows({ storage, now: Date.UTC(2026, 9, 28) });
    const reminder = rows.find((r) => r.id === CO_PRACTICE_CONTRACT_ROW_IDS.DAILY_REMINDER);
    const workEnd = rows.find((r) => r.id === CO_PRACTICE_CONTRACT_ROW_IDS.WORK_END);
    assert.equal(reminder?.status.key, 'CO_PRACTICE_CONTRACT_STATUS_OFF');
    assert.equal(workEnd?.status.key, 'CO_PRACTICE_CONTRACT_STATUS_OFF');
  });

  it('shows user-set times for reminder and work-end', () => {
    const storage = memoryStorage();
    storage.setItem(
      REMINDER_PREFERENCE_STORAGE_KEY,
      JSON.stringify({ hour: 21, minute: 30 })
    );
    storage.setItem(
      WORK_END_PREFERENCE_STORAGE_KEY,
      JSON.stringify({ hour: 22, minute: 15 })
    );
    const rows = buildCoPracticeContractRows({ storage, now: Date.UTC(2026, 9, 28) });
    const reminder = rows.find((r) => r.id === CO_PRACTICE_CONTRACT_ROW_IDS.DAILY_REMINDER);
    assert.equal(reminder?.status.params?.time, '21:30');
  });

  it('reflects T58 pause until date on focus invite row', () => {
    const storage = memoryStorage();
    const now = Date.UTC(2026, 9, 28, 12);
    const pausedUntil = now + 3 * 24 * 60 * 60 * 1000;
    storage.setItem(
      YIN_ADAPTATION_STORAGE_KEY,
      JSON.stringify({
        enabled: true,
        kindState: {
          [INVITE_OUTCOME_KINDS.AWAY]: { pausedUntil, consecutiveDismissed: 0, consecutiveIgnored: 0 }
        },
        suspendedRules: {},
        hiddenLines: {},
        legacyPrefSeeded: false
      })
    );
    const rows = buildCoPracticeContractRows({ storage, now });
    const invite = rows.find((r) => r.id === CO_PRACTICE_CONTRACT_ROW_IDS.FOCUS_INVITE);
    assert.equal(invite?.status.key, 'CO_PRACTICE_CONTRACT_STATUS_PAUSED');
    assert.ok(invite?.status.params?.date);
  });

  it('follows adaptation off on invite and adaptation rows', () => {
    const storage = memoryStorage();
    storage.setItem(
      YIN_ADAPTATION_STORAGE_KEY,
      JSON.stringify({
        enabled: false,
        kindState: {},
        suspendedRules: {},
        hiddenLines: {},
        legacyPrefSeeded: false
      })
    );
    const rows = buildCoPracticeContractRows({ storage, now: Date.UTC(2026, 9, 28) });
    const invite = rows.find((r) => r.id === CO_PRACTICE_CONTRACT_ROW_IDS.FOCUS_INVITE);
    const adaptation = rows.find((r) => r.id === CO_PRACTICE_CONTRACT_ROW_IDS.ADAPTATION);
    assert.equal(invite?.status.key, 'CO_PRACTICE_CONTRACT_STATUS_INVITE_QUIET');
    assert.equal(adaptation?.status.key, 'CO_PRACTICE_CONTRACT_STATUS_OFF');
  });

  it('reads research consent without new keys', () => {
    const storage = memoryStorage();
    storage.setItem(
      T54_RESEARCH_CONSENT_STORAGE_KEY,
      JSON.stringify({ granted: true, consentedAt: '2026-10-01T00:00:00.000Z', layer: 'product_improve' })
    );
    const rows = buildCoPracticeContractRows({ storage, now: Date.UTC(2026, 9, 28) });
    const research = rows.find((r) => r.id === CO_PRACTICE_CONTRACT_ROW_IDS.RESEARCH);
    assert.equal(research?.status.key, 'CO_PRACTICE_CONTRACT_STATUS_ON');
    assert.equal(research?.action, 'privacy');
  });
});
