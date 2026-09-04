/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  LANTERN_PRESENCE_PATH,
  getLanternSittingSnapshot,
  isLanternPresenceClientEnabled,
  peekLanternPresence,
  postLanternPresence,
  resetLanternPresenceForTests,
  setLanternPresenceBusyProbe,
  startLanternHeartbeat,
  stopLanternHeartbeat,
  stopLanternIdleObserverPeek,
  startLanternIdleObserverPeek,
  LANTERN_IDLE_OBSERVER_PEEK_MS
} from './quietTogetherPresence.js';
import { setQuietTogetherEnabled } from './quietTogetherPreference.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    }
  };
}

describe('quietTogetherPresence', () => {
  it('uses a single POST path', () => {
    assert.equal(LANTERN_PRESENCE_PATH, '/api/lantern-presence');
  });

  it('disables on opt-out, missing cloud, or query flag', () => {
    const storage = memoryStorage();
    setQuietTogetherEnabled(storage, false, { dispatch: () => {} });
    assert.equal(
      isLanternPresenceClientEnabled({
        storage,
        cloudBaseUrl: 'https://example.test',
        search: ''
      }),
      false
    );
    const on = memoryStorage();
    assert.equal(
      isLanternPresenceClientEnabled({
        storage: on,
        cloudBaseUrl: '',
        search: ''
      }),
      false
    );
    assert.equal(
      isLanternPresenceClientEnabled({
        storage: on,
        cloudBaseUrl: 'https://example.test',
        search: '?quietTogether=0'
      }),
      false
    );
    assert.equal(
      isLanternPresenceClientEnabled({
        storage: on,
        cloudBaseUrl: 'https://example.test',
        search: ''
      }),
      true
    );
  });

  it('peek skips when busy and does not rewrite an unchanged count', async () => {
    resetLanternPresenceForTests();
    const storage = memoryStorage();
    setLanternPresenceBusyProbe(() => ({ busy: true, retry: false }));
    const calls = [];
    const r1 = await peekLanternPresence({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => {
        calls.push('peek');
        return { schemaVersion: 1, sitting: 3 };
      }
    });
    assert.equal(r1.reason, 'busy');
    assert.equal(calls.length, 0);

    setLanternPresenceBusyProbe(() => false);
    const r2 = await peekLanternPresence({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => ({ schemaVersion: 1, sitting: 3 })
    });
    assert.equal(r2.ok, true);
    assert.equal(r2.changed, true);
    const r3 = await peekLanternPresence({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => ({ schemaVersion: 1, sitting: 3 })
    });
    assert.equal(r3.changed, false);
    assert.equal(getLanternSittingSnapshot(), 3);
    resetLanternPresenceForTests();
  });

  it('leave is a no-op without a session', async () => {
    resetLanternPresenceForTests();
    const r = await stopLanternHeartbeat();
    assert.equal(r.reason, 'no_session');
  });

  it('leave refreshes sitting snapshot from server', async () => {
    resetLanternPresenceForTests();
    const storage = memoryStorage();
    setQuietTogetherEnabled(storage, true, { dispatch: () => {} });
    const opts = {
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      joinDelayMs: 0,
      heartbeatMs: 600_000,
      postJson: async (_path, init) => {
        const body = JSON.parse(init.body);
        if (body.action === 'heartbeat') {
          return { schemaVersion: 1, sitting: 1 };
        }
        if (body.action === 'leave') {
          return { schemaVersion: 1, sitting: 0 };
        }
        return { schemaVersion: 1, sitting: 0 };
      }
    };
    startLanternHeartbeat(opts);
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(getLanternSittingSnapshot(), 1);
    const leave = await stopLanternHeartbeat(opts);
    assert.equal(leave.ok, true);
    assert.equal(leave.sitting, 0);
    assert.equal(getLanternSittingSnapshot(), 0);
    resetLanternPresenceForTests();
  });

  it('idle observer polls after the first delayed peek', async () => {
    resetLanternPresenceForTests();
    const storage = memoryStorage();
    setQuietTogetherEnabled(storage, true, { dispatch: () => {} });
    const timeouts = [];
    const originalSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = (fn, ms) => {
      timeouts.push(ms);
      if (timeouts.length === 1) {
        queueMicrotask(() => {
          fn();
        });
      }
      return timeouts.length;
    };
    const originalClearTimeout = globalThis.clearTimeout;
    globalThis.clearTimeout = () => {};
    try {
      startLanternIdleObserverPeek({
        storage,
        search: '',
        getBaseUrl: () => 'https://example.test',
        delayMs: 10,
        intervalMs: LANTERN_IDLE_OBSERVER_PEEK_MS,
        postJson: async () => ({ schemaVersion: 1, sitting: 0 })
      });
      assert.deepEqual(timeouts, [10]);
      await new Promise((resolve) => queueMicrotask(resolve));
      await new Promise((resolve) => queueMicrotask(resolve));
      assert.ok(timeouts.includes(LANTERN_IDLE_OBSERVER_PEEK_MS));
    } finally {
      globalThis.setTimeout = originalSetTimeout;
      globalThis.clearTimeout = originalClearTimeout;
      resetLanternPresenceForTests();
    }
  });

  it('heartbeat payload includes schema and action', async () => {
    resetLanternPresenceForTests();
    let init = null;
    await postLanternPresence({
      getBaseUrl: () => 'https://example.test',
      postJson: async (_path, nextInit) => {
        init = nextInit;
        return { schemaVersion: 1, sitting: 1 };
      },
      action: 'heartbeat',
      sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    });
    const body = JSON.parse(init.body);
    assert.equal(body.schemaVersion, 1);
    assert.equal(body.action, 'heartbeat');
    resetLanternPresenceForTests();
  });
});
