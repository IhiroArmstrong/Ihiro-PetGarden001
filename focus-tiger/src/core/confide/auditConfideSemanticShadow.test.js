/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  formatSemanticShadowDisagreementCsv,
  formatSemanticShadowRatio,
  formatSemanticShadowReport,
  parseTurnsJsonl,
  summarizeConfideSemanticShadow
} from './auditConfideSemanticShadow.js';

const SRC_DIR = path.dirname(fileURLToPath(import.meta.url));

describe('auditConfideSemanticShadow', () => {
  it('counts only ok semantic_shadow_classify rows and disagreements', () => {
    const summary = summarizeConfideSemanticShadow([
      { kind: 'l3_generate', ok: true },
      {
        kind: 'semantic_shadow_classify',
        ok: false,
        reason: 'embed_failed',
        literalCoarse: 'gray',
        semanticCoarse: null
      },
      {
        at: '2026-09-20T01:00:00.000Z',
        kind: 'semantic_shadow_classify',
        ok: true,
        text: '累积了多久',
        route: 'practice_facts',
        source: 'practice_facts',
        literalCoarse: 'functional',
        semanticCoarse: 'functional'
      },
      {
        at: '2026-09-20T01:00:01.000Z',
        kind: 'semantic_shadow_classify',
        ok: true,
        text: '好累',
        route: 'tired',
        source: 'corpus',
        literalCoarse: 'emotional',
        semanticCoarse: 'gray',
        scoreA: 0.4,
        scoreB: 0.39
      }
    ]);
    assert.equal(summary.sampleCount, 2);
    assert.equal(summary.disagreementCount, 1);
    assert.equal(summary.skippedNotOk, 1);
    assert.equal(summary.disagreements[0].text, '好累');
    assert.equal(formatSemanticShadowRatio(2, 1), '0.5000 (1÷2)');
  });

  it('treats N=0 as n/a and still writes a header-only CSV', () => {
    const summary = summarizeConfideSemanticShadow([]);
    assert.equal(summary.sampleCount, 0);
    assert.equal(summary.disagreementCount, 0);
    assert.equal(formatSemanticShadowRatio(0, 0), 'n/a');
    assert.equal(
      formatSemanticShadowDisagreementCsv([]),
      'at,text,route,source,literalCoarse,semanticCoarse,scoreA,scoreB,grayMargin,hadPriorTurn,semanticCoarseWithPrior,scoreAWithPrior,scoreBWithPrior,favorable_disagreement\n'
    );
  });

  it('exports disagreement CSV with an empty annotation column', () => {
    const csv = formatSemanticShadowDisagreementCsv([
      {
        at: '2026-09-20T01:00:01.000Z',
        text: '好累,真的',
        route: 'tired',
        source: 'corpus',
        literalCoarse: 'emotional',
        semanticCoarse: 'gray',
        scoreA: 0.4,
        scoreB: 0.39,
        grayMargin: 0.08,
        hadPriorTurn: false,
        semanticCoarseWithPrior: null,
        scoreAWithPrior: null,
        scoreBWithPrior: null
      }
    ]);
    const lines = csv.trim().split('\n');
    assert.equal(lines.length, 2);
    assert.match(lines[0], /favorable_disagreement$/);
    assert.match(lines[1], /"好累,真的"/);
    assert.match(lines[1], /,$/);
  });

  it('prints N D D÷N without routing-switch language', () => {
    const report = formatSemanticShadowReport({
      filePath: '/tmp/turns.jsonl',
      sampleCount: 4,
      disagreementCount: 1,
      skippedNotOk: 0,
      skippedMalformed: 0,
      csvPath: '/tmp/out.csv'
    });
    assert.match(report, /^semantic shadow disagreement\n/);
    assert.match(report, /\nN=4\n/);
    assert.match(report, /\nD=1\n/);
    assert.match(report, /\nD÷N=0.2500 \(1÷4\)\n/);
    assert.match(report, /\nskippedMalformed=0\n/);
    const src = readFileSync(path.join(SRC_DIR, 'auditConfideSemanticShadow.js'), 'utf8');
    const cli = readFileSync(
      path.join(SRC_DIR, '../../../scripts/audit-confide-semantic-shadow.js'),
      'utf8'
    );
    for (const banned of ['Stage 2', '可以切', '够不够', '切真路由']) {
      assert.equal(src.includes(banned), false, banned);
      assert.equal(cli.includes(banned), false, banned);
      assert.equal(report.includes(banned), false, banned);
    }
  });

  it('skips malformed jsonl lines without aborting the export', () => {
    const parsed = parseTurnsJsonl(
      [
        '{not json',
        '{"kind":"semantic_shadow_classify","ok":true,"literalCoarse":"gray","semanticCoarse":"emotional","text":"好孤单"}',
        '42'
      ].join('\n')
    );
    assert.equal(parsed.skippedMalformed, 2);
    assert.equal(parsed.rows.length, 1);
    const summary = summarizeConfideSemanticShadow(parsed.rows);
    assert.equal(summary.sampleCount, 1);
    assert.equal(summary.disagreementCount, 1);
  });
});
