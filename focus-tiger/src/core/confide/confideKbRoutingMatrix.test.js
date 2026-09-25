/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  evaluateKbRoutingMatrix,
  KB_ROUTING_MATRIX_FIXTURES,
  KB_ROUTING_MATRIX_PROBE_SNAPSHOTS,
  KB_ROUTING_MATRIX_REGRESSION_IDS,
  kbRoutingMatrixSuggestsEmbeddingDebt,
  listLiveKbIdsForMatrix
} from './confideKbRoutingMatrix.js';

describe('confide KB routing matrix', () => {
  it('freezes the 2026-09-22 hand-test regressions as must-hit/must-miss', () => {
    const ids = new Set(KB_ROUTING_MATRIX_FIXTURES.map((row) => row.id));
    for (const id of KB_ROUTING_MATRIX_REGRESSION_IDS) {
      assert.equal(ids.has(id), true, id);
    }
  });

  it('covers every live catalog id with at least three fixtures', () => {
    const live = listLiveKbIdsForMatrix();
    assert.equal(live.length >= 16, true);
    for (const catalogId of live) {
      const n = KB_ROUTING_MATRIX_FIXTURES.filter(
        (row) => row.expect.catalogId === catalogId
      ).length;
      assert.equal(n >= 3, true, `${catalogId} has ${n} fixtures`);
    }
  });

  it('locks routing targets, not reply copy', () => {
    const report = evaluateKbRoutingMatrix();
    assert.equal(
      report.lockedFail.length,
      0,
      () =>
        report.lockedFail
          .map(
            (row) =>
              `${row.id}: got ${row.dataSource}/${row.catalogId} want ${row.expectSource}/${row.expectId}`
          )
          .join('\n')
    );
  });

  it('reports probe miss-rate as the embedding-debt signal without failing CI', () => {
    const report = evaluateKbRoutingMatrix();
    assert.equal(typeof report.probeMissRate, 'number');
    assert.equal(report.probes >= 4, true);
    const flag = kbRoutingMatrixSuggestsEmbeddingDebt(report);
    assert.equal(typeof flag, 'boolean');
  });

  it('matches the frozen round-2 probe snapshot on develop tip', () => {
    const report = evaluateKbRoutingMatrix();
    const snap = KB_ROUTING_MATRIX_PROBE_SNAPSHOTS.round2;
    assert.equal(report.probes, snap.probes);
    assert.equal(report.probeMiss, snap.probeMiss);
    assert.equal(report.probeMissRate, snap.probeMissRate);
    assert.equal(kbRoutingMatrixSuggestsEmbeddingDebt(report), true);
    assert.equal(snap.logAudit.novelCount, 0);
    assert.equal(snap.logAudit.readyForRound2, false);
  });
});
