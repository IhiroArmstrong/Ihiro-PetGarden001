/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  decideRankMarginHit,
  decideRankMarginWouldPickTop,
  decideScoreBand,
  formatRankMarginStdout,
  numericDistribution,
  rankExpectedCard,
  summarizeRankMarginRows
} from './confideG2FactRankMargin.js';
import { formatQwen3EmbeddingQuery } from './confideSemanticRouting.js';

describe('confideG2FactRankMargin', () => {
  it('ranks the expected card and reports margin vs nearest wrong', () => {
    const row = rankExpectedCard(
      { 'KB-FUNC-0038': 0.71, 'KB-FUNC-0020': 0.69, 'KB-FUNC-0037': 0.4 },
      'KB-FUNC-0038'
    );
    assert.equal(row.rank, 1);
    assert.equal(row.expectedIsTop, true);
    assert.equal(row.nearestWrongId, 'KB-FUNC-0020');
    assert.ok(Math.abs(row.margin - 0.02) < 1e-9);
  });

  it('does not treat a second-place expected card as rank-1', () => {
    const row = rankExpectedCard({ a: 0.9, b: 0.88 }, 'b');
    assert.equal(row.rank, 2);
    assert.equal(row.expectedIsTop, false);
    assert.equal(decideRankMarginHit(row, 0.01), false);
  });

  it('compares 0.80/0.62 bands with rank+margin', () => {
    assert.equal(decideScoreBand(0.81), 'hit');
    assert.equal(decideScoreBand(0.7), 'honesty');
    assert.equal(decideScoreBand(0.5), 'skip');
    const top = rankExpectedCard({ want: 0.71, other: 0.68 }, 'want');
    assert.equal(decideRankMarginHit(top, 0.02), true);
    assert.equal(decideRankMarginWouldPickTop(top, 0.05), false);
  });

  it('prints counts without echoing query text', () => {
    const summary = summarizeRankMarginRows([
      {
        classId: 'whether-required-0038',
        expectedKind: 'product_card',
        expectedCardId: 'KB-FUNC-0038',
        rank: 1,
        expectedScore: 0.71,
        nearestWrongScore: 0.68,
        margin: 0.03,
        expectedIsTop: true,
        topScore: 0.71,
        leadMargin: 0.03,
        band080: 'honesty'
      },
      {
        classId: 'no-fact-card-block',
        expectedKind: 'no_product_card',
        expectedCardId: null,
        rank: null,
        expectedScore: null,
        nearestWrongScore: 0.4,
        margin: null,
        expectedIsTop: false,
        topScore: 0.4,
        leadMargin: 0.05,
        band080: 'skip'
      }
    ]);
    const out = formatRankMarginStdout('visible-dev', summary);
    assert.match(out, /正确卡排名第一 1\/1/);
    assert.equal(out.includes('Do I'), false);
    assert.equal(summary.band_0_80.hit_and_correct, 0);
  });

  it('quantile helper is defined on empty and singleton lists', () => {
    assert.equal(numericDistribution([]).n, 0);
    assert.equal(numericDistribution([0.5]).median, 0.5);
  });

  it('adds Qwen3 instruct only on the query formatter', () => {
    const q = formatQwen3EmbeddingQuery('turn off music');
    assert.match(q, /^Instruct: /);
    assert.match(q, /\nQuery:turn off music<\|endoftext\|>$/);
  });
});
