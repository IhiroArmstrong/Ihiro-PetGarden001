/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DailyCompletionStore } from './DailyCompletionStore.js';
import {
  canUseTrayTodaySat,
  pushTrayTodaySatSnapshot,
  readTrayTodaySatSnapshot,
  writeTrayTodaySatPreference
} from './trayTodaySatBridge.js';
import { TRAY_TODAY_SAT_ENABLED_KEY } from './trayTodaySatPreference.js';

describe('trayTodaySatBridge', () => {
  it('is unavailable without a desktop shell setter', () => {
    assert.equal(canUseTrayTodaySat({}), false);
    assert.equal(
      canUseTrayTodaySat({ desktopShell: { isDesktop: true } }),
      false
    );
  });

  it('pushes today minutes and the switch', async () => {
    const map = new Map();
    const storage = {
      getItem: (key) => (map.has(key) ? map.get(key) : null),
      setItem: (key, value) => {
        map.set(key, String(value));
      }
    };
    const store = new DailyCompletionStore({
      storage,
      now: () => new Date('2026-11-26T12:00:00')
    });
    store.recordCompletion(12);
    const pushed = [];
    const globalObj = {
      localStorage: storage,
      desktopShell: {
        isDesktop: true,
        setTrayTodaySat: async (payload) => {
          pushed.push(payload);
          return { ok: true };
        }
      }
    };
    const snap = readTrayTodaySatSnapshot(globalObj);
    assert.equal(snap.enabled, true);
    assert.equal(snap.minutes, 12);
    const result = await pushTrayTodaySatSnapshot(globalObj);
    assert.equal(result.ok, true);
    assert.equal(pushed[0].minutes, 12);
    const off = await writeTrayTodaySatPreference(false, globalObj);
    assert.equal(off.saved, true);
    assert.equal(storage.getItem(TRAY_TODAY_SAT_ENABLED_KEY), '0');
    assert.equal(pushed.at(-1).enabled, false);
  });
});
