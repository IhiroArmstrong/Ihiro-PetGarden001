/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FOCUS_CIRCLE_STORAGE_KEY
} from './focusCircleMembership.js';
import {
  FOCUS_CIRCLE_IDENTITY_DRAFT_STORAGE_KEY,
  FOCUS_CIRCLE_IDENTITY_HIDDEN_STORAGE_KEY,
  hideFocusCircleMemberLocally,
  isFocusCircleIdentityClientEnabled,
  normalizeFocusCircleNickname,
  readFocusCircleIdentityDraft,
  readHiddenMemberIds,
  rememberFocusCircleIdentityPeekMap,
  resetFocusCircleIdentityForTests,
  resolveFocusCircleDisplayName,
  writeFocusCircleIdentityDraft
} from './focusCircleIdentity.js';

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

const AUTHOR = '33333333-3333-4333-8333-333333333333';

describe('focusCircleIdentity', () => {
  it('disables with query flag', () => {
    resetFocusCircleIdentityForTests();
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP)
    });
    assert.equal(
      isFocusCircleIdentityClientEnabled({
        storage,
        cloudBaseUrl: 'https://example.test',
        search: '?focusCircleIdentity=0'
      }),
      false
    );
  });

  it('normalizes nickname length', () => {
    assert.equal(normalizeFocusCircleNickname(' Kai '), 'Kai');
    assert.equal(normalizeFocusCircleNickname(''), null);
    assert.equal(normalizeFocusCircleNickname('x'.repeat(17)), null);
  });

  it('resolves display name with badge prefix and local hide', () => {
    resetFocusCircleIdentityForTests();
    rememberFocusCircleIdentityPeekMap({
      [AUTHOR]: { nickname: 'Kai', badgeKey: 'tiger' }
    });
    const anon = 'A companion';
    assert.equal(
      resolveFocusCircleDisplayName({
        anonLabel: anon,
        memberId: AUTHOR,
        t: (key) => (key === 'FOCUS_CIRCLE_IDENTITY_BADGE_TIGER_PREFIX' ? '🐯 ' : key)
      }),
      '🐯 Kai'
    );
    const storage = memoryStorage();
    hideFocusCircleMemberLocally(storage, MEMBERSHIP.circleId, AUTHOR);
    assert.equal(
      resolveFocusCircleDisplayName({
        anonLabel: anon,
        memberId: AUTHOR,
        hiddenMemberIds: readHiddenMemberIds(storage, MEMBERSHIP.circleId)
      }),
      anon
    );
  });

  it('persists draft locally', () => {
    const storage = memoryStorage();
    writeFocusCircleIdentityDraft(storage, {
      nickname: 'Kai',
      badgeKey: 'yin'
    });
    assert.deepEqual(readFocusCircleIdentityDraft(storage), {
      nickname: 'Kai',
      badgeKey: 'yin'
    });
    assert.ok(storage.getItem(FOCUS_CIRCLE_IDENTITY_DRAFT_STORAGE_KEY));
    writeFocusCircleIdentityDraft(storage, { nickname: '', badgeKey: null });
    assert.equal(storage.getItem(FOCUS_CIRCLE_IDENTITY_DRAFT_STORAGE_KEY), null);
  });

  it('stores hidden ids per circle', () => {
    const storage = memoryStorage();
    hideFocusCircleMemberLocally(storage, MEMBERSHIP.circleId, AUTHOR);
    const raw = JSON.parse(
      storage.getItem(FOCUS_CIRCLE_IDENTITY_HIDDEN_STORAGE_KEY) ?? '{}'
    );
    assert.deepEqual(raw[MEMBERSHIP.circleId], [AUTHOR]);
  });
});
