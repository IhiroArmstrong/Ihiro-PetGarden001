/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  SPIKE_17_EXPECTED_BYTES,
  SPIKE_17_MODEL_FILENAME,
  SPIKE_17_MODEL_ID
} from '../../desktop/companion/l0Spike17Config.js';
import {
  fallbackRouteIsCorpusFallback,
  verifyProductionL0ConfigUnchanged
} from '../../desktop/companion/l0Spike17Checks.js';
import { L0_MODEL_ID } from '../../desktop/companion/l0Config.js';

describe('1.7B spike config (isolated lab; production may be Gemma4)', () => {
  it('locks unsloth 1.7B Q4 metadata for spike-only runs', () => {
    assert.equal(SPIKE_17_MODEL_ID, 'Qwen3-1.7B-Q4_K_M');
    assert.equal(SPIKE_17_MODEL_FILENAME, 'Qwen3-1.7B-Q4_K_M.gguf');
    assert.equal(SPIKE_17_EXPECTED_BYTES, 1_107_409_472);
  });

  it('reports production model separately from spike lab target', () => {
    const row = verifyProductionL0ConfigUnchanged();
    assert.equal(row.productionModelId, L0_MODEL_ID);
    assert.equal(row.unchanged, true);
    assert.equal(row.productionMatchesSpike, L0_MODEL_ID === SPIKE_17_MODEL_ID);
  });

  it('unmatched confide still resolves corpus fallback (generate failure path)', () => {
    assert.equal(fallbackRouteIsCorpusFallback(), true);
  });
});
