/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FOCUS_CIRCLE_STORAGE_KEY,
  FOCUS_CIRCLE_SCHEMA_VERSION
} from './focusCircleMembership.js';
import {
  isFocusCircleWitnessClientEnabled,
  isWitnessEligibleSession,
  peekFocusCircleWitness,
  pickIdleWitnessTrace,
  postFocusCircleWitness,
  readRespondedTraceIds,
  rememberRespondedTraceId,
  resetFocusCircleWitnessForTests,
  setFocusCircleWitnessBusyProbe
} from './focusCircleWitness.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
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

const MEMBERSHIP = {
  circleId: '11111111-1111-4111-8111-111111111111',
  memberId: '22222222-2222-4222-8222-222222222222',
  code: 'ABC234',
  memberCount: 2
};

describe('focusCircleWitness', () => {
  it('disables without membership or query flag', () => {
    const storage = memoryStorage();
    assert.equal(
      isFocusCircleWitnessClientEnabled({
        storage,
        cloudBaseUrl: 'https://example.test',
        search: ''
      }),
      false
    );
    const withMembership = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP)
    });
    assert.equal(
      isFocusCircleWitnessClientEnabled({
        storage: withMembership,
        cloudBaseUrl: 'https://example.test',
        search: '?focusCircleWitness=0'
      }),
      false
    );
    assert.equal(
      isFocusCircleWitnessClientEnabled({
        storage: withMembership,
        cloudBaseUrl: 'https://example.test',
        search: ''
      }),
      true
    );
  });

  it('eligible session requires at least 60 seconds', () => {
    assert.equal(isWitnessEligibleSession(59.9), false);
    assert.equal(isWitnessEligibleSession(60), true);
    assert.equal(isWitnessEligibleSession(120), true);
  });

  it('pickIdleWitnessTrace returns first unresponded trace', () => {
    const traces = [
      {
        traceId: 'a',
        phraseKey: 'FOCUS_CIRCLE_WITNESS_LEAVE_1',
        hasResponded: true
      },
      {
        traceId: 'b',
        phraseKey: 'FOCUS_CIRCLE_WITNESS_LEAVE_2',
        hasResponded: false
      }
    ];
    const picked = pickIdleWitnessTrace(traces, new Set(['a']));
    assert.equal(picked?.traceId, 'b');
  });

  it('peek skips when busy and remembers responded ids', async () => {
    resetFocusCircleWitnessForTests();
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP)
    });
    rememberRespondedTraceId(storage, 'trace-1');
    assert.ok(readRespondedTraceIds(storage).has('trace-1'));

    setFocusCircleWitnessBusyProbe(() => ({ busy: true, retry: false }));
    const busy = await peekFocusCircleWitness({
      storage,
      getBaseUrl: () => 'https://example.test'
    });
    assert.equal(busy.reason, 'busy');

    setFocusCircleWitnessBusyProbe(() => false);
    const result = await peekFocusCircleWitness({
      storage,
      getBaseUrl: () => 'https://example.test',
      postJson: async () => ({
        ok: true,
        schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
        traces: [
          {
            traceId: 'trace-2',
            phraseKey: 'FOCUS_CIRCLE_WITNESS_LEAVE_1',
            hasResponded: false
          }
        ]
      })
    });
    assert.equal(result.ok, true);
    assert.equal(result.trace?.traceId, 'trace-2');
  });

  it('post witness_leave and witness_respond forward actions', async () => {
    const payloads = [];
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP)
    });
    const postJson = async (_path, init) => {
      payloads.push(JSON.parse(init.body));
      const action = payloads.at(-1).action;
      if (action === 'witness_leave') {
        return {
          ok: true,
          schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
          traceId: 'trace-new'
        };
      }
      return { ok: true, schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION };
    };

    const leave = await postFocusCircleWitness({
      storage,
      getBaseUrl: () => 'https://example.test',
      postJson,
      action: 'witness_leave',
      phraseKey: 'FOCUS_CIRCLE_WITNESS_LEAVE_1'
    });
    assert.equal(leave.ok, true);
    assert.equal(leave.traceId, 'trace-new');

    const respond = await postFocusCircleWitness({
      storage,
      getBaseUrl: () => 'https://example.test',
      postJson,
      action: 'witness_respond',
      traceId: 'trace-new',
      phraseKey: 'FOCUS_CIRCLE_WITNESS_RESPOND_1'
    });
    assert.equal(respond.ok, true);
    assert.deepEqual(payloads.map((p) => p.action), [
      'witness_leave',
      'witness_respond'
    ]);
  });
});
