/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  evaluateConfideAcceptanceRow,
  runConfideAcceptanceBatch,
  summarizeConfideAcceptanceResults
} from './confideAcceptanceEvaluate.js';
import {
  CONFIDE_ROUND_ACCEPTANCE_COUNTS,
  CONFIDE_ROUND_ACCEPTANCE_FIXTURES
} from './confideRoundAcceptanceFixtures.js';

describe('confideAcceptanceEvaluate', () => {
  it('passes all 100 frozen round fixtures through the desktop pipeline evaluator', () => {
    const results = runConfideAcceptanceBatch();
    assert.equal(results.length, CONFIDE_ROUND_ACCEPTANCE_COUNTS.total);
    const summary = summarizeConfideAcceptanceResults(results);
    assert.equal(summary.pass, summary.total, () => {
      const failed = results.filter((row) => !row.pass);
      return failed
        .slice(0, 8)
        .map((row) => `${row.id}: ${row.failures.join('; ')}`)
        .join('\n');
    });
    assert.equal(summary.bySuite.meta.pass, 32);
    assert.equal(summary.bySuite.aggression.pass, 30);
    assert.equal(summary.bySuite.supplement.pass, 38);
  });

  it('passes meta+aggression only (62 utterances) when suites filtered', () => {
    const results = runConfideAcceptanceBatch({ suites: ['meta', 'aggression'] });
    assert.equal(results.length, 62);
    assert.ok(results.every((row) => row.pass));
  });

  it('evaluates each row independently (spot-check kinds)', () => {
    const meta = CONFIDE_ROUND_ACCEPTANCE_FIXTURES.find((r) => r.id === 'meta-list-zh-canonical');
    assert.ok(meta);
    assert.equal(evaluateConfideAcceptanceRow(meta).pass, true);
    const agg = CONFIDE_ROUND_ACCEPTANCE_FIXTURES.find((r) => r.id === 'agg-zh-wo-xiang-daren');
    assert.ok(agg);
    assert.equal(evaluateConfideAcceptanceRow(agg).pass, true);
  });
});
