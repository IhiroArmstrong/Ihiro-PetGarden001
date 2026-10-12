/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatStage2bPoSeededGateReport,
  normalizeStage2bSeedText,
  parseStage2bFamilyTsv,
  parseStage2bSentenceList,
  previewStage2bConfirmCandidates,
  summarizeConfideStage2bPoSeededGate
} from './auditConfideStage2bPoSeeded.js';

describe('auditConfideStage2bPoSeeded', () => {
  it('counts unique po_seeded texts, families, and false pulls', () => {
    const summary = summarizeConfideStage2bPoSeededGate(
      [
        { kind: 'semantic_shadow_classify', ok: true, seedSource: 'natural', text: 'ignore' },
        {
          kind: 'semantic_shadow_classify',
          ok: false,
          seedSource: 'po_seeded',
          text: '想试试那个一起坐的练习',
          stage2bWouldPromote: true
        },
        {
          kind: 'semantic_shadow_classify',
          ok: true,
          seedSource: 'po_seeded',
          text: '想试试那个一起坐的练习',
          stage2bWouldPromote: true
        },
        {
          kind: 'semantic_shadow_classify',
          ok: true,
          seedSource: 'po_seeded',
          text: '  想试试那个一起坐的练习  ',
          stage2bWouldPromote: false
        },
        {
          kind: 'semantic_shadow_classify',
          ok: true,
          seedSource: 'po_seeded',
          text: '最近老是想起以前',
          stage2bWouldPromote: true
        },
        {
          kind: 'semantic_shadow_classify',
          ok: true,
          seedSource: 'po_seeded',
          text: '有点烦',
          stage2bWouldPromote: false
        }
      ],
      {
        familyByText: {
          '想试试那个一起坐的练习': 'start-sit',
          '最近老是想起以前': 'past-records-neighbor'
        },
        negativeTexts: ['最近老是想起以前', '有点烦']
      }
    );

    assert.equal(summary.uniqueTextCount, 3);
    assert.equal(summary.uniqueWouldPromoteCount, 2);
    assert.equal(summary.uniqueFamilyCount, 2);
    assert.equal(summary.falsePullCount, 1);
    assert.deepEqual(summary.falsePulls, ['最近老是想起以前']);
    assert.equal(summary.skippedNotOkPoSeeded, 1);
    assert.equal(summary.meetsUniqueTexts, false);
    assert.equal(summary.meetsFamilies, false);
    assert.equal(summary.meetsFalsePulls, true);
  });

  it('parses family TSV and sentence lists, ignoring comments', () => {
    const families = parseStage2bFamilyTsv(
      '# comment\n怎么开始坐？\tstart-sit\n\nSit 按钮在哪\tfind-control\n'
    );
    assert.equal(families.get('怎么开始坐？'), 'start-sit');
    assert.equal(families.get('Sit 按钮在哪'), 'find-control');
    assert.deepEqual(parseStage2bSentenceList('# skip\n怎么开始坐？\n怎么开始坐？\n有点烦\n'), [
      '怎么开始坐？',
      '有点烦'
    ]);
    assert.equal(normalizeStage2bSeedText('  怎么   开始坐？  '), '怎么 开始坐？');
  });

  it('never prints a live cutover verdict', () => {
    const report = formatStage2bPoSeededGateReport({
      filePath: '/tmp/turns.jsonl',
      uniqueTextCount: 0,
      uniqueWouldPromoteCount: 0,
      uniqueFamilyCount: 0,
      unlabeledCount: 0,
      falsePullCount: 0,
      skippedNotOkPoSeeded: 0,
      skippedMalformed: 0,
      meetsUniqueTexts: false,
      meetsFamilies: false,
      meetsFalsePulls: true,
      jsonPath: '/tmp/out.json'
    });
    assert.match(report, /not a live cutover verdict/);
    assert.doesNotMatch(report, /can cut|可以切/i);
  });

  it('literal-previews past PO questions without claiming semantic M', () => {
    const rows = previewStage2bConfirmCandidates([
      '怎么开始坐？',
      'Sit 按钮在哪',
      '俺 如何 能够 获得 更多的 寅币？',
      'How to get more focus coins?',
      '备份能够 备份 哪些数据？',
      '接地练习在哪',
      '提醒我练习',
      '有点烦'
    ]);
    const byText = Object.fromEntries(rows.map((row) => [row.text, row]));
    assert.equal(byText['有点烦'].literalCoarse, 'gray');
    assert.notEqual(byText['提醒我练习'].literalCoarse, 'gray');
    assert.equal(byText['怎么开始坐？'].literalCoarse, 'gray');
  });
});
