/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatKbMatrixProbeReport,
  isKbRetrievalMissRow,
  KB_MATRIX_PROBE_ROUND2_MIN_NOVEL,
  summarizeKbMatrixProbeCandidates
} from './auditConfideKbMatrixProbes.js';
import { buildKbMatrixFixtureTextSet } from './confideKbRoutingMatrix.js';

describe('auditConfideKbMatrixProbes', () => {
  it('recognizes kb_retrieval_miss rows only', () => {
    assert.equal(isKbRetrievalMissRow({ kind: 'kb_retrieval_miss', text: 'x' }), true);
    assert.equal(isKbRetrievalMissRow({ kind: 'semantic_shadow_classify' }), false);
  });

  it('dedupes log misses and flags texts already frozen in the matrix', () => {
    const fixtureSet = buildKbMatrixFixtureTextSet();
    const summary = summarizeKbMatrixProbeCandidates(
      [
        {
          kind: 'kb_retrieval_miss',
          at: '2026-09-22T10:00:00.000Z',
          text: '怎么获得寅币？',
          reason: 'below_threshold',
          locale: 'zh'
        },
        {
          kind: 'kb_retrieval_miss',
          at: '2026-09-22T11:00:00.000Z',
          text: '怎么 获得 寅币？',
          reason: 'no_keyword_match',
          locale: 'zh'
        },
        {
          kind: 'kb_retrieval_miss',
          at: '2026-09-23T08:00:00.000Z',
          text: '壁纸菜单从哪开？',
          reason: 'semantic_miss',
          locale: 'zh'
        }
      ],
      fixtureSet
    );
    assert.equal(summary.missRowCount, 3);
    assert.equal(summary.uniqueMissCount, 2);
    assert.equal(summary.novelCount >= 1, true);
    const coins = summary.candidates.find((row) => row.text.includes('寅币'));
    assert.equal(coins?.alreadyInMatrix, true);
    assert.equal(summary.readyForRound2, summary.novelCount >= KB_MATRIX_PROBE_ROUND2_MIN_NOVEL);
  });

  it('report reminds not to auto-start embedding', () => {
    const report = formatKbMatrixProbeReport({
      filePath: '/tmp/turns.jsonl',
      missRowCount: 0,
      uniqueMissCount: 0,
      novelCount: 0,
      readyForRound2: false
    });
    assert.match(report, /must not print "start embedding now"/);
    assert.match(report, /2026-10-12/);
  });
});
