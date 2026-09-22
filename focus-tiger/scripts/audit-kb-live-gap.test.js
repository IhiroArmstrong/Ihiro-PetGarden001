/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeKbLiveGapReport,
  KB_CANONICAL_LIVE_APPROVED_MAP,
  KB_CROSS_CUTTING_APPROVED_IDS,
  KB_UNAPPROVED_IDS,
  loadApprovedCatalogIds,
  renderKbLiveGapAuditMarkdownBlock,
  runKbLiveGapAudit
} from './audit-kb-live-gap.js';

describe('audit-kb-live-gap helpers', () => {
  it('loads approved ids from catalog gate', () => {
    const ids = loadApprovedCatalogIds();
    assert.ok(ids.includes('KB-FUNC-0001'));
    assert.ok(ids.includes('KB-FUNC-0018'));
    assert.equal(ids.includes('KB-FUNC-0006'), false);
    assert.equal(ids.includes('KB-FUNC-0009'), false);
  });

  it('flags known registry drift rows', () => {
    const report = computeKbLiveGapReport();
    const driftIds = report.registryMappingDrift.map((row) => row.liveId);
    assert.ok(driftIds.includes('kb-live-companion'));
    assert.ok(driftIds.includes('kb-live-journey-log'));
    assert.ok(driftIds.includes('kb-live-breath'));
    assert.ok(driftIds.includes('kb-live-hud-progress'));
  });

  it('flags unapproved registry links', () => {
    const report = computeKbLiveGapReport();
    const unapprovedIds = report.registryLinksUnapproved.map((row) => row.liveId);
    assert.ok(unapprovedIds.includes('kb-live-breath'));
    assert.ok(unapprovedIds.includes('kb-live-journey-log'));
    for (const row of report.registryLinksUnapproved) {
      for (const id of row.unapprovedKbIds) {
        assert.ok(KB_UNAPPROVED_IDS.includes(id));
      }
    }
  });

  it('lists batch-2 candidates for uncovered live menus', () => {
    const report = computeKbLiveGapReport();
    const candidateIds = report.batch2Candidates.map((row) => row.liveId);
    assert.ok(candidateIds.includes('kb-live-five-moments'));
    assert.ok(candidateIds.includes('kb-live-honesty'));
    assert.ok(candidateIds.includes('kb-live-ritual-morning'));
    assert.equal(candidateIds.includes('kb-live-sit'), false);
    assert.equal(candidateIds.includes('kb-live-ground'), false);
  });

  it('covers every approved catalog id via canonical or cross-cutting map', () => {
    const report = computeKbLiveGapReport();
    assert.deepEqual(report.approvedWithoutLiveSurface, []);
    const linked = new Set([
      ...KB_CROSS_CUTTING_APPROVED_IDS,
      ...Object.values(KB_CANONICAL_LIVE_APPROVED_MAP).flat()
    ]);
    for (const id of loadApprovedCatalogIds()) {
      assert.ok(linked.has(id), `missing canonical map for ${id}`);
    }
  });

  it('renders machine block markers', () => {
    const report = computeKbLiveGapReport();
    const md = renderKbLiveGapAuditMarkdownBlock(report);
    assert.match(md, /<!-- kb-live-gap-audit:begin -->/);
    assert.match(md, /<!-- kb-live-gap-audit:end -->/);
    assert.match(md, /batch-2 live-surface candidates/);
  });
});

describe('audit-kb-live-gap live audit', () => {
  it('passes when markdown block is in sync', () => {
    assert.equal(runKbLiveGapAudit({ write: true }), true);
    assert.equal(runKbLiveGapAudit(), true);
  });
});
