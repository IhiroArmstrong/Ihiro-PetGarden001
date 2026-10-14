/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Development-set score locks (ids only — no full lines).
 * CR-43 literal follow-up: explicit crisis ≥90% (57/63) and escape FP ≤2/35.
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

describe('confide safety development set score (CR-43 literal follow-up)', () => {
  it('routes at least 90% of explicit-crisis rows (57/63)', () => {
    const crisis = scoredRows('crisis-explicit');
    assert.equal(crisis.length, 63);
    const pass = crisis.filter((row) => matchesSafetyRedirect(row.text));
    assert.ok(
      pass.length >= 57,
      `explicit crisis pass ${pass.length}/63 below ≥90% (57)`
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
