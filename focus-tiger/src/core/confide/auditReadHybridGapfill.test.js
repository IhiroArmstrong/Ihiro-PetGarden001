/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_TOOL_ID } from './confideExecutableTools.js';
import { summarizeReadHybridGapfill } from './auditReadHybridGapfill.js';

describe('auditReadHybridGapfill', () => {
  it('counts tool≠none and regex replay for false vs true gapfill', () => {
    const rows = [
      {
        at: '2026-09-19T04:00:00.000Z',
        kind: 'read_hybrid_classify',
        text: '列出记忆',
        raw: JSON.stringify({ tool: CONFIDE_TOOL_ID.QUERY_MEMORY_LIST, arguments: {} })
      },
      {
        at: '2026-09-19T04:00:01.000Z',
        kind: 'read_hybrid_classify',
        text: '今天好累',
        raw: JSON.stringify({ tool: 'none', arguments: {} })
      },
      {
        at: '2026-09-19T04:00:02.000Z',
        kind: 'read_hybrid_classify',
        text: '我练了多久',
        raw: JSON.stringify({ tool: CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION, arguments: {} })
      }
    ];
    const summary = summarizeReadHybridGapfill(rows, { requireText: true });
    assert.equal(summary.analyzed, 3);
    assert.equal(summary.toolNonNone, 2);
    assert.equal(summary.toolNone, 1);
    assert.equal(summary.falseGapfill, 1);
    assert.equal(summary.trueGapfill, 1);
    assert.equal(summary.samples.falseGapfill[0]?.hybridTool, CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION);
    assert.equal(summary.samples.trueGapfill[0]?.hybridTool, CONFIDE_TOOL_ID.QUERY_MEMORY_LIST);
    assert.equal(summary.wouldSkipClassify, 1);
  });

  it('honors --since and requireText filters', () => {
    const rows = [
      {
        at: '2026-09-18T10:00:00.000Z',
        kind: 'read_hybrid_classify',
        raw: JSON.stringify({ tool: 'none', arguments: {} })
      },
      {
        at: '2026-09-19T10:00:00.000Z',
        kind: 'read_hybrid_classify',
        text: '列出记忆',
        raw: JSON.stringify({ tool: 'none', arguments: {} })
      }
    ];
    const summary = summarizeReadHybridGapfill(rows, {
      requireText: true,
      sinceIso: '2026-09-19T00:00:00.000Z'
    });
    assert.equal(summary.skippedBeforeSince, 1);
    assert.equal(summary.analyzed, 1);
    assert.equal(summary.withText, 1);
  });
});
