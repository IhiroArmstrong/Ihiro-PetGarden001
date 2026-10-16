/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * CR-46 safety tier structure (thresholds unset until professional review PR).
 */

import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { formatConfideSafetyResourceGuidance } from './confideSafetyResources.js';

export const CONFIDE_SAFETY_TIER = Object.freeze({
  HIGH: 'high',
  MID: 'mid',
  NONE: 'none'
});

export const CONFIDE_SAFETY_CARE_MODE = Object.freeze({
  LIVE: 'live',
  OFF: 'off'
});

/**
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @returns {'live' | 'off'}
 */
export function resolveConfideSafetyCareMode(env) {
  const raw = String(confideBrowserSafeEnv(env).FT_CONFIDE_SAFETY_CARE || 'off')
    .trim()
    .toLowerCase();
  return raw === 'live' ? CONFIDE_SAFETY_CARE_MODE.LIVE : CONFIDE_SAFETY_CARE_MODE.OFF;
}

/**
 * Locked thresholds are written in the review PR (env overrides for lab only).
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @returns {{ tHigh: number | null, tMid: number | null }}
 */
export function resolveConfideSafetyTierThresholds(env) {
  const highRaw = Number(confideBrowserSafeEnv(env).FT_CONFIDE_SAFETY_T_HIGH);
  const midRaw = Number(confideBrowserSafeEnv(env).FT_CONFIDE_SAFETY_T_MID);
  return {
    tHigh: Number.isFinite(highRaw) && highRaw > 0 && highRaw < 1 ? highRaw : null,
    tMid: Number.isFinite(midRaw) && midRaw > 0 && midRaw < 1 ? midRaw : null
  };
}

/**
 * @param {{
 *   literalSafetyHit?: boolean,
 *   score?: number,
 *   embeddingOk?: boolean,
 *   env?: NodeJS.ProcessEnv | null
 * }} [opts]
 * @returns {{
 *   tier: 'high' | 'mid' | 'none',
 *   route: string | null
 * }}
 */
export function resolveConfideSafetyTierBand({
  literalSafetyHit = false,
  score = 0,
  embeddingOk = false,
  env
} = {}) {
  if (literalSafetyHit) {
    return { tier: CONFIDE_SAFETY_TIER.HIGH, route: CONFIDE_ROUTE.SAFETY_REDIRECT };
  }
  const mode = resolveConfideSafetyCareMode(env);
  const { tHigh, tMid } = resolveConfideSafetyTierThresholds(env);
  if (
    mode !== CONFIDE_SAFETY_CARE_MODE.LIVE ||
    !embeddingOk ||
    tHigh === null ||
    tMid === null
  ) {
    return { tier: CONFIDE_SAFETY_TIER.NONE, route: null };
  }
  const s = Number(score);
  if (!Number.isFinite(s)) {
    return { tier: CONFIDE_SAFETY_TIER.NONE, route: null };
  }
  if (s >= tHigh) {
    return { tier: CONFIDE_SAFETY_TIER.HIGH, route: CONFIDE_ROUTE.SAFETY_REDIRECT };
  }
  if (s >= tMid) {
    return { tier: CONFIDE_SAFETY_TIER.MID, route: CONFIDE_ROUTE.SAFETY_CARE };
  }
  return { tier: CONFIDE_SAFETY_TIER.NONE, route: null };
}

/**
 * @param {string} locale
 * @param {(key: string) => string} translate
 * @returns {string}
 */
export function buildConfideSafetyCareReplyText(locale, translate) {
  const placeholder = translate('CONFIDE_SAFETY_CARE_PLACEHOLDER').trim();
  const resources = formatConfideSafetyResourceGuidance(locale).trim();
  if (!placeholder) return resources;
  if (!resources) return placeholder;
  return `${placeholder}\n\n${resources}`;
}
