/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isConfideGenerateEligible,
  resolveConfideDesktopSource,
  resolveConfideMetaQueryBucket
} from './confideAcceptanceResolve.js';
import { confideClassify } from './confideClassify.js';
import {
  CONFIDE_ROUND_ACCEPTANCE_COUNTS,
  CONFIDE_ROUND_ACCEPTANCE_FIXTURES,
  fixturesForRoundAcceptanceSuite
} from './confideRoundAcceptanceFixtures.js';

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
    for (const row of CONFIDE_ROUND_ACCEPTANCE_FIXTURES) {
      if (row.kind === 'meta_query') {
        assert.equal(resolveConfideMetaQueryBucket(row.text), row.expect, row.id);
        continue;
      }
      if (row.kind === 'aggression_route' || row.kind === 'classify_route') {
        assert.equal(confideClassify(row.text), row.expect, row.id);
        continue;
      }
      if (row.kind === 'desktop_source') {
        assert.equal(resolveConfideDesktopSource(row.text), row.expect, row.id);
        continue;
      }
      if (row.kind === 'generate_eligible') {
        const eligible = isConfideGenerateEligible(row.text);
        assert.equal(String(eligible), row.expect, row.id);
        continue;
      }
      assert.fail(`unknown kind ${row.kind} for ${row.id}`);
    }
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
