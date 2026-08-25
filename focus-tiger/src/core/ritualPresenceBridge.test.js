/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  appendRitualChipPresenceSignals,
  consumeRitualLeaveRetrospective,
  findPendingRitualLeaveRetrospective,
  listRitualChipSelections
} from './ritualPresenceBridge.js';
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

describe('ritualPresenceBridge', () => {
  it('listRitualChipSelections ignores prompt fields', () => {
    const chips = listRitualChipSelections('morning', {
      arrival: 'calm',
      intention: 'focus',
      prompt_0: 'skipped'
    });
    assert.deepEqual(chips, [
      { field: 'arrival', chipId: 'calm' },
      { field: 'intention', chipId: 'focus' }
    ]);
  });

  it('append on leave marks ritualCompleted false', () => {
    const storage = mockStorage();
    const sessionId = 'ritual-morning-1';
    const count = appendRitualChipPresenceSignals(
      storage,
      'morning',
      { arrival: 'heavy' },
      { ritualSessionId: sessionId, ritualCompleted: false }
    );
    assert.equal(count, 1);
    const rows = readPresenceSignals(storage).entries;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].source, 'ritual_chip');
    assert.equal(rows[0].emotionTag, 'heavy');
    assert.equal(rows[0].ritualCompleted, false);
    assert.equal(rows[0].retrospectiveMentioned, false);
    assert.equal(rows[0].ritualSessionId, sessionId);
  });

  it('append on complete marks ritualCompleted true', () => {
    const storage = mockStorage();
    appendRitualChipPresenceSignals(
      storage,
      'emotional-reset',
      { emotion: 'tired' },
      { ritualSessionId: 'ritual-reset-1', ritualCompleted: true }
    );
    const row = readPresenceSignals(storage).entries[0];
    assert.equal(row.ritualCompleted, true);
    assert.equal(row.retrospectiveMentioned, undefined);
  });

  it('consume retrospective once per incomplete session', () => {
    const storage = mockStorage();
    const sessionId = 'ritual-morning-leave';
    appendRitualChipPresenceSignals(
      storage,
      'morning',
      { arrival: 'calm', intention: 'kindness' },
      { ritualSessionId: sessionId, ritualCompleted: false }
    );

    const first = consumeRitualLeaveRetrospective(storage, 'morning');
    assert.ok(first);
    assert.equal(first?.emotionTag, 'kindness');
    assert.equal(first?.field, 'intention');

    const second = consumeRitualLeaveRetrospective(storage, 'morning');
    assert.equal(second, null);

    const rows = readPresenceSignals(storage).entries;
    assert.ok(rows.every((r) => r.retrospectiveMentioned === true));
  });

  it('does not cross ritual types for retrospective', () => {
    const storage = mockStorage();
    appendRitualChipPresenceSignals(
      storage,
      'emotional-reset',
      { emotion: 'anxious' },
      { ritualSessionId: 'ritual-reset-leave', ritualCompleted: false }
    );
    assert.equal(
      findPendingRitualLeaveRetrospective(
        readPresenceSignals(storage).entries,
        'morning'
      ),
      null
    );
    assert.ok(
      findPendingRitualLeaveRetrospective(
        readPresenceSignals(storage).entries,
        'emotional-reset'
      )
    );
  });

  it('completed ritual rows do not trigger retrospective', () => {
    const storage = mockStorage();
    appendRitualChipPresenceSignals(
      storage,
      'morning',
      { arrival: 'busy' },
      { ritualSessionId: 'ritual-morning-done', ritualCompleted: true }
    );
    assert.equal(consumeRitualLeaveRetrospective(storage, 'morning'), null);
  });
});
