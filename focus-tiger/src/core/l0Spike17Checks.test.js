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

describe('1.7B spike config (mirrors production l0Config)', () => {
  it('locks unsloth 1.7B Q4 metadata aligned with production default', () => {
    assert.equal(SPIKE_17_MODEL_ID, 'Qwen3-1.7B-Q4_K_M');
    assert.equal(SPIKE_17_MODEL_FILENAME, 'Qwen3-1.7B-Q4_K_M.gguf');
    assert.equal(SPIKE_17_EXPECTED_BYTES, 1_107_409_472);
    assert.equal(L0_MODEL_ID, SPIKE_17_MODEL_ID);
  });

  it('production l0Config.js is wired to 1.7B', () => {
    const row = verifyProductionL0ConfigUnchanged();
    assert.equal(row.productionModelId, 'Qwen3-1.7B-Q4_K_M');
    assert.equal(row.unchanged, true);
  });

  it('unmatched confide still resolves corpus fallback (generate failure path)', () => {
    assert.equal(fallbackRouteIsCorpusFallback(), true);
  });
});
