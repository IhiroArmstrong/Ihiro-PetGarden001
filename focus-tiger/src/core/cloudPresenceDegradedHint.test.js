/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CLOUD_PRESENCE_HINT_SESSION_KEY,
  isCloudPresenceFeatureRelevant,
  noteCloudPresenceNetworkFailure,
  noteCloudPresenceNetworkSuccess,
  resetCloudPresenceDegradedHintForTests,
  setCloudPresenceDegradedHintIdleProbe,
  setCloudPresenceDegradedHintNotifier
} from './cloudPresenceDegradedHint.js';
import { setQuietTogetherEnabled } from './quietTogetherPreference.js';
import { writeFocusCircleMembership } from './focusCircleMembership.js';

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

describe('cloudPresenceDegradedHint', () => {
  it('relevance requires cloud plus Quiet Together or circle membership', () => {
    const storage = memoryStorage();
    setQuietTogetherEnabled(storage, false, { dispatch: () => {} });
    assert.equal(
      isCloudPresenceFeatureRelevant({
        storage,
        search: '',
        getBaseUrl: () => 'https://example.test'
      }),
      false
    );
    setQuietTogetherEnabled(storage, true, { dispatch: () => {} });
    assert.equal(
      isCloudPresenceFeatureRelevant({
        storage,
        search: '?quietTogether=0',
        getBaseUrl: () => 'https://example.test'
      }),
      false
    );
    assert.equal(
      isCloudPresenceFeatureRelevant({
        storage,
        search: '',
        getBaseUrl: () => 'https://example.test'
      }),
      true
    );
    const circleOnly = memoryStorage();
    setQuietTogetherEnabled(circleOnly, false, { dispatch: () => {} });
    writeFocusCircleMembership(circleOnly, {
      circleId: 'c1',
      memberId: 'm1',
      code: 'ABCDEF'
    });
    assert.equal(
      isCloudPresenceFeatureRelevant({
        storage: circleOnly,
        search: '',
        getBaseUrl: () => 'https://example.test'
      }),
      true
    );
  });

  it('notifies once after consecutive network failures while Idle', () => {
    resetCloudPresenceDegradedHintForTests();
    const storage = memoryStorage();
    const session = memoryStorage();
    setQuietTogetherEnabled(storage, true, { dispatch: () => {} });
    let calls = 0;
    setCloudPresenceDegradedHintNotifier(() => {
      calls += 1;
    });
    setCloudPresenceDegradedHintIdleProbe(() => true);

    const base = {
      storage,
      sessionStorage: session,
      getBaseUrl: () => 'https://example.test'
    };

    assert.deepEqual(noteCloudPresenceNetworkFailure(base), {
      notified: false,
      reason: 'below_threshold'
    });
    assert.equal(calls, 0);

    assert.deepEqual(noteCloudPresenceNetworkFailure(base), {
      notified: true
    });
    assert.equal(calls, 1);
    assert.equal(session.getItem(CLOUD_PRESENCE_HINT_SESSION_KEY), '1');

    assert.deepEqual(noteCloudPresenceNetworkFailure(base), {
      notified: false,
      reason: 'already_shown'
    });
    assert.equal(calls, 1);
  });

  it('does not notify while not Idle', () => {
    resetCloudPresenceDegradedHintForTests();
    const storage = memoryStorage();
    const session = memoryStorage();
    setQuietTogetherEnabled(storage, true, { dispatch: () => {} });
    let calls = 0;
    setCloudPresenceDegradedHintNotifier(() => {
      calls += 1;
    });
    setCloudPresenceDegradedHintIdleProbe(() => false);

    const base = {
      storage,
      sessionStorage: session,
      getBaseUrl: () => 'https://example.test'
    };
    noteCloudPresenceNetworkFailure(base);
    noteCloudPresenceNetworkFailure(base);
    assert.equal(calls, 0);
    assert.equal(session.getItem(CLOUD_PRESENCE_HINT_SESSION_KEY), null);
  });

  it('resets consecutive failures after a successful presence response', () => {
    resetCloudPresenceDegradedHintForTests();
    const storage = memoryStorage();
    const session = memoryStorage();
    setQuietTogetherEnabled(storage, true, { dispatch: () => {} });
    let calls = 0;
    setCloudPresenceDegradedHintNotifier(() => {
      calls += 1;
    });
    setCloudPresenceDegradedHintIdleProbe(() => true);

    const base = {
      storage,
      sessionStorage: session,
      getBaseUrl: () => 'https://example.test'
    };

    noteCloudPresenceNetworkFailure(base);
    noteCloudPresenceNetworkSuccess();
    noteCloudPresenceNetworkFailure(base);
    assert.equal(calls, 0);
    noteCloudPresenceNetworkFailure(base);
    assert.equal(calls, 1);
  });
});
