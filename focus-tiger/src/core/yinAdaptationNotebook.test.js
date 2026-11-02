/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  EVENING_PRACTICE_FACTS_CONSENT_KEY,
  EVENING_PRACTICE_FACTS_KEY
} from './eveningPracticeFacts.js';
import { savePreferredFocusDurationMinutes } from './focusDuration.js';
import {
  PREF_NOTEBOOK_LINE_IDS,
  buildYinAdaptationNotebookLines
} from './yinAdaptationNotebook.js';
import { PREF_STATE_READ_STORAGE_KEY } from './prefStateResolver.js';

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

describe('T73 second-knife notebook lines', () => {
  it('no habitual: no seen line and no confirm', () => {
    withMockLocalStorage((storage) => {
      savePreferredFocusDurationMinutes(15, storage);
      const ids = buildYinAdaptationNotebookLines({ storage }).map((row) => row.id);
      assert.equal(ids.includes(PREF_NOTEBOOK_LINE_IDS.HABITUAL_SEEN), false);
      assert.equal(ids.includes(PREF_NOTEBOOK_LINE_IDS.HABITUAL_CONFIRM), false);
    });
  });

  it('habitual without consent: seen + confirm', () => {
    withMockLocalStorage((storage) => {
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
      const lines = buildYinAdaptationNotebookLines({ storage });
      const seen = lines.find((row) => row.id === PREF_NOTEBOOK_LINE_IDS.HABITUAL_SEEN);
      const confirm = lines.find((row) => row.id === PREF_NOTEBOOK_LINE_IDS.HABITUAL_CONFIRM);
      assert.equal(seen?.textParams?.n, '25');
      assert.equal(confirm?.kind, 'confirm');
    });
  });

  it('reuses T62 evening slot when consent is on and a late evening exists', () => {
    withMockLocalStorage((storage) => {
      storage.setItem(
        EVENING_PRACTICE_FACTS_CONSENT_KEY,
        JSON.stringify({ enabled: true, consentedAt: '2026-11-02' })
      );
      storage.setItem(
        EVENING_PRACTICE_FACTS_KEY,
        JSON.stringify({
          entries: [{ date: '2026-11-02', endHour: 2, endMinute: 0 }]
        })
      );
      const lines = buildYinAdaptationNotebookLines({
        storage,
        todayKey: '2026-11-02'
      });
      const evening = lines.find((row) => row.id === PREF_NOTEBOOK_LINE_IDS.EVENING_SLOT);
      assert.ok(evening);
      assert.equal(evening.textKey, 'PRACTICE_PAPER_EVENING_FACT');
      assert.equal(evening.textParams.n, '1');
    });
  });

  it('T62 off: no evening slot line', () => {
    withMockLocalStorage((storage) => {
      const ids = buildYinAdaptationNotebookLines({
        storage,
        todayKey: '2026-11-02'
      }).map((row) => row.id);
      assert.equal(ids.includes(PREF_NOTEBOOK_LINE_IDS.EVENING_SLOT), false);
    });
  });
});
