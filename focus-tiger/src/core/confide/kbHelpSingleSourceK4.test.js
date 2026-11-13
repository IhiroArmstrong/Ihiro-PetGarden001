/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { probeProductKnowledgeCatalog } from './confideProductKnowledge.js';
import { computeKbLiveGapReport } from '../../../scripts/audit-kb-live-gap.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const catalog = JSON.parse(
  readFileSync(join(ROOT, 'src/core/confide/productKnowledgeCatalog.json'), 'utf8')
);

const K4_HELP_ONLY = [
  'KB-FUNC-0044',
  'KB-FUNC-0045',
  'KB-FUNC-0046',
  'KB-FUNC-0047',
  'KB-FUNC-0048',
  'KB-FUNC-0049',
  'KB-FUNC-0050'
];

describe('KB help single-source knife 4', () => {
  it('ships desktop shell and co-practice surfaces as help-only', () => {
    for (const id of K4_HELP_ONLY) {
      const row = catalog.entries.find((entry) => entry.id === id);
      assert.ok(row, id);
      assert.equal(row.yinMayRetrieve, false, id);
      assert.equal(row.helpCenterVisible, true, id);
      assert.match(row.shortAnswerEn, /Yin only points/, id);
    }
  });

  it('does not let Confide probe hit help-only knife-4 ids', () => {
    const probes = [
      'Wrap-up time inventory',
      'Keep in front inventory',
      'Window inventory',
      'Focus rhythm inventory',
      'Log to Health inventory',
      'Stay in touch inventory',
      'Art Collection inventory'
    ];
    for (const text of probes) {
      const hit = probeProductKnowledgeCatalog(text);
      for (const id of K4_HELP_ONLY) {
        assert.notEqual(hit.id, id, `${text} → ${id}`);
      }
    }
  });

  it('clears live gaps for knife-4 registry rows', () => {
    const report = computeKbLiveGapReport();
    const candidates = report.batch2Candidates.map((row) => row.liveId);
    for (const liveId of [
      'kb-live-work-end',
      'kb-live-always-on-top',
      'kb-live-window-layout',
      'kb-live-input-rhythm',
      'kb-live-health-shortcut-log',
      'kb-live-newsletter',
      'kb-live-art-collection'
    ]) {
      assert.equal(candidates.includes(liveId), false, liveId);
    }
  });
});
