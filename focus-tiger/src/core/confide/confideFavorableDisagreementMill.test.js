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
import { CONFIDE_STAGE2_REAL_MEAT_CANDIDATES } from './confideStage2RealMeatCandidates.js';
import {
  favorableDisagreementMillCsvHeader,
  millFavorableDisagreement,
  MILL_PO_REVIEWER,
  summarizeFavorableDisagreementMill
} from './confideFavorableDisagreementMill.js';
import {
  buildStage2FavorableInventory,
    CONFIDE_STAGE2_HISTORICAL_KEEP,
    CONFIDE_STAGE2_REAL_SHADOW_KEEP,
  summarizeStage2FavorableInventory
} from './confideFavorableDisagreementLedger.js';
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

  it('stamps PO reviewer only on confirmed mill KEEP ids', () => {
    const confirmed = CONFIDE_STAGE2_CHALLENGE_CANDIDATES.find((row) => row.sample_id === 'c01-01');
    const kept = millFavorableDisagreement(confirmed, {
      semanticCoarse: confirmed.golden_bucket
    });
    assert.equal(kept.reviewer, MILL_PO_REVIEWER);
    const dropped = millFavorableDisagreement(confirmed, {
      semanticCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY
    });
    assert.equal(dropped.reviewer, '');
  });

  it('adds 12 historical KEEP separately and still fails real minimum', () => {
    assert.equal(CONFIDE_STAGE2_HISTORICAL_KEEP.length, 12);
    for (const row of CONFIDE_STAGE2_HISTORICAL_KEEP) {
      assert.equal(row.source, MILL_SOURCE.HISTORICAL);
      assert.equal(row.reviewer, MILL_PO_REVIEWER);
      assert.equal(row.is_favorable_disagreement, 'yes');
      assert.notEqual(row.literal_bucket, row.golden_bucket);
    }
    const millRows = CONFIDE_STAGE2_CHALLENGE_CANDIDATES.map((candidate) =>
      millFavorableDisagreement(candidate, { semanticCoarse: candidate.golden_bucket })
    );
    const inventory = buildStage2FavorableInventory(millRows);
    const summary = summarizeStage2FavorableInventory(inventory);
    assert.equal(summary.historical, 12);
    assert.ok(summary.realCount >= 1);
    assert.equal(summary.realMinimumPass, false);
    assert.ok(summary.uniqueTexts < inventory.length);
  });

  it('treats Electron meat-test utterances as real; shadow CSV 我有点不高兴 stays labeled yes', () => {
    const unhappy = CONFIDE_STAGE2_REAL_MEAT_CANDIDATES.find(
      (row) => row.text === '我有点不高兴'
    );
    assert.equal(unhappy.source, MILL_SOURCE.REAL);
    const milled = millFavorableDisagreement(unhappy, {
      semanticCoarse: unhappy.golden_bucket
    });
    assert.ok(
      milled.drop_reason === 'literal_already_correct' ||
        milled.is_favorable_disagreement === 'yes'
    );
    const shadow = CONFIDE_STAGE2_REAL_SHADOW_KEEP[0];
    assert.equal(shadow.is_favorable_disagreement, 'yes');
    assert.equal(shadow.reviewer, MILL_PO_REVIEWER);
    assert.equal(shadow.literal_bucket, 'gray');
  });
});
