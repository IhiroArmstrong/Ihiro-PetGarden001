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
  getFocusCircleSittingOthersSnapshot,
  isFocusCirclePresenceClientEnabled,
  peekFocusCirclePresence,
  postFocusCirclePresence,
  resetFocusCirclePresenceForTests,
  setFocusCirclePresenceBusyProbe,
  startFocusCircleHeartbeat,
  stopFocusCircleHeartbeat,
  stopFocusCircleIdleObserverPeek,
  startFocusCircleIdleObserverPeek,
  FOCUS_CIRCLE_IDLE_OBSERVER_PEEK_MS
} from './focusCirclePresence.js';

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

describe('focusCirclePresence', () => {
  it('disables without membership, cloud, or query flag', () => {
    const storage = memoryStorage();
    assert.equal(
      isFocusCirclePresenceClientEnabled({
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
      isFocusCirclePresenceClientEnabled({
        storage: withMembership,
        cloudBaseUrl: 'https://example.test',
        search: '?focusCircle=0'
      }),
      false
    );
    assert.equal(
      isFocusCirclePresenceClientEnabled({
        storage: withMembership,
        cloudBaseUrl: 'https://example.test',
        search: ''
      }),
      true
    );
  });

  it('peek skips when busy and does not rewrite unchanged count', async () => {
    resetFocusCirclePresenceForTests();
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP)
    });
    setFocusCirclePresenceBusyProbe(() => ({ busy: true, retry: false }));
    const calls = [];
    const r1 = await peekFocusCirclePresence({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => {
        calls.push('peek');
        return { schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION, sittingOthers: 1 };
      }
    });
    assert.equal(r1.reason, 'busy');
    assert.equal(calls.length, 0);

    setFocusCirclePresenceBusyProbe(() => false);
    const r2 = await peekFocusCirclePresence({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => ({
        schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
        sittingOthers: 1
      })
    });
    assert.equal(r2.ok, true);
    assert.equal(r2.changed, true);
    const r3 = await peekFocusCirclePresence({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => ({
        schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
        sittingOthers: 1
      })
    });
    assert.equal(r3.changed, false);
    assert.equal(getFocusCircleSittingOthersSnapshot(), 1);
  });

  it('posts presence actions with membership ids', async () => {
    resetFocusCirclePresenceForTests();
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP)
    });
    const payloads = [];
    const result = await postFocusCirclePresence({
      storage,
      action: 'presence_heartbeat',
      getBaseUrl: () => 'https://example.test',
      postJson: async (_path, init) => {
        payloads.push(JSON.parse(init.body));
        return { schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION, sittingOthers: 0 };
      }
    });
    assert.equal(result.ok, true);
    assert.equal(payloads[0].action, 'presence_heartbeat');
    assert.equal(payloads[0].circleId, MEMBERSHIP.circleId);
    assert.equal(payloads[0].memberId, MEMBERSHIP.memberId);
  });

  it('heartbeat and leave lifecycle', async () => {
    resetFocusCirclePresenceForTests();
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP)
    });
    const actions = [];
    const postJson = async (_path, init) => {
      const body = JSON.parse(init.body);
      actions.push(body.action);
      return {
        schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
        sittingOthers: body.action === 'presence_heartbeat' ? 0 : 1
      };
    };
    const opts = {
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson,
      joinDelayMs: 0,
      heartbeatMs: 50_000
    };
    startFocusCircleHeartbeat(opts);
    await new Promise((r) => setTimeout(r, 5));
    assert.ok(actions.includes('presence_heartbeat'));
    await stopFocusCircleHeartbeat(opts);
    assert.ok(actions.includes('presence_leave'));
  });

  it('idle observer polls while active', async () => {
    resetFocusCirclePresenceForTests();
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP)
    });
    let peeks = 0;
    startFocusCircleIdleObserverPeek({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      delayMs: 0,
      intervalMs: 5,
      postJson: async () => {
        peeks += 1;
        return { schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION, sittingOthers: 1 };
      }
    });
    await new Promise((r) => setTimeout(r, FOCUS_CIRCLE_IDLE_OBSERVER_PEEK_MS + 20));
    stopFocusCircleIdleObserverPeek();
    assert.ok(peeks >= 1);
  });
});
