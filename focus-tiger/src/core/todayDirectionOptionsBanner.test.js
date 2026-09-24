/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COLD_START_GOAL_OPTIONS_SEEN_KEY,
  COLD_START_GOAL_SEEN_KEY
} from './coldStartGoalGate.js';
import { evaluateTodayDirectionOptionsRefreshBanner } from './todayDirectionOptionsBanner.js';

function makeStorage(initial = {}) {
  /** @type {Record<string, string>} */
  const map = { ...initial };
  return {
    getItem: (key) => (key in map ? map[key] : null),
    setItem: (key, value) => {
      map[key] = String(value);
    }
  };
}

describe('todayDirectionOptionsBanner', () => {
  it('evaluateTodayDirectionOptionsRefreshBanner mirrors gate', () => {
    const unseen = makeStorage();
    assert.deepEqual(evaluateTodayDirectionOptionsRefreshBanner(unseen), {
      shouldShow: false
    });

    const stale = makeStorage({
      [COLD_START_GOAL_SEEN_KEY]: '1',
      [COLD_START_GOAL_OPTIONS_SEEN_KEY]: '0'
    });
    assert.deepEqual(evaluateTodayDirectionOptionsRefreshBanner(stale), {
      shouldShow: true
    });
  });
});
