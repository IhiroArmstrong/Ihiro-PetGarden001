/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appendIntentionPresenceSignal } from './intentionPresenceBridge.js';
import { readPresenceSignals } from './presenceSignalsGate.js';
import { recordIntention } from './SessionIntentionStore.js';
import { INTENTION_STORAGE_KEY } from './SessionIntentionStore.js';

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

describe('intentionPresenceBridge', () => {
  it('appendIntentionPresenceSignal writes arrival_choose freeText row', () => {
    const storage = mockStorage();
    const row = appendIntentionPresenceSignal(storage, '📖 Reading', {
      now: () => new Date('2026-08-28T12:00:00.000Z'),
      idFn: () => 'choose-1'
    });
    assert.ok(row);
    assert.equal(row?.source, 'arrival_choose');
    assert.equal(row?.freeText, '📖 Reading');
    assert.equal(row?.emotionTag, undefined);
    const entries = readPresenceSignals(storage).entries;
    assert.equal(entries.length, 1);
    assert.equal(entries[0].source, 'arrival_choose');
  });

  it('recordIntention dual-writes intentions.v1 and presence-signals', () => {
    const previous = globalThis.localStorage;
    globalThis.localStorage = mockStorage();
    const nowMs = new Date('2026-08-28T12:00:00.000Z').getTime();
    try {
      const entry = recordIntention('write quietly', {
        source: 'typed',
        now: () => nowMs
      });
      assert.ok(entry);
      const intentions = JSON.parse(
        globalThis.localStorage.getItem(INTENTION_STORAGE_KEY) || '[]'
      );
      assert.equal(intentions.length, 1);
      assert.equal(intentions[0].text, 'write quietly');
      const presence = readPresenceSignals(globalThis.localStorage).entries;
      assert.equal(presence.length, 1);
      assert.equal(presence[0].source, 'arrival_choose');
      assert.equal(presence[0].freeText, 'write quietly');
    } finally {
      globalThis.localStorage = previous;
    }
  });
});
