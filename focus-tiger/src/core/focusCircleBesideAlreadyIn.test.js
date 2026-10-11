/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { joinBesideSeat } from './focusCircleBeside.js';
import { writeFocusCircleMembership } from './focusCircleMembership.js';

test('sit-beside refuses while this device is already in a circle', async () => {
  const storage = {
    /** @type {Record<string, string>} */
    data: {},
    getItem(key) {
      return this.data[key] ?? null;
    },
    setItem(key, value) {
      this.data[key] = String(value);
    },
    removeItem(key) {
      delete this.data[key];
    }
  };
  writeFocusCircleMembership(storage, {
    circleId: '11111111-1111-4111-8111-111111111111',
    memberId: '22222222-2222-4222-8222-222222222222',
    code: 'ABCD23',
    memberCount: 1
  });
  let posted = false;
  const result = await joinBesideSeat({
    storage,
    code: 'B9X43422',
    search: '',
    getBaseUrl: () => 'https://example.test',
    postJson: async () => {
      posted = true;
      throw new Error('should not post');
    }
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'already_in_circle');
  assert.equal(posted, false);
});
