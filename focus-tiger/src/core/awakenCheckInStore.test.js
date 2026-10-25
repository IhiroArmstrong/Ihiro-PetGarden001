/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AWAKEN_CHECKIN_STORAGE_KEY,
  countMidCheckInsToday,
  recordAwakenCheckIn
} from './awakenCheckInStore.js';
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
    }
  };
}

describe('awakenCheckInStore', () => {
  it('records labels locally without upload fields', () => {
    const storage = mockStorage();
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: storage
    });
    try {
      recordAwakenCheckIn('ease', {
        sessionId: 'sit-1',
        phase: 'end',
        ts: Date.UTC(2026, 9, 25, 12, 0, 0)
      });
      const rows = getStorage(AWAKEN_CHECKIN_STORAGE_KEY, []);
      assert.equal(rows.length, 1);
      assert.equal(rows[0].label, 'ease');
      assert.equal(rows[0].sessionId, 'sit-1');
    } finally {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: original
      });
    }
  });

  it('counts only mid-phase rows for the local day', () => {
    const ref = new Date(2026, 9, 25, 18, 0, 0);
    const sameDay = ref.getTime();
    const rows = [
      { sessionId: 'a', ts: sameDay, label: 'ease', phase: 'mid' },
      { sessionId: 'b', ts: sameDay, label: 'tired', phase: 'end' },
      {
        sessionId: 'c',
        ts: sameDay - 86400000,
        label: 'restless',
        phase: 'mid'
      }
    ];
    assert.equal(countMidCheckInsToday(rows, ref), 1);
  });
});
