/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T90 · audit-fix-10-01 / 10-06: L3 generate on fallback requires semantic
 * crisis layer to have scored this send with a ready embedding when the layer
 * would apply (wide viewport, non-ja, etc.).
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { shouldAttemptConfideSemanticCrisis } from './confideSemanticCrisisLayer.js';

/** @typedef {{ scored: boolean, embeddingOk: boolean }} ConfideSemanticCrisisGenerateAttestation */

/**
 * @returns {ConfideSemanticCrisisGenerateAttestation}
 */
export function createConfideSemanticCrisisGenerateAttestation() {
  return { scored: false, embeddingOk: false };
}

/**
 * @param {{
 *   route?: string | null,
 *   text?: string | null,
 *   wideViewport?: boolean,
 *   scored?: boolean,
 *   embeddingOk?: boolean,
 *   env?: NodeJS.ProcessEnv | null
 * }} [opts]
 * @returns {boolean} true = generate must stay blocked
 */
export function confideSemanticCrisisBlocksL3Generate({
  route = null,
  text = '',
  wideViewport = false,
  scored = false,
  embeddingOk = false,
  env
} = {}) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  const mustScore = shouldAttemptConfideSemanticCrisis({
    literalRoute: route,
    text,
    wideViewport,
    env
  });
  if (!mustScore) return false;
  if (!scored) return true;
  return !embeddingOk;
}
