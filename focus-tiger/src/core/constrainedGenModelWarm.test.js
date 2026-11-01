/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  constrainedGenWarmFallbackReason,
  isConstrainedGenModelWarm
} from './constrainedGenModelWarm.js';

describe('isConstrainedGenModelWarm', () => {
  it('is warm only when phase is ready and not focusing', () => {
    assert.equal(isConstrainedGenModelWarm({ phase: 'ready', focusing: false }), true);
    assert.equal(isConstrainedGenModelWarm({ phase: 'ready' }), true);
  });

  it('is cold while focusing even if a stale ready phase is present', () => {
    assert.equal(isConstrainedGenModelWarm({ phase: 'ready', focusing: true }), false);
  });

  it('is cold when unloaded, loading, or missing', () => {
    assert.equal(isConstrainedGenModelWarm({ phase: 'idle', focusing: false }), false);
    assert.equal(isConstrainedGenModelWarm({ phase: 'loading', focusing: false }), false);
    assert.equal(isConstrainedGenModelWarm({ phase: 'unloading' }), false);
    assert.equal(isConstrainedGenModelWarm(null), false);
    assert.equal(isConstrainedGenModelWarm(undefined), false);
  });

  it('maps cold to cold-start, not timeout', () => {
    assert.equal(constrainedGenWarmFallbackReason(false), 'cold-start');
    assert.equal(constrainedGenWarmFallbackReason(true), 'none');
  });
});
