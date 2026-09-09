/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  GROWTH_METRIC_TRACK_ROWS,
  listAllGrowthMetricSchemaViolations
} from '../src/core/growthMetricsRegistry.js';
import {
  GROWTH_PERSONA_FIXTURES,
  getGrowthPersonaFixture
} from '../src/core/growthPersonaFixtures.js';
import { runGrowthPersonaRegression } from '../src/core/growthPersonaRegression.js';
import {
  listGrowthMetricPersonaLinkViolations,
  runGrowthMetricsAudit
} from '../scripts/audit-growth-metrics.js';

describe('growthMetricsRegistry', () => {
  it('has unique track ids and passes schema gate', () => {
    const ids = GROWTH_METRIC_TRACK_ROWS.map((row) => row.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(listAllGrowthMetricSchemaViolations(), []);
  });

  it('links personas that exist', () => {
    assert.deepEqual(listGrowthMetricPersonaLinkViolations(), []);
  });
});

describe('growthPersonaRegression', () => {
  it('all fixtures pass product-intent expectations', () => {
    const result = runGrowthPersonaRegression();
    assert.equal(
      result.ok,
      true,
      result.failures.map((f) => `${f.id}: ${f.violations.join('; ')}`).join('\n')
    );
  });

  it('qa-seed-streak-15-legacy documents Batch 2 trap', () => {
    const persona = getGrowthPersonaFixture('qa-seed-streak-15-legacy');
    assert.ok(persona);
    assert.equal(persona.expectations.score, 15);
    assert.equal(persona.expectations.mustardUnlocked, false);
  });

  it('qa-mustard-shortcut matches qaSeedStreak=21', () => {
    const persona = getGrowthPersonaFixture('qa-mustard-shortcut');
    assert.ok(persona);
    assert.equal(persona.expectations.score, 21);
    assert.equal(persona.expectations.mustardUnlocked, true);
  });
});

describe('audit-growth-metrics', () => {
  it('live audit passes on repo SSOT', () => {
    assert.equal(runGrowthMetricsAudit(), true);
  });
});
