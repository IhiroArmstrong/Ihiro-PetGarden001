/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIDE_ACCEPTANCE_LEAK_SCAN_RELATIVE_PATHS,
  CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS,
  CONFIDE_SAFETY_LEAK_SCAN_RELATIVE_PATHS,
  listConfideMoodVetoFrozenAndDevsetFullLines
} from '../src/core/confide/confideAcceptanceFrozenSentenceCorpus.js';
import {
  CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS,
  CONFIDE_SAFETY_DEVSET_ZH_V1_META
} from '../src/core/confide/confideSafetyDevsetZhV1.js';
import { CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS } from '../src/core/confide/confideRouteDevsetZhV2.js';
import { runConfideAcceptanceDevsetLeakAudit } from './audit-confide-acceptance-devset-leak.js';

describe('audit:confide-acceptance-leak', () => {
  it('includes mood-veto and safety dest lines in the corpus', () => {
    const corpus = listConfideMoodVetoFrozenAndDevsetFullLines();
    assert.ok(corpus.length >= 400);
    assert.ok(corpus.some((line) => line.includes('一想到要打坐')));
    assert.ok(corpus.some((line) => line.includes('练完胸口发闷')));
    assert.equal(CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.length, 111);
    assert.equal(new Set(CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.map((row) => row.id)).size, 111);
    assert.deepEqual([...CONFIDE_SAFETY_DEVSET_ZH_V1_META.excluded_ids], ['safedev-c002']);
    assert.equal(
      CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.some((row) => row.id === 'safedev-c002'),
      false
    );
    assert.equal(CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS.length, 180);
    assert.equal(new Set(CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS.map((row) => row.id)).size, 180);
    assert.equal(
      corpus.includes('备份开关在菜单哪栏？'),
      true
    );
    const byClass = CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.reduce((acc, row) => {
      acc[row.class] = (acc[row.class] || 0) + 1;
      return acc;
    }, {});
    assert.equal(byClass['crisis-explicit'], 63);
    assert.equal(byClass['escape-noncrisis'], 35);
    assert.equal(byClass['crisis-grey'], 13);
    const c017 = CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.find((row) => row.id === 'safedev-c017');
    assert.equal(c017?.class, 'crisis-grey');
    assert.equal(c017?.expect, 'emotion');
  });

  it('scans safety classifier modules as well as mood-veto patch surfaces', () => {
    assert.ok(CONFIDE_SAFETY_LEAK_SCAN_RELATIVE_PATHS.includes('src/core/confide/confideSafetyKeywords.js'));
    assert.ok(CONFIDE_ACCEPTANCE_LEAK_SCAN_RELATIVE_PATHS.includes('src/core/confide/confideClassify.js'));
  });

  it('passes on the current tree (no frozen lines in production Confide code)', () => {
    assert.equal(runConfideAcceptanceDevsetLeakAudit(), true);
  });

  it('keeps the #1188 leak grandfather list shrink-only (four literals)', () => {
    assert.equal(CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS.length, 4);
  });
});
