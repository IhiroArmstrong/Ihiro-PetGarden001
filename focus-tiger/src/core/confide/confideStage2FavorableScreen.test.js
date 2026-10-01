/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED,
  CONFIDE_STAGE2_SYNONYM_CANDIDATES,
  resolveStage2LiteralSnapshot,
  screenStage2FavorableCandidate,
  stage2SuggestedCsvHeader
} from './confideStage2FavorableScreen.js';
import { resolveConfideDesktopSource } from './confideAcceptanceResolve.js';

describe('Stage 2 unpatched synonym screen', () => {
  it('does not use patched 累积/忙啥/列出记忆 as candidates', () => {
    const texts = new Set(CONFIDE_STAGE2_SYNONYM_CANDIDATES.map((row) => row.text));
    for (const banned of CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED) {
      assert.equal(texts.has(banned), false, banned);
      assert.equal(resolveConfideDesktopSource(banned) !== 'generate', true, banned);
    }
  });

  it('only keeps candidates whose current literal coarse is still wrong', () => {
    assert.ok(CONFIDE_STAGE2_SYNONYM_CANDIDATES.length >= 12);
    for (const row of CONFIDE_STAGE2_SYNONYM_CANDIDATES) {
      const snap = resolveStage2LiteralSnapshot(row.text);
      assert.notEqual(
        snap.literalCoarse,
        row.expectedBucket,
        `${row.id} literal already matches ${row.expectedBucket} (${snap.source})`
      );
    }
  });

  it('drops a candidate when semantic is not the expected bucket', () => {
    const row = CONFIDE_STAGE2_SYNONYM_CANDIDATES[0];
    const dropped = screenStage2FavorableCandidate({
      ...row,
      semanticCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY
    });
    assert.equal(dropped.keep, false);
    assert.equal(dropped.dropReason, 'semantic_not_expected');
  });

  it('keeps a candidate when semantic matches expected and literal does not', () => {
    const row = CONFIDE_STAGE2_SYNONYM_CANDIDATES[0];
    const kept = screenStage2FavorableCandidate({
      ...row,
      semanticCoarse: row.expectedBucket,
      scoreA: 0.4,
      scoreB: 0.2,
      grayMargin: 0.08
    });
    assert.equal(kept.keep, true);
    assert.notEqual(kept.literalCoarse, row.expectedBucket);
    assert.match(stage2SuggestedCsvHeader(), /favorable_disagreement$/);
  });
});
