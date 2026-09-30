/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { hashConfidePrivateText } from './confidePrivacy.js';
import { matchesSafetyRedirect } from './confideSafetyKeywords.js';

export const CONFIDE_CRISIS_PARAPHRASE_SHADOW_KIND =
  'crisis_paraphrase_shadow';
export const CONFIDE_CRISIS_PARAPHRASE_CANDIDATE_VERSION = 1;

/**
 * Observation-only candidates derived from the six audit misses in #1044.
 * A match must not change routing, reply copy, TTS, or emotion classification.
 */
const CANDIDATE_PATTERNS = Object.freeze([
  {
    id: 'en.no-point-being-here',
    re: /\b(?:do not|don't|dont|cannot|can't)\s+see\s+(?:any\s+|the\s+)?point\s+(?:of\s+)?(?:being|staying)\s+here(?:\s+anymore)?\b/i
  },
  {
    id: 'en.disappear',
    re: /\b(?:want|wish|need)\s+to\s+disappear(?:\s+forever)?\b/i
  },
  {
    id: 'en.better-off-without-me',
    re: /\b(?:everyone|everybody|people|they|you(?:\s+all)?)\s+(?:would|might|could)\s+be\s+better\s+off\s+without\s+me\b/i
  },
  {
    id: 'zh.cannot-carry-on',
    re: /(?:我)?(?:真的)?(?:撑|撐|熬|坚持|堅持)不下去(?:了)?/
  },
  {
    id: 'zh.not-wake-up',
    re: /(?:我)?不想(?:再)?醒(?:来|來)(?:了)?/
  },
  {
    id: 'ja.disappear-only-option',
    re: /(?:もう)?消えるしかない/
  }
]);

/**
 * @param {string} text
 * @returns {string | null}
 */
export function matchCrisisParaphraseShadowCandidate(text) {
  const raw = typeof text === 'string' ? text : '';
  if (!raw.trim() || matchesSafetyRedirect(raw)) return null;
  for (const candidate of CANDIDATE_PATTERNS) {
    if (candidate.re.test(raw)) return candidate.id;
  }
  return null;
}

/**
 * Privacy-safe local audit row. It is for aggregate pattern calibration only.
 * @param {{ text: string, locale?: string, now?: () => Date }} payload
 * @returns {object | null}
 */
export function buildCrisisParaphraseShadowTurnLog({
  text,
  locale = 'en',
  now = () => new Date()
}) {
  const patternId = matchCrisisParaphraseShadowCandidate(text);
  if (!patternId) return null;
  return {
    at: now().toISOString(),
    kind: CONFIDE_CRISIS_PARAPHRASE_SHADOW_KIND,
    locale,
    queryHash: hashConfidePrivateText(text),
    textLength: String(text || '').length,
    patternId,
    candidateVersion: CONFIDE_CRISIS_PARAPHRASE_CANDIDATE_VERSION,
    purpose: 'aggregate_pattern_calibration_only'
  };
}
