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
  stopLanternHeartbeat
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
