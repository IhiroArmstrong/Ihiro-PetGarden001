/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { runFocusEssencePersonaRegression } from './focusEssencePersonaRegression.js';

describe('focusEssencePersonaRegression', () => {
  it('essence earn personas match focus-coins fixtures', () => {
    const result = runFocusEssencePersonaRegression();
    assert.equal(result.ok, true, JSON.stringify(result.failures, null, 2));
  });
});
