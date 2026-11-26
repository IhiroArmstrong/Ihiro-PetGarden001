/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveDailyNoticingMenuClick } from './dailyNoticingMenuClick.js';

describe('resolveDailyNoticingMenuClick', () => {
  it('open on idle', () => {
    assert.equal(resolveDailyNoticingMenuClick({}), 'open');
  });
  it('busy when focusing', () => {
    assert.equal(resolveDailyNoticingMenuClick({ focusing: true }), 'busy');
  });
});