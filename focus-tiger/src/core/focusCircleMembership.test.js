/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FOCUS_CIRCLE_PATH,
  clearFocusCircleMembership,
  isFocusCircleClientEnabled,
  joinFocusCircle,
  leaveFocusCircle,
  normalizeFocusCircleCode,
  postFocusCircle,
  readCircleJoinQueryCode,
  readFocusCircleMembership,
  refreshFocusCircleStatus,
  startFocusCircleStatusPolling,
  stopFocusCircleStatusPolling,
  writeFocusCircleMembership
} from './focusCircleMembership.js';

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

describe('focusCircleMembership', () => {
  it('uses a single POST path', () => {
    assert.equal(FOCUS_CIRCLE_PATH, '/api/focus-circle');
  });

  it('normalizes invite codes and deep-link query', () => {
    assert.equal(normalizeFocusCircleCode(' ab12cd '), null);
    assert.equal(readCircleJoinQueryCode('?circleJoin=abcd23'), 'ABCD23');
    assert.equal(readCircleJoinQueryCode('?circleJoin=bad'), null);
  });

  it('disables when cloud is missing or query flag is off', () => {
    assert.equal(
      isFocusCircleClientEnabled({
        search: '?focusCircle=0',
        cloudBaseUrl: 'https://example.test'
      }),
      false
    );
    assert.equal(
      isFocusCircleClientEnabled({ search: '', cloudBaseUrl: '' }),
      false
    );
    assert.equal(
      isFocusCircleClientEnabled({
        search: '',
        cloudBaseUrl: 'https://example.test'
      }),
      true
    );
  });

  it('skips rewriting local storage when membership is unchanged', () => {
    const storage = memoryStorage();
    const membership = {
      circleId: '11111111-1111-4111-8111-111111111111',
      memberId: '22222222-2222-4222-8222-222222222222',
      code: 'ABCD23',
      memberCount: 2
    };
    writeFocusCircleMembership(storage, membership);
    const raw1 = storage.getItem('focus-tiger.focus-circle.v1');
    writeFocusCircleMembership(storage, { ...membership });
    const raw2 = storage.getItem('focus-tiger.focus-circle.v1');
    assert.equal(raw1, raw2);
    assert.deepEqual(readFocusCircleMembership(storage), membership);
    clearFocusCircleMembership(storage);
    assert.equal(readFocusCircleMembership(storage), null);
  });

  it('maps join full to circle_full', async () => {
    const storage = memoryStorage();
    const result = await joinFocusCircle({
      storage,
      search: '',
      code: 'ABCD23',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => {
        const err = new Error('full');
        /** @type {any} */ (err).status = 409;
        throw err;
      }
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'circle_full');
  });

  it('create posts memberId', async () => {
    const storage = memoryStorage();
    let payload = null;
    const result = await postFocusCircle({
      action: 'create',
      memberId: '22222222-2222-4222-8222-222222222222',
      getBaseUrl: () => 'https://example.test',
      postJson: async (_path, opts) => {
        payload = JSON.parse(String(opts.body));
        return {
          ok: true,
          schemaVersion: 1,
          circleId: '11111111-1111-4111-8111-111111111111',
          memberId: '22222222-2222-4222-8222-222222222222',
          code: 'ABCD23',
          memberCount: 1
        };
      }
    });
    assert.equal(result.ok, true);
    assert.equal(payload.action, 'create');
    assert.equal(payload.memberId, '22222222-2222-4222-8222-222222222222');
  });

  it('refreshFocusCircleStatus updates stored memberCount from cloud', async () => {
    const storage = memoryStorage();
    writeFocusCircleMembership(storage, {
      circleId: '11111111-1111-4111-8111-111111111111',
      memberId: '22222222-2222-4222-8222-222222222222',
      code: 'ABCD23',
      memberCount: 1
    });
    const result = await refreshFocusCircleStatus({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => ({
        ok: true,
        schemaVersion: 1,
        circleId: '11111111-1111-4111-8111-111111111111',
        memberId: '22222222-2222-4222-8222-222222222222',
        code: 'ABCD23',
        memberCount: 2,
        isMember: true
      })
    });
    assert.equal(result.ok, true);
    assert.equal(readFocusCircleMembership(storage)?.memberCount, 2);
  });

  it('status polling stops when membership clears', async () => {
    const storage = memoryStorage();
    writeFocusCircleMembership(storage, {
      circleId: '11111111-1111-4111-8111-111111111111',
      memberId: '22222222-2222-4222-8222-222222222222',
      code: 'ABCD23',
      memberCount: 1
    });
    let polls = 0;
    startFocusCircleStatusPolling({
      storage,
      search: '',
      intervalMs: 20,
      getBaseUrl: () => 'https://example.test',
      postJson: async () => {
        polls += 1;
        clearFocusCircleMembership(storage);
        return {
          ok: true,
          schemaVersion: 1,
          circleId: '11111111-1111-4111-8111-111111111111',
          memberId: '22222222-2222-4222-8222-222222222222',
          code: 'ABCD23',
          memberCount: 0,
          isMember: false
        };
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 60));
    stopFocusCircleStatusPolling();
    assert.ok(polls >= 1);
    assert.equal(readFocusCircleMembership(storage), null);
  });

  it('late status after leave does not restore membership', async () => {
    const storage = memoryStorage();
    writeFocusCircleMembership(storage, {
      circleId: '11111111-1111-4111-8111-111111111111',
      memberId: '22222222-2222-4222-8222-222222222222',
      code: 'ABCD23',
      memberCount: 1
    });
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const pending = refreshFocusCircleStatus({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => {
        await gate;
        return {
          ok: true,
          schemaVersion: 1,
          circleId: '11111111-1111-4111-8111-111111111111',
          memberId: '22222222-2222-4222-8222-222222222222',
          code: 'ABCD23',
          memberCount: 2,
          isMember: true
        };
      }
    });
    const left = await leaveFocusCircle({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => ({ ok: true })
    });
    assert.equal(left.ok, true);
    assert.equal(readFocusCircleMembership(storage), null);
    release();
    await pending;
    assert.equal(readFocusCircleMembership(storage), null);
  });

  it('older status response cannot overwrite a newer memberCount', async () => {
    const storage = memoryStorage();
    writeFocusCircleMembership(storage, {
      circleId: '11111111-1111-4111-8111-111111111111',
      memberId: '22222222-2222-4222-8222-222222222222',
      code: 'ABCD23',
      memberCount: 1
    });
    let resolveSlow;
    const slow = new Promise((resolve) => {
      resolveSlow = resolve;
    });
    let n = 0;
    const postJson = async () => {
      n += 1;
      if (n === 1) {
        await slow;
        return {
          ok: true,
          schemaVersion: 1,
          circleId: '11111111-1111-4111-8111-111111111111',
          memberId: '22222222-2222-4222-8222-222222222222',
          code: 'ABCD23',
          memberCount: 1,
          isMember: true
        };
      }
      return {
        ok: true,
        schemaVersion: 1,
        circleId: '11111111-1111-4111-8111-111111111111',
        memberId: '22222222-2222-4222-8222-222222222222',
        code: 'ABCD23',
        memberCount: 2,
        isMember: true
      };
    };
    const first = refreshFocusCircleStatus({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson
    });
    const second = refreshFocusCircleStatus({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson
    });
    await second;
    assert.equal(readFocusCircleMembership(storage)?.memberCount, 2);
    resolveSlow();
    await first;
    assert.equal(readFocusCircleMembership(storage)?.memberCount, 2);
  });

  it('rate-limited status keeps the last known memberCount', async () => {
    const storage = memoryStorage();
    writeFocusCircleMembership(storage, {
      circleId: '11111111-1111-4111-8111-111111111111',
      memberId: '22222222-2222-4222-8222-222222222222',
      code: 'ABCD23',
      memberCount: 2
    });
    const result = await refreshFocusCircleStatus({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => {
        const err = new Error('Too Many Requests');
        /** @type {any} */ (err).status = 429;
        throw err;
      }
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'rate_limited');
    assert.equal(readFocusCircleMembership(storage)?.memberCount, 2);
  });

  it('hanging create maps to timeout so callers can fail out', async () => {
    const result = await postFocusCircle({
      action: 'create',
      memberId: '22222222-2222-4222-8222-222222222222',
      timeoutMs: 30,
      getBaseUrl: () => 'https://example.test',
      postJson: () => new Promise(() => {})
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'timeout');
  });
  it('join maps local storage write failure to storage_failed', async () => {
    const storage = memoryStorage();
    const throwing = {
      getItem: storage.getItem,
      removeItem: storage.removeItem,
      setItem: () => {
        throw new Error('quota');
      }
    };
    const result = await joinFocusCircle({
      storage: throwing,
      search: '',
      code: 'ABCD23',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => ({
        ok: true,
        schemaVersion: 1,
        circleId: '11111111-1111-4111-8111-111111111111',
        memberId: '22222222-2222-4222-8222-222222222222',
        code: 'ABCD23',
        memberCount: 2
      })
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'storage_failed');
    assert.equal(readFocusCircleMembership(throwing), null);
  });

  it('keeps local membership when leave times out', async () => {
    const membership = {
      circleId: '11111111-1111-4111-8111-111111111111',
      memberId: '22222222-2222-4222-8222-222222222222',
      code: 'ABCD23',
      memberCount: 1
    };
    const storage = memoryStorage();
    writeFocusCircleMembership(storage, membership);
    const result = await leaveFocusCircle({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => {
        const err = new Error('timeout');
        /** @type {any} */ (err).status = 408;
        throw err;
      }
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'timeout');
    const kept = readFocusCircleMembership(storage);
    assert.equal(kept?.circleId, membership.circleId);
    assert.equal(kept?.memberId, membership.memberId);
  });

  it('clears local membership when cloud leave reports not_found', async () => {
    const membership = {
      circleId: '11111111-1111-4111-8111-111111111111',
      memberId: '22222222-2222-4222-8222-222222222222',
      code: 'ABCD23',
      memberCount: 1
    };
    const storage = memoryStorage();
    writeFocusCircleMembership(storage, membership);
    const result = await leaveFocusCircle({
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      postJson: async () => {
        const err = new Error('gone');
        /** @type {any} */ (err).status = 404;
        throw err;
      }
    });
    assert.equal(result.ok, true);
    assert.equal(result.reason, 'not_found');
    assert.equal(readFocusCircleMembership(storage), null);
  });

});
