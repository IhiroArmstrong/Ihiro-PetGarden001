/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appendReflectionPresenceSignals } from './reflectionPresenceBridge.js';
import { appendArrivalNoticeSignal, readPresenceSignals } from './presenceSignalsGate.js';
import {
  DELETE_PRESENCE_SIGNAL_REJECT_LINKED_BUNDLE,
  deleteLegacyReflectionSession,
  deletePresenceSession,
  deletePresenceSignalById,
  readReflectionBundles
} from './presenceSignalsDelete.js';

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

describe('presenceSignalsDelete', () => {
  it('deletePresenceSession removes bundle and linked signals', () => {
    const storage = mockStorage();
    const { presenceSessionId } = appendReflectionPresenceSignals(
      storage,
      { notice: 'wind' },
      { now: () => new Date('2026-08-30T12:00:00.000Z') }
    );
    storage.setItem(
      'focus-tiger.reflections.v1',
      JSON.stringify([
        {
          createdAt: Date.parse('2026-08-30T12:00:00.000Z'),
          presenceSessionId,
          notice: 'wind'
        }
      ])
    );
    const result = deletePresenceSession(storage, presenceSessionId);
    assert.equal(result.ok, true);
    assert.equal(result.removedBundles, 1);
    assert.equal(result.removedSignals, 1);
    assert.equal(readReflectionBundles(storage).length, 0);
    assert.equal(readPresenceSignals(storage).entries.length, 0);
  });

  it('deletePresenceSignalById rejects when signal belongs to reflection bundle', () => {
    const storage = mockStorage();
    const { presenceSessionId } = appendReflectionPresenceSignals(
      storage,
      { emotion: 'heavy' },
      { now: () => new Date('2026-08-30T12:00:00.000Z') }
    );
    storage.setItem(
      'focus-tiger.reflections.v1',
      JSON.stringify([
        {
          createdAt: Date.parse('2026-08-30T12:00:00.000Z'),
          presenceSessionId,
          emotion: 'heavy'
        }
      ])
    );
    const signalId = readPresenceSignals(storage).entries[0].id;
    const rejected = deletePresenceSignalById(storage, signalId);
    assert.equal(rejected.ok, false);
    assert.equal(rejected.reason, DELETE_PRESENCE_SIGNAL_REJECT_LINKED_BUNDLE);
    assert.equal(readPresenceSignals(storage).entries.length, 1);
  });

  it('deletePresenceSignalById removes standalone arrival notice', () => {
    const storage = mockStorage();
    const row = appendArrivalNoticeSignal(storage, 'calm', {
      now: () => new Date('2026-08-30T12:00:00.000Z'),
      idFn: () => 'arr-1'
    });
    const result = deletePresenceSignalById(storage, row.id);
    assert.equal(result.ok, true);
    assert.equal(readPresenceSignals(storage).entries.length, 0);
  });

  it('deleteLegacyReflectionSession uses strategy A window', () => {
    const storage = mockStorage();
    const createdAt = Date.parse('2026-08-30T12:00:00.000Z');
    const at = new Date(createdAt).toISOString();
    storage.setItem(
      'focus-tiger.presence-signals.v1',
      JSON.stringify({
        entries: [
          {
            id: 'legacy-q1',
            at,
            source: 'reflection_q1',
            freeText: 'legacy wind'
          },
          {
            id: 'legacy-q2',
            at,
            source: 'reflection_q2',
            freeText: 'tired'
          }
        ]
      })
    );
    storage.setItem(
      'focus-tiger.reflections.v1',
      JSON.stringify([{ createdAt, notice: 'legacy wind', emotion: 'tired' }])
    );
    const result = deleteLegacyReflectionSession(storage, createdAt);
    assert.equal(result.ok, true);
    assert.equal(result.removedBundles, 1);
    assert.equal(result.removedSignals, 2);
  });
});
