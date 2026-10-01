/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  PRIOR_FORK_HARM,
  PRIOR_FORK_HELP,
  PRIOR_FORK_OTHER,
  PRIOR_FORK_SAME,
  applyAsymmetricPriorRule,
  classifyPriorFork,
  formatHelpHarmRatio,
  formatPriorAsymmetricReport,
  summarizeConfideSemanticPriorAsymmetric
} from './auditConfideSemanticPriorAsymmetric.js';

describe('auditConfideSemanticPriorAsymmetric', () => {
  it('classifies gray→definite as help and definite→gray as harm', () => {
    assert.equal(
      classifyPriorFork(
        CONFIDE_SEMANTIC_BUCKET.GRAY,
        CONFIDE_SEMANTIC_BUCKET.EMOTIONAL
      ),
      PRIOR_FORK_HELP
    );
    assert.equal(
      classifyPriorFork(
        CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
        CONFIDE_SEMANTIC_BUCKET.GRAY
      ),
      PRIOR_FORK_HARM
    );
    assert.equal(
      classifyPriorFork(
        CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
        CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL
      ),
      PRIOR_FORK_OTHER
    );
    assert.equal(
      classifyPriorFork(
        CONFIDE_SEMANTIC_BUCKET.GRAY,
        CONFIDE_SEMANTIC_BUCKET.GRAY
      ),
      PRIOR_FORK_SAME
    );
  });

  it('keeps help forks and rejects dilution back to gray', () => {
    assert.equal(
      applyAsymmetricPriorRule(
        CONFIDE_SEMANTIC_BUCKET.GRAY,
        CONFIDE_SEMANTIC_BUCKET.EMOTIONAL
      ),
      CONFIDE_SEMANTIC_BUCKET.EMOTIONAL
    );
    assert.equal(
      applyAsymmetricPriorRule(
        CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
        CONFIDE_SEMANTIC_BUCKET.GRAY
      ),
      CONFIDE_SEMANTIC_BUCKET.EMOTIONAL
    );
    assert.equal(
      applyAsymmetricPriorRule(
        CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
        CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL
      ),
      CONFIDE_SEMANTIC_BUCKET.EMOTIONAL
    );
  });

  it('replays mixed logs without counting ineligible rows as forks', () => {
    const summary = summarizeConfideSemanticPriorAsymmetric([
      {
        kind: 'semantic_shadow_classify',
        ok: true,
        hadPriorTurn: true,
        text: '好累',
        semanticCoarse: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
        semanticCoarseWithPrior: CONFIDE_SEMANTIC_BUCKET.GRAY
      },
      {
        kind: 'semantic_shadow_classify',
        ok: true,
        hadPriorTurn: true,
        text: '好吧',
        semanticCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY,
        semanticCoarseWithPrior: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL
      },
      {
        kind: 'semantic_shadow_classify',
        ok: true,
        hadPriorTurn: false,
        semanticCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY,
        semanticCoarseWithPrior: null
      },
      { kind: 'l3_generate', ok: true }
    ]);
    assert.equal(summary.eligibleCount, 2);
    assert.equal(summary.naiveHelp, 1);
    assert.equal(summary.naiveHarm, 1);
    assert.equal(summary.ruleHelp, 1);
    assert.equal(summary.ruleHarm, 0);
    assert.equal(summary.skippedNotEligible, 1);
    assert.equal(formatHelpHarmRatio(1, 1), '0.5000 (1÷2)');
    assert.equal(formatHelpHarmRatio(1, 0), '1.0000 (1÷1)');
  });

  it('prints replay counts without live-routing language', () => {
    const report = formatPriorAsymmetricReport({
      filePath: '/tmp/turns.jsonl',
      eligibleCount: 2,
      naiveHelp: 1,
      naiveHarm: 1,
      naiveOther: 0,
      naiveSame: 0,
      ruleHelp: 1,
      ruleHarm: 0,
      skippedNotEligible: 0,
      jsonPath: '/tmp/out.json'
    });
    assert.match(report, /^semantic prior asymmetric replay\n/);
    assert.match(report, /\nruleHarm=0\n/);
    for (const banned of ['Stage 2', '可以切', '够不够', '切真路由']) {
      assert.equal(report.includes(banned), false, banned);
    }
  });
});
