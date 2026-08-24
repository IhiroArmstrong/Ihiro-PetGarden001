/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Spike-only checks: production config unchanged + L2 corpus fallback on generate failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveConfideReply } from '../../src/core/confide/confideReplyFlow.js';
import { CONFIDE_ROUTE } from '../../src/core/confide/confideRoutes.js';
import { L0_MODEL_ID } from './l0Config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @returns {{ productionModelId: string, unchanged: boolean }}
 */
export function verifyProductionL0ConfigUnchanged() {
  const configPath = path.join(__dirname, 'l0Config.js');
  const src = fs.readFileSync(configPath, 'utf8');
  const unchanged =
    L0_MODEL_ID === 'Qwen3-0.6B-Q4_K_M' &&
    src.includes("export const L0_MODEL_ID = 'Qwen3-0.6B-Q4_K_M'") &&
    !src.includes('1.7B');
  return { productionModelId: L0_MODEL_ID, unchanged };
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
