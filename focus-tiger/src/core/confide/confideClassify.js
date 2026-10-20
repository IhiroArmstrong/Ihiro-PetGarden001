/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide to Yin · rule classify (no fuzzy score, no generative).
 *
 * Pipeline (locked):
 *   empty → null (caller must disable send)
 *   → safety_redirect (priority)
 *   → aggression_toward_others (other-directed violence intent)
 *   → T36: Hiragana/Katakana → language_not_yet_open (after safety)
 *   → CR-52: confirmed product ask (operational ∧ object) → fallback
 *   → emotion buckets (explicit priority on multi-hit)
 *   → fallback
 */

import {
  CONFIDE_EMOTION_PRIORITY,
  CONFIDE_ROUTE
} from './confideRoutes.js';
import {
  EMOTION_PHRASES,
  textMatchesAnyPhrase
} from './confideEmotionKeywords.js';
import { matchesAggressionTowardOthers } from './confideAggressionKeywords.js';
import { isPracticeFactsQuestion } from './confidePracticeFacts.js';
import { matchesSafetyRedirect } from './confideSafetyKeywords.js';
import { observeConfideProductAskBlock } from './confideProductAskBlockObserve.js';
import { shouldApplyJapaneseConfideNotYetOpen } from './confideJapaneseNotYetOpen.js';
import {
  isConfideConfirmedProductAsk,
  isConfideProductAskBlocksEmotionLive
} from './confideProductKnowledgeSemantic.js';

/**
 * @param {string} text
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string | null} route id, or null when empty (do not classify)
 */
export function confideClassify(text, env) {
  const raw = typeof text === 'string' ? text : '';
  if (!raw.trim()) return null;

  if (matchesSafetyRedirect(raw)) {
    return CONFIDE_ROUTE.SAFETY_REDIRECT;
  }

  if (matchesAggressionTowardOthers(raw)) {
    return CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS;
  }

  if (shouldApplyJapaneseConfideNotYetOpen(raw, env)) {
    return CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN;
  }

  const blocksEmotion =
    isConfideProductAskBlocksEmotionLive(env) && isConfideConfirmedProductAsk(raw);

  /** @type {string[]} */
  const hits = [];
  const practiceFactsAsk = isPracticeFactsQuestion(raw);
  for (const bucket of CONFIDE_EMOTION_PRIORITY) {
    if (bucket === CONFIDE_ROUTE.TIRED && practiceFactsAsk) continue;
    const phrases = EMOTION_PHRASES[bucket] || [];
    if (textMatchesAnyPhrase(raw, phrases)) hits.push(bucket);
  }

  if (blocksEmotion) {
    if (hits.length > 0) observeConfideProductAskBlock('emotion_demote');
    return CONFIDE_ROUTE.FALLBACK;
  }

  if (hits.length === 0) return CONFIDE_ROUTE.FALLBACK;

  // First in explicit priority list among hits (already iterated in priority order).
  return hits[0];
}

/**
 * Gate for "send" control — empty must not enter classify.
 * @param {string} text
 * @returns {boolean}
 */
export function canSubmitConfideText(text) {
  return typeof text === 'string' && text.trim().length > 0;
}
