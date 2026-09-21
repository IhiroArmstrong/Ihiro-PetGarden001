/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createSemanticShadowEmbeddingGate } from '../../../desktop/companion/l1SemanticShadowEmbeddingGate.js';
import {
  isSemanticLiveColdstartProbePass,
  resolveSemanticLiveWhenGateNotReady,
  runSemanticLiveColdstartProbe,
  SEMANTIC_LIVE_COLDSTART_PROBE_FIXTURES
} from './semanticLiveColdstartProbe.js';
import {
  summarizeConfideSemanticLive
} from './auditConfideSemanticShadow.js';

describe('semanticLiveColdstartProbe', () => {
  it('returns embed_not_ready while the embedding gate is cold', () => {
    const gate = createSemanticShadowEmbeddingGate();
    const cold = resolveSemanticLiveWhenGateNotReady(
      gate,
      SEMANTIC_LIVE_COLDSTART_PROBE_FIXTURES[0]
    );
    assert.equal(cold?.reason, 'embed_not_ready');
    assert.equal(cold?.ok, false);
    assert.equal(gate.snapshot().state, 'loading');
  });

  it('writes one cold fail-open row and one ready ok row', async () => {
    const gate = createSemanticShadowEmbeddingGate();
    const { rows, coldRows, readyRows } = await runSemanticLiveColdstartProbe({
      gate,
      classifyUserText: async () => ({
        bucket: 'functional',
        scoreA: 0.71,
        scoreB: 0.42,
        grayMargin: 0.08,
        embedMs: 12
      })
    });
    assert.equal(coldRows.length, 1);
    assert.equal(readyRows.length, 1);
    assert.equal(rows[0].reason, 'embed_not_ready');
    assert.equal(rows[1].reason, 'ok');
    assert.equal(rows[1].semanticCoarse, 'functional');

    const liveSummary = summarizeConfideSemanticLive(rows);
    assert.equal(liveSummary.liveCount, 2);
    assert.equal(liveSummary.failOpenCount, 1);
    assert.equal(liveSummary.semanticOkCount, 1);
    assert.equal(
      isSemanticLiveColdstartProbePass({
        liveCount: liveSummary.liveCount,
        failOpenCount: liveSummary.failOpenCount,
        semanticOkCount: liveSummary.semanticOkCount,
        coldRows: coldRows.length,
        readyRows: readyRows.length
      }),
      true
    );
  });
});
