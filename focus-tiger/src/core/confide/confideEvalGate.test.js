/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  confideLiveEvalGate,
  confideFrozenSetRole
} from './confideEvalGate.js';

describe('confideLiveEvalGate (R-0)', () => {
  it('fails when only the frozen set is green', () => {
    assert.equal(
      confideLiveEvalGate({ frozenNoRegress: true, blindMet: false }),
      false
    );
  });

  it('fails when only the blind set is green', () => {
    assert.equal(
      confideLiveEvalGate({ frozenNoRegress: false, blindMet: true }),
      false
    );
  });

  it('passes only when both layers are green', () => {
    assert.equal(
      confideLiveEvalGate({ frozenNoRegress: true, blindMet: true }),
      true
    );
  });
});

describe('confideFrozenSetRole', () => {
  it('treats a tuned frozen set as regression-only', () => {
    assert.equal(confideFrozenSetRole({ usedForTuning: true }), 'regression_only');
    assert.equal(confideFrozenSetRole({ usedForTuning: false }), 'may_tune');
  });
});
