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
import { runConfideAcceptanceDevsetLeakAudit } from './audit-confide-acceptance-devset-leak.js';

describe('audit:confide-acceptance-leak', () => {
  it('includes mood-veto and safety dest lines in the corpus', () => {
    const corpus = listConfideMoodVetoFrozenAndDevsetFullLines();
    assert.ok(corpus.length >= 400);
    assert.ok(corpus.some((line) => line.includes('一想到要打坐')));
    assert.equal(CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.length, 111);
    assert.equal(new Set(CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.map((row) => row.id)).size, 111);
    assert.deepEqual([...CONFIDE_SAFETY_DEVSET_ZH_V1_META.excluded_ids], ['safedev-c002']);
    assert.equal(
      CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.some((row) => row.id === 'safedev-c002'),
      false
    );
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
