/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  FOCUS_COINS_PERSONA_FIXTURES,
  calendarDaysToFirstSku,
  runFocusCoinsPersonaRegression
} from './focusCoinsPersonaRegression.js';

describe('focusCoinsPersonaRegression', () => {
  it('all economic-assessment personas pass live ledger expectations', () => {
    const result = runFocusCoinsPersonaRegression();
    assert.equal(
      result.ok,
      true,
      result.failures.map((f) => `${f.id}: ${f.violations.join('; ')}`).join('\n')
    );
  });

  it('only binge-cap hits the 48 total daily cap', () => {
    const capped = FOCUS_COINS_PERSONA_FIXTURES.filter(
      (p) => p.focusCoinsExpectations.hitsTotalCap
    );
    assert.deepEqual(capped.map((p) => p.id), ['binge-cap']);
  });

  it('first SKU calendar days respect practice-day gate', () => {
    assert.equal(calendarDaysToFirstSku(48, 48), 3);
    assert.equal(calendarDaysToFirstSku(11, 14), 3);
    assert.equal(calendarDaysToFirstSku(6, 9), 3);
  });
});
