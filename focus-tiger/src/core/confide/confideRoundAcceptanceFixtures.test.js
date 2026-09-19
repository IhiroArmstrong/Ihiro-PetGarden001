/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runConfideAcceptanceBatch } from './confideAcceptanceEvaluate.js';
import {
  CONFIDE_ROUND_ACCEPTANCE_COUNTS,
  CONFIDE_ROUND_ACCEPTANCE_FIXTURES,
  fixturesForRoundAcceptanceSuite
} from './confideRoundAcceptanceFixtures.js';
import { resolveConfideDesktopSource, resolveConfideMetaQueryBucket } from './confideAcceptanceResolve.js';
import { confideClassify } from './confideClassify.js';

describe('confideRoundAcceptanceFixtures', () => {
  it('freezes exactly 100 acceptance utterances across three suites', () => {
    assert.equal(CONFIDE_ROUND_ACCEPTANCE_COUNTS.meta, 32);
    assert.equal(CONFIDE_ROUND_ACCEPTANCE_COUNTS.aggression, 30);
    assert.equal(CONFIDE_ROUND_ACCEPTANCE_COUNTS.supplement, 38);
    assert.equal(CONFIDE_ROUND_ACCEPTANCE_COUNTS.total, 100);
    assert.equal(CONFIDE_ROUND_ACCEPTANCE_FIXTURES.length, 100);
    const ids = new Set(CONFIDE_ROUND_ACCEPTANCE_FIXTURES.map((row) => row.id));
    assert.equal(ids.size, 100);
  });

  it('routes every frozen utterance through its assertion kind', () => {
    const results = runConfideAcceptanceBatch();
    const failed = results.filter((row) => !row.pass);
    assert.equal(failed.length, 0, () =>
      failed.slice(0, 5).map((row) => `${row.id}: ${row.failures.join('; ')}`).join('\n')
    );
  });

  it('locks semantic anchor regressions: 累积了多久 · 忙啥', () => {
    assert.equal(resolveConfideDesktopSource('累积了多久'), 'practice_facts');
    assert.equal(confideClassify('累积了多久'), 'fallback');
    assert.equal(resolveConfideDesktopSource('忙啥'), 'reflective_honesty');
    assert.equal(resolveConfideMetaQueryBucket('我最近在忙啥'), 'reflective_honesty');
  });

  it('keeps suite partitions stable for manual Electron runs', () => {
    assert.equal(fixturesForRoundAcceptanceSuite('meta').length, 32);
    assert.equal(fixturesForRoundAcceptanceSuite('aggression').length, 30);
    assert.equal(fixturesForRoundAcceptanceSuite('supplement').length, 38);
  });
});
