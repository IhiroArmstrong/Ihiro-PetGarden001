/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  KB_MOOD_VETO_LAB_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MOOD_ROWS
} from './confideKbMoodVetoLabSet.js';
import { CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS } from './confideMoodVetoDevsetZhV1.js';
import { KB_CATALOG_NEAR_REVIEW_LAB_ROWS } from './confideKbCatalogNearReview.js';
import {
  CONFIDE_ROUTING_DEVSET_ZH_V2_CLASSES,
  CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS,
  CONFIDE_ROUTING_DEVSET_ZH_V2_META
} from './confideRoutingDevsetZhV2.js';

describe('CONFIDE_ROUTING_DEVSET_ZH_V2', () => {
  it('loads 45 items with meta counts that sum correctly', () => {
    assert.equal(CONFIDE_ROUTING_DEVSET_ZH_V2_META.version, 'v2');
    assert.equal(CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS.length, 45);
    const sum = Object.values(CONFIDE_ROUTING_DEVSET_ZH_V2_META.counts).reduce((a, n) => a + n, 0);
    assert.equal(sum, 45);
  });

  it('has unique ids, three classes, and matching expects', () => {
    const ids = new Set();
    for (const row of CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS) {
      assert.ok(row.text.trim().length >= 8, row.id);
      assert.equal(ids.has(row.id), false, row.id);
      ids.add(row.id);
      assert.equal(CONFIDE_ROUTING_DEVSET_ZH_V2_CLASSES.includes(row.class), true, row.id);
      if (row.class === 'mixed-emotion-dominant') assert.equal(row.expect, 'mood');
      else assert.equal(row.expect, 'product');
    }
    for (const classId of CONFIDE_ROUTING_DEVSET_ZH_V2_CLASSES) {
      assert.equal(
        CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS.filter((r) => r.class === classId).length,
        15,
        classId
      );
    }
  });

  it('does not copy freeze, mood destset, catalog-leak, or AE lines', () => {
    const forbidden = new Set();
    for (const row of [...KB_MOOD_VETO_LAB_MOOD_ROWS, ...KB_MOOD_VETO_LAB_CONTROL_ROWS]) {
      forbidden.add(String(row.text).trim());
    }
    for (const row of CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS) forbidden.add(String(row.text).trim());
    for (const row of KB_CATALOG_NEAR_REVIEW_LAB_ROWS) forbidden.add(String(row.text).trim());
    for (const row of CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS) {
      assert.equal(forbidden.has(row.text.trim()), false, row.id);
    }
  });
});
