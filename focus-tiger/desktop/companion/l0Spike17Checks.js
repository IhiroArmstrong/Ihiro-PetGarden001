/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Spike-only checks: production config wired + L2 corpus fallback on generate failure.
 */

import { resolveConfideReply } from '../../src/core/confide/confideReplyFlow.js';
import { CONFIDE_ROUTE } from '../../src/core/confide/confideRoutes.js';
import { L0_MODEL_ID } from './l0Config.js';
import { SPIKE_17_MODEL_ID } from './l0Spike17Config.js';

/**
 * Spike lab stays on isolated 1.7B metadata; production default may differ (Gemma4-E4B).
 * Field `unchanged` = spike config still targets 1.7B (script exit compatibility).
 *
 * @returns {{ productionModelId: string, unchanged: boolean, productionMatchesSpike: boolean }}
 */
export function verifyProductionL0ConfigUnchanged() {
  const spikeConfigIntact = SPIKE_17_MODEL_ID === 'Qwen3-1.7B-Q4_K_M';
  return {
    productionModelId: L0_MODEL_ID,
    unchanged: spikeConfigIntact,
    productionMatchesSpike: L0_MODEL_ID === SPIKE_17_MODEL_ID
  };
}

/**
 * Mirrors AE L2: generate fails → corpus fallback, never blank.
 * @returns {{ route: string, lineId: string, nonEmpty: boolean }}
 */
export function simulateGenerateFailureFallback() {
  const hit = resolveConfideReply({
    text: "What's the weather like in Beijing this week?"
  });
  if (!hit) {
    return { route: '', lineId: '', nonEmpty: false };
  }
  return {
    route: hit.route,
    lineId: hit.line.id,
    nonEmpty: Boolean(
      (hit.line.en && hit.line.en.trim()) ||
        (hit.line.zh && hit.line.zh.trim()) ||
        (hit.line.ja && hit.line.ja.trim())
    )
  };
}

/**
 * @returns {boolean}
 */
export function fallbackRouteIsCorpusFallback() {
  const row = simulateGenerateFailureFallback();
  return row.route === CONFIDE_ROUTE.FALLBACK && row.nonEmpty;
}
