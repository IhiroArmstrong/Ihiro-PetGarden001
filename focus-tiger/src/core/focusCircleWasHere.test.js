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
  FOCUS_CIRCLE_WAS_HERE_MARK_STORAGE_KEY,
  isWasHereEligibleSession,
  maybeWasHereMark,
  postFocusCircleWasHereMark
} from './focusCircleWasHere.js';
import { FOCUS_CIRCLE_PASSIVE_SHARE_STORAGE_KEY } from './focusCirclePassiveShare.js';

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

describe('focusCircleWasHere', () => {
  it('eligibility matches witness 60s gate', () => {
    assert.equal(isWasHereEligibleSession(59.9), false);
    assert.equal(isWasHereEligibleSession(60), true);
  });

  it('maybeWasHereMark skips when passive share off', () => {
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP),
      [FOCUS_CIRCLE_PASSIVE_SHARE_STORAGE_KEY]: JSON.stringify({
        sharePassiveMarks: false
      })
    });
    const result = maybeWasHereMark({
      elapsedSeconds: 90,
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test'
    });
    assert.equal(result.reason, 'passive_share_off');
  });

  it('postFocusCircleWasHereMark sends was_here_mark action', async () => {
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP)
    });
    let action = '';
    const result = await postFocusCircleWasHereMark({
      storage,
      markerDayKey: '2026-09-07',
      postJson: async (_path, opts) => {
        const body = JSON.parse(opts.body);
        action = body.action;
        return { ok: true, schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION };
      },
      getBaseUrl: () => 'https://example.test'
    });
    assert.equal(action, 'was_here_mark');
    assert.equal(result.ok, true);
  });

  it('maybeWasHereMark dedupes same local day', async () => {
    const storage = memoryStorage({
      [FOCUS_CIRCLE_STORAGE_KEY]: JSON.stringify(MEMBERSHIP),
      [FOCUS_CIRCLE_WAS_HERE_MARK_STORAGE_KEY]: JSON.stringify({
        dayKey: '2026-09-07'
      })
    });
    const result = maybeWasHereMark({
      elapsedSeconds: 90,
      storage,
      search: '',
      getBaseUrl: () => 'https://example.test',
      nowMs: Date.parse('2026-09-07T12:00:00.000Z'),
      timeZone: 'UTC'
    });
    assert.equal(result.reason, 'already_marked_today');
  });
});
