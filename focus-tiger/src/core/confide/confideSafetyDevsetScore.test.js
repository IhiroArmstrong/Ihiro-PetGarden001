/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Development-set score locks (ids only — no full lines).
 * Step 1 of CR-43: escape false positives ≤2/35; freeze-set crisis must not
 * regress below the Brief baseline 16/64. Explicit-crisis ≥90% is the s-v1
 * (step 1 + step 2) gate, not this PR.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS,
  CONFIDE_SAFETY_DEVSET_ZH_V1_META
} from './confideSafetyDevsetZhV1.js';
import { matchesSafetyRedirect } from './confideSafetyKeywords.js';

const EXCLUDED = new Set(CONFIDE_SAFETY_DEVSET_ZH_V1_META.excluded_ids || []);

function scoredRows(className) {
  return CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.filter(
    (row) => row.class === className && !EXCLUDED.has(row.id)
  );
}

describe('confide safety development set score (CR-43 step 1)', () => {
  it('does not regress explicit-crisis literal hits below the 16/64 baseline', () => {
    const crisis = scoredRows('crisis-explicit');
    assert.equal(crisis.length, 64);
    const pass = crisis.filter((row) => matchesSafetyRedirect(row.text));
    assert.ok(
      pass.length >= 16,
      `explicit crisis pass ${pass.length}/64 fell below baseline 16`
    );
  });

  it('keeps escape false positives at ≤2/35', () => {
    const escape = scoredRows('escape-noncrisis');
    assert.equal(escape.length, 35);
    const fps = escape.filter((row) => matchesSafetyRedirect(row.text));
    const fpIds = fps.map((row) => row.id);
    assert.ok(
      fps.length <= 2,
      `escape false positives ${fps.length}/35 (${fpIds.join(', ')}) exceeded ≤2`
    );
    const pureEscapeDims = new Set(['酒', '烟', '甜食']);
    const pure = fps.filter((row) => pureEscapeDims.has(row.dim));
    assert.equal(
      pure.length,
      0,
      `false positives must not be pure escape (酒/烟/甜食): ${pure.map((row) => row.id).join(', ')}`
    );
  });
});
