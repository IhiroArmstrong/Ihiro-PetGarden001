/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Step 4 draft rows: machine-verify locale_keys before PO spot-check. */
const KB_DRAFT_LOCALE_KEYS = Object.freeze({
  'KB-FUNC-0021': Object.freeze([
    'DAILY_ZEN_QUOTE_MENU_LABEL',
    'DAILY_ZEN_QUOTE_CARD_TITLE',
    'DAILY_ZEN_QUOTE_CARD_BLURB',
    'DAILY_ZEN_QUOTE_SAVE_NOTE',
    'DAILY_ZEN_QUOTE_CANCEL',
    'DAILY_ZEN_QUOTE_SAVE'
  ])
});

import {
  computeKbLiveGapReport,
  KB_CANONICAL_LIVE_APPROVED_MAP,
  KB_CROSS_CUTTING_APPROVED_IDS,
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

  it('registry mapping drift is cleared after canonical catalogKbIds sync', () => {
    const report = computeKbLiveGapReport();
    assert.equal(report.registryMappingDrift.length, 0);
  });

  it('registry no longer links unapproved pilot ids', () => {
    const report = computeKbLiveGapReport();
    assert.equal(report.registryLinksUnapproved.length, 0);
  });

  it('draft locale_keys for pending Step 4 rows exist in en.json', () => {
    const en = JSON.parse(
      readFileSync(join(ROOT, 'src/locales/en.json'), 'utf8')
    );
    for (const [id, keys] of Object.entries(KB_DRAFT_LOCALE_KEYS)) {
      for (const key of keys) {
        assert.ok(
          typeof en[key] === 'string' && en[key].trim().length > 0,
          `${id} locale key missing or empty: ${key}`
        );
      }
    }
  });

  it('lists batch-2 candidates for uncovered live menus', () => {
    const report = computeKbLiveGapReport();
    const candidateIds = report.batch2Candidates.map((row) => row.liveId);
    assert.equal(candidateIds.includes('kb-live-five-moments'), false);
    assert.equal(candidateIds.includes('kb-live-honesty'), false);
    assert.equal(candidateIds.includes('kb-live-daily-quote'), false);
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
