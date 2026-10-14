/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIDE_ROUTE_DEVSET_ZH_V2_CLASSES,
  CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS,
  CONFIDE_ROUTE_DEVSET_ZH_V2_META
} from './confideRouteDevsetZhV2.js';

describe('CONFIDE_ROUTE_DEVSET_ZH_V2', () => {
  it('loads 180 items with class counts that sum correctly', () => {
    assert.equal(CONFIDE_ROUTE_DEVSET_ZH_V2_META.version, 'v2');
    assert.equal(CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS.length, 180);
    assert.deepEqual(CONFIDE_ROUTE_DEVSET_ZH_V2_META.class_counts, {
      'mixed-explicit': 70,
      'product-real': 70,
      'emotion-aside': 40
    });
    const sum = Object.values(CONFIDE_ROUTE_DEVSET_ZH_V2_META.class_counts).reduce((a, n) => a + n, 0);
    assert.equal(sum, 180);
  });

  it('has unique ids, known classes, and non-empty text', () => {
    const ids = new Set();
    const classes = new Set(CONFIDE_ROUTE_DEVSET_ZH_V2_CLASSES);
    for (const row of CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS) {
      assert.ok(row.text.trim().length >= 4, row.id);
      assert.equal(ids.has(row.id), false, row.id);
      assert.equal(classes.has(row.class), true, row.id);
      ids.add(row.id);
    }
    assert.equal(ids.size, 180);
  });

  it('keeps product-real short quota and rdev2-082 as a domain-specific short ask', () => {
    const shorts = CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS.filter(
      (row) => row.class === 'product-real' && row.dim === 'short'
    );
    assert.equal(shorts.length, 8);
    const r082 = CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS.find((row) => row.id === 'rdev2-082');
    assert.ok(r082);
    assert.equal(r082.class, 'product-real');
    assert.equal(r082.dim, 'short');
    assert.equal(r082.expect, 'product');
    assert.equal(r082.text, '备份开关在菜单哪栏？');
    assert.equal(r082.text.includes('开关在哪？'), false);
  });
});
