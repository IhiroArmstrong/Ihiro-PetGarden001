/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mustardSeedSealZhIsPrimaryLocale } from './MustardSeedSealCardUI.js';

describe('mustardSeedSealZhIsPrimaryLocale', () => {
  it('zh uses traditional poem as primary', () => {
    assert.equal(mustardSeedSealZhIsPrimaryLocale('zh'), true);
  });

  it('en and ja use English poem as primary', () => {
    assert.equal(mustardSeedSealZhIsPrimaryLocale('en'), false);
    assert.equal(mustardSeedSealZhIsPrimaryLocale('ja'), false);
  });
});
