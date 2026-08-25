/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  REFLECTION_FREE_TEXT_RETENTION_DAYS,
  REFLECTION_STORAGE_KEY,
  SessionEndFlow,
  pruneExpiredReflectionBundles,
  trimReflections
} from './SessionEndFlow.js';
import { readPresenceSignals } from './presenceSignalsGate.js';

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

describe('SessionEndFlow reflection retention', () => {
  it('pruneExpiredReflectionBundles drops bundles older than retention days', () => {
    const ref = new Date(2026, 7, 25, 12, 0, 0);
    const oldMs = ref.getTime() - (REFLECTION_FREE_TEXT_RETENTION_DAYS + 1) * 86400000;
    const freshMs = ref.getTime() - 2 * 86400000;
    const pruned = pruneExpiredReflectionBundles(
      [
        { createdAt: oldMs, notice: 'old' },
        { createdAt: freshMs, emotion: 'still here' }
      ],
      ref
    );
    assert.equal(pruned.length, 1);
    assert.equal(pruned[0].emotion, 'still here');
  });

  it('trimReflections prunes before appending', () => {
    const ref = new Date(2026, 7, 25);
    const oldMs = ref.getTime() - (REFLECTION_FREE_TEXT_RETENTION_DAYS + 5) * 86400000;
    const saved = trimReflections(
      [{ createdAt: oldMs, notice: 'gone' }],
      { createdAt: ref.getTime(), notice: 'new' }
    );
    assert.equal(saved.length, 1);
    assert.equal(saved[0].notice, 'new');
  });
});

describe('SessionEndFlow presence dual-write', () => {
  it('onDone appends reflection freeText rows to presence-signals', () => {
    const storage = mockStorage();
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: storage
    });
    try {
      /** @type {import('../ui/TigerReflectionMoment.js').TigerReflectionMoment} */
      const reflectionMoment = {
        onDone: null,
        open: () => {}
      };
      const flow = new SessionEndFlow({
        reflectionMoment,
        now: () => new Date('2026-08-25T18:00:00.000Z').getTime()
      });
      reflectionMoment.onDone?.(
        { notice: 'wind', emotion: 'soft tired' },
        true
      );
      const presence = readPresenceSignals(storage).entries;
      assert.equal(presence.length, 2);
      assert.ok(
        presence.some((row) => row.source === 'reflection_q1' && row.freeText === 'wind')
      );
      assert.ok(
        presence.some(
          (row) => row.source === 'reflection_q2' && row.freeText === 'soft tired'
        )
      );
      const raw = storage.getItem(REFLECTION_STORAGE_KEY);
      assert.ok(raw);
      const bundles = JSON.parse(raw);
      assert.equal(bundles.length, 1);
      assert.equal(bundles[0].notice, 'wind');
    } finally {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: original
      });
    }
  });
});
