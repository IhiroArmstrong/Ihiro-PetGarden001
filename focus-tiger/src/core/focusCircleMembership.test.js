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
  normalizeFocusCircleCode,
  postFocusCircle,
  readCircleJoinQueryCode,
  readFocusCircleMembership,
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
});
