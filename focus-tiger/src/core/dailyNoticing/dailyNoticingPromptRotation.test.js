/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DAILY_NOTICING_PROMPT_IDS,
  buildDailyNoticingPromptOrder,
  pickDailyNoticingPrimaryPromptId
} from './dailyNoticingPromptRotation.js';

describe('dailyNoticingPromptRotation', () => {
  it('orders four unique prompts', () => {
    const first = pickDailyNoticingPrimaryPromptId('2026-11-26', []);
    assert.ok(DAILY_NOTICING_PROMPT_IDS.includes(first));
    const order = buildDailyNoticingPromptOrder('2026-11-26', []);
    assert.equal(order.length, 4);
    assert.equal(new Set(order).size, 4);
  });
});