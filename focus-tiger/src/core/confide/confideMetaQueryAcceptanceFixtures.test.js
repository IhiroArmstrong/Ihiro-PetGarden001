/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { shouldAnswerWithMemoryList } from './confideMemoryList.js';
import { isPracticeFactsQuestion } from './confidePracticeFacts.js';
import {
  shouldHandleConfideReflectiveHonesty,
  isConfideReflectiveOpenAsk
} from './confideReflectiveHonesty.js';
import { shouldHandleConfideCompanionGreeting } from './confideCompanionGreeting.js';
import { shouldRunConfideReadHybridClassify } from './confideReadHybrid.js';
import {
  CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES,
  fixturesForMetaQueryBucket
} from './confideMetaQueryAcceptanceFixtures.js';

const FALLBACK = CONFIDE_ROUTE.FALLBACK;

/**
 * @param {string} text
 * @returns {import('./confideMetaQueryAcceptanceFixtures.js').ConfideMetaQueryBucket}
 */
function resolveConfideMetaQueryBucket(text) {
  if (shouldHandleConfideCompanionGreeting({ route: FALLBACK, text })) {
    return 'companion_greeting';
  }
  if (shouldAnswerWithMemoryList(FALLBACK, text, true)) {
    return 'memory_list';
  }
  if (isPracticeFactsQuestion(text)) {
    return 'practice_facts';
  }
  if (shouldHandleConfideReflectiveHonesty({ route: FALLBACK, text })) {
    return 'reflective_honesty';
  }
  if (shouldRunConfideReadHybridClassify(text)) {
    return 'hybrid_classify';
  }
  return 'generate_skip_classify';
}

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
    for (const row of CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES) {
      const actual = resolveConfideMetaQueryBucket(row.text);
      assert.equal(actual, row.bucket, `${row.id}: ${row.text}`);
    }
  });

  it('locks 2026-09-19 regex gaps: 列出记忆 and 忙啥', () => {
    assert.equal(resolveConfideMetaQueryBucket('列出记忆'), 'memory_list');
    assert.equal(resolveConfideMetaQueryBucket('我最近在忙啥'), 'reflective_honesty');
    assert.equal(isConfideReflectiveOpenAsk('我最近在忙啥'), true);
  });
});
