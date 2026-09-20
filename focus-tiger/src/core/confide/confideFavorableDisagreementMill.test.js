/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  CONFIDE_STAGE2_CHALLENGE_CANDIDATES,
  MILL_METHOD,
  MILL_SOURCE
} from './confideStage2ChallengeCandidates.js';
import {
  favorableDisagreementMillCsvHeader,
  millFavorableDisagreement,
  summarizeFavorableDisagreementMill
} from './confideFavorableDisagreementMill.js';
import { CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED } from './confideStage2SynonymCandidates.js';

describe('favorable disagreement mill', () => {
  it('holds 12 clusters × 5 = 60 unique candidate texts', () => {
    assert.equal(CONFIDE_STAGE2_CHALLENGE_CANDIDATES.length, 60);
    const texts = CONFIDE_STAGE2_CHALLENGE_CANDIDATES.map((row) => row.text);
    assert.equal(new Set(texts).size, 60);
    const clusters = new Set(CONFIDE_STAGE2_CHALLENGE_CANDIDATES.map((row) => row.golden_cluster));
    assert.equal(clusters.size, 12);
    for (const cluster of clusters) {
      const n = CONFIDE_STAGE2_CHALLENGE_CANDIDATES.filter((row) => row.golden_cluster === cluster)
        .length;
      assert.equal(n, 5, cluster);
    }
  });

  it('tags A/C synthetic and B adversarial; never pretends C is real CSV', () => {
    for (const row of CONFIDE_STAGE2_CHALLENGE_CANDIDATES) {
      assert.equal(row.source === MILL_SOURCE.REAL, false, row.sample_id);
      if (row.source_method === MILL_METHOD.B) {
        assert.equal(row.source, MILL_SOURCE.ADVERSARIAL);
      } else {
        assert.equal(row.source, MILL_SOURCE.SYNTHETIC);
      }
      assert.equal(CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED.includes(row.text), false);
    }
  });

  it('keeps only Literal ≠ Golden AND Semantic = Golden', () => {
    const candidate = CONFIDE_STAGE2_CHALLENGE_CANDIDATES.find((row) => {
      const keptProbe = millFavorableDisagreement(row, {
        semanticCoarse: row.golden_bucket
      });
      return keptProbe.drop_reason !== 'literal_already_correct';
    });
    assert.ok(candidate, 'expected at least one literal miss in the 60');
    const kept = millFavorableDisagreement(candidate, {
      semanticCoarse: candidate.golden_bucket,
      scoreA: 0.4,
      scoreB: 0.1,
      grayMargin: 0.1
    });
    assert.equal(kept.is_favorable_disagreement, 'yes');
    assert.equal(kept.drop_reason, null);
    assert.notEqual(kept.literal_bucket, candidate.golden_bucket);

    const missSemantic = millFavorableDisagreement(candidate, {
      semanticCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY
    });
    assert.equal(missSemantic.is_favorable_disagreement, '');
    assert.equal(missSemantic.drop_reason, 'semantic_not_golden');
  });

  it('summarizes source layers and does not auto-pass real minimum on synthetic pool', () => {
    const rows = CONFIDE_STAGE2_CHALLENGE_CANDIDATES.map((candidate) =>
      millFavorableDisagreement(candidate, { semanticCoarse: candidate.golden_bucket })
    );
    const summary = summarizeFavorableDisagreementMill(rows);
    assert.equal(summary.pool, 60);
    assert.equal(summary.realCount, 0);
    assert.equal(summary.realMinimumPass, false);
    assert.ok(summary.favorable >= 1);
    assert.match(favorableDisagreementMillCsvHeader(), /is_favorable_disagreement/);
    assert.match(favorableDisagreementMillCsvHeader(), /source_detail/);
  });
});
