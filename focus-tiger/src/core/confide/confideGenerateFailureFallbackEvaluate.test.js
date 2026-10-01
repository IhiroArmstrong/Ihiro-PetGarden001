/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS,
  CONFIDE_GENERATE_FAILURE_FALLBACK_FIXTURES
} from './confideGenerateFailureFallbackFixtures.js';
import {
  evaluateGenerateFailureFallbackRow,
  runGenerateFailureFallbackBatch,
  summarizeGenerateFailureFallbackResults
} from './confideGenerateFailureFallbackEvaluate.js';

describe('confideGenerateFailureFallbackEvaluate', () => {
  it('passes all frozen generate-failure fallback fixtures', () => {
    const results = runGenerateFailureFallbackBatch();
    assert.equal(results.length, CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS.total);
    const summary = summarizeGenerateFailureFallbackResults(results);
    assert.equal(summary.pass, summary.total, () => {
      const failed = results.filter((row) => !row.pass);
      return failed
        .slice(0, 8)
        .map((row) => `${row.id}: ${row.failures.join('; ')}`)
        .join('\n');
    });
    assert.ok(summary.generateFailFixtures >= 20, 'generate_fail sample count should be large enough');
    assert.ok(summary.checks >= summary.generateFailFixtures * 20, 'checks should scale with fixtures');
  });

  it('primary #930 compound row never picks fallback-02', () => {
    const row = CONFIDE_GENERATE_FAILURE_FALLBACK_FIXTURES.find(
      (fixture) => fixture.id === 'gf-compound-annoyed-no-practice-comma'
    );
    assert.ok(row);
    const result = evaluateGenerateFailureFallbackRow(row);
    assert.equal(result.pass, true, result.failures.join('; '));
    assert.equal(result.actual.generateEligible, true);
  });

  it('corpus control still allows fallback-02 on normal retrieve', () => {
    const row = CONFIDE_GENERATE_FAILURE_FALLBACK_FIXTURES.find(
      (fixture) => fixture.id === 'gf-control-weather-en'
    );
    assert.ok(row);
    const result = evaluateGenerateFailureFallbackRow(row);
    assert.equal(result.pass, true, result.failures.join('; '));
    assert.ok(result.actual.fallbackIdsSeen.includes('fallback-02'));
  });
});
