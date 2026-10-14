/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS,
  listConfideMoodVetoFrozenAndDevsetFullLines
} from '../src/core/confide/confideAcceptanceFrozenSentenceCorpus.js';
import { runConfideAcceptanceDevsetLeakAudit } from './audit-confide-acceptance-devset-leak.js';

describe('audit:confide-acceptance-leak', () => {
  it('includes devset lines in the frozen corpus', () => {
    const corpus = listConfideMoodVetoFrozenAndDevsetFullLines();
    assert.ok(corpus.length >= 250);
    assert.ok(corpus.some((line) => line.includes('一想到要打坐')));
    assert.ok(corpus.some((line) => line.includes('练完胸口发闷')));
  });

  it('passes on the current tree (no frozen lines in production Confide code)', () => {
    assert.equal(runConfideAcceptanceDevsetLeakAudit(), true);
  });

  it('keeps the #1188 leak grandfather list shrink-only (four literals)', () => {
    assert.equal(CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS.length, 4);
  });
});
