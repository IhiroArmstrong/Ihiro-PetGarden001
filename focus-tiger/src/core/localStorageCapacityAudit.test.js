/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  auditFocusTigerLocalStorageBytes,
  auditPresenceLegacyRatio,
  summarizeLocalStorageAudit
} from './localStorageCapacityAudit.js';
import { PRESENCE_SIGNALS_MAX_ENTRIES } from './presenceSignalsGate.js';
import { REFLECTION_MAX_SAVED } from './SessionEndFlow.js';

function mockStorage(seed = {}) {
  /** @type {Record<string, string>} */
  const data = { ...seed };
  return {
    getItem(k) {
      return data[k] ?? null;
    },
    setItem(k, v) {
      data[k] = v;
    }
  };
}

describe('localStorageCapacityAudit', () => {
  it('summarizes byte sizes per whitelisted key', () => {
    const storage = mockStorage({
      'focus-tiger.journey-log.v1': '{"entries":[]}'
    });
    const rows = auditFocusTigerLocalStorageBytes(storage);
    const summary = summarizeLocalStorageAudit(rows);
    assert.ok(summary.totalBytes > 0);
    assert.ok(summary.nonZeroKeys >= 1);
  });

  it('reports legacy ratio as 100% when no presenceSessionId shipped yet', () => {
    const storage = mockStorage({
      'focus-tiger.presence-signals.v1': JSON.stringify({
        entries: [{ id: 'a', at: '2026-08-01T00:00:00.000Z', source: 'arrival_notice', emotionTag: 'calm' }]
      }),
      'focus-tiger.reflections.v1': JSON.stringify([{ createdAt: 1, notice: 'x' }])
    });
    const ratio = auditPresenceLegacyRatio(storage);
    assert.equal(ratio.presenceLegacyPercent, 100);
    assert.equal(ratio.reflectionLegacyPercent, 100);
    assert.equal(ratio.presenceTotal, 1);
  });

  it('documents worst-case row caps for Slice 6 gate', () => {
    assert.equal(PRESENCE_SIGNALS_MAX_ENTRIES, 240);
    assert.equal(REFLECTION_MAX_SAVED, 5);
  });
});
