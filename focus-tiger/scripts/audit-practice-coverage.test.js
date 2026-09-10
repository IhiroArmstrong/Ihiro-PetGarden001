/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  diffBaselineCoverage,
  findMissingCodeAnchors
} from '../scripts/audit-practice-coverage.js';
import {
  PRACTICE_BASELINE_SOURCE_IDS,
  PRACTICE_AGGREGATE_CONSUMER_ROWS,
  listPracticeAggregateCoverageGateRows
} from '../src/core/practiceAggregateConsumerRegistry.js';
import { runPracticeAggregateCoverageAudit } from '../scripts/audit-practice-coverage.js';

describe('practiceAggregateConsumerRegistry', () => {
  it('has unique consumer ids', () => {
    const ids = PRACTICE_AGGREGATE_CONSUMER_ROWS.map((row) => row.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('gated rows reflect full baseline', () => {
    for (const row of listPracticeAggregateCoverageGateRows()) {
      const { missing, extra } = diffBaselineCoverage(
        PRACTICE_BASELINE_SOURCE_IDS,
        row.reflectedSources
      );
      assert.deepEqual(missing, [], `${row.id} missing baseline sources`);
      assert.deepEqual(extra, [], `${row.id} extra sources`);
    }
  });
});

describe('audit-practice-coverage', () => {
  it('diffBaselineCoverage detects missing sources', () => {
    const { missing, extra } = diffBaselineCoverage(
      ['sit-timed', 'honesty-checkin'],
      ['sit-timed']
    );
    assert.deepEqual(missing, ['honesty-checkin']);
    assert.deepEqual(extra, []);
  });

  it('findMissingCodeAnchors reports absent strings', () => {
    const row = {
      id: 'test',
      codeAnchors: ['resolvePracticeAggregate(']
    };
    assert.deepEqual(findMissingCodeAnchors(row, '// no aggregate'), [
      'resolvePracticeAggregate('
    ]);
  });

  it('live audit passes on repo SSOT', () => {
    assert.equal(runPracticeAggregateCoverageAudit(), true);
  });
});
