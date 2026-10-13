/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIDE_MOOD_VETO_DEVSET_ZH_V1_CLASSES,
  CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS,
  CONFIDE_MOOD_VETO_DEVSET_ZH_V1_META
} from './confideMoodVetoDevsetZhV1.js';

describe('CONFIDE_MOOD_VETO_DEVSET_ZH_V1', () => {
  it('loads 144 items with meta counts that sum correctly', () => {
    assert.equal(CONFIDE_MOOD_VETO_DEVSET_ZH_V1_META.version, 'v1');
    assert.equal(CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS.length, 144);
    const sum = Object.values(CONFIDE_MOOD_VETO_DEVSET_ZH_V1_META.counts).reduce((a, n) => a + n, 0);
    assert.equal(sum, 144);
  });

  it('has unique ids and non-empty text', () => {
    const ids = new Set();
    for (const row of CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS) {
      assert.ok(row.text.trim().length >= 4, row.id);
      assert.equal(ids.has(row.id), false, row.id);
      ids.add(row.id);
    }
  });

  it('has at least 5 interrogative-positive lines per class', () => {
    for (const classId of CONFIDE_MOOD_VETO_DEVSET_ZH_V1_CLASSES) {
      const n = CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS.filter(
        (r) => r.class === classId && r.label === 'interrogative-positive'
      ).length;
      assert.ok(n >= 5, `${classId} interrogative-positive has ${n}`);
    }
  });

  it('only escape-urge carries crisis-edge labels', () => {
    for (const row of CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS) {
      if (row.label === 'crisis-edge-clear' || row.label === 'crisis-edge-grey') {
        assert.equal(row.class, 'escape-urge', row.id);
      }
    }
  });
});
