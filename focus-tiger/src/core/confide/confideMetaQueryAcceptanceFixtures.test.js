/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runConfideAcceptanceBatch } from './confideAcceptanceEvaluate.js';
import { isConfideReflectiveOpenAsk } from './confideReflectiveHonesty.js';
import {
  CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES,
  fixturesForMetaQueryBucket
} from './confideMetaQueryAcceptanceFixtures.js';

describe('confideMetaQueryAcceptanceFixtures', () => {
  it('freezes exactly 32 acceptance utterances', () => {
    assert.equal(CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES.length, 32);
    const ids = new Set(CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES.map((row) => row.id));
    assert.equal(ids.size, CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES.length);
  });

  it('covers all six routing buckets', () => {
    const buckets = new Set(CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES.map((row) => row.bucket));
    assert.deepEqual(
      [...buckets].sort(),
      [
        'companion_greeting',
        'generate_skip_classify',
        'hybrid_classify',
        'memory_list',
        'practice_facts',
        'reflective_honesty'
      ]
    );
    assert.ok(fixturesForMetaQueryBucket('memory_list').length >= 8);
    assert.ok(fixturesForMetaQueryBucket('reflective_honesty').length >= 8);
  });

  it('routes every frozen utterance to its expected bucket', () => {
    const results = runConfideAcceptanceBatch({ suites: ['meta'] });
    assert.equal(results.length, CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES.length);
    assert.ok(
      results.every((row) => row.pass),
      () =>
        results
          .filter((row) => !row.pass)
          .slice(0, 5)
          .map((row) => `${row.id}: ${row.failures.join('; ')}`)
          .join('\n')
    );
  });

  it('locks 2026-09-19 regex gaps: 列出记忆 and 忙啥', () => {
    const byId = Object.fromEntries(
      runConfideAcceptanceBatch({ suites: ['meta'] }).map((row) => [row.id, row])
    );
    assert.equal(byId['meta-list-zh-canonical']?.actual.bucket, 'memory_list');
    assert.equal(byId['meta-busy-zh-sha']?.actual.bucket, 'reflective_honesty');
    assert.equal(isConfideReflectiveOpenAsk('我最近在忙啥'), true);
  });
});
