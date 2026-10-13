/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS } from './confideAcceptanceFrozenSentenceCorpus.js';

describe('CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS', () => {
  it('is shrink-only: still the four #1188 literals until ablation empties the list', () => {
    assert.equal(CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS.length, 4);
  });
});
