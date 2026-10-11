/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { postFocusCircle } from './focusCircleMembership.js';

const CIRCLE = '11111111-1111-4111-8111-111111111111';
const MEMBER = '22222222-2222-4222-8222-222222222222';

test('displayed circle count prefers who is online over the stored roster', async () => {
  const result = await postFocusCircle({
    action: 'status',
    circleId: CIRCLE,
    memberId: MEMBER,
    getBaseUrl: () => 'https://example.test',
    postJson: async () => ({
      ok: true,
      schemaVersion: 1,
      circleId: CIRCLE,
      memberId: MEMBER,
      code: 'ABCD23',
      memberCount: 5,
      onlineCount: 1,
      isMember: true
    })
  });
  assert.equal(result.ok, true);
  assert.equal(result.membership.memberCount, 1);
});

test('online leave does not clear the local circle membership', async () => {
  const result = await postFocusCircle({
    action: 'online_leave',
    circleId: CIRCLE,
    memberId: MEMBER,
    getBaseUrl: () => 'https://example.test',
    postJson: async () => ({
      ok: true,
      schemaVersion: 1,
      onlineCount: 0
    })
  });
  assert.equal(result.ok, true);
  assert.equal(result.left, undefined);
});
