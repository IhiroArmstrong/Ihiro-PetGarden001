/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Reflection Companion · validation prototype (lab flag only · NOT shipping).
 * PO: LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md · V3 validation only.
 */

import {
  canRegisterDesktopCompanionGeneration,
  getDesktopCompanionBridge,
  isDesktopCompanionViewportAllowed
} from './desktopCompanionGate.js';
import { companionGenerateEnabled } from './desktopCompanionL2Route.js';
import { pickConfideLine, confideLineText } from './confide/confideCorpus.js';
import { CONFIDE_ROUTE } from './confide/confideRoutes.js';
import { matchesSafetyRedirect } from './confide/confideSafetyKeywords.js';
import { REFLECTION_ANSWER_FIELDS } from '../ui/ReflectionFlowState.js';

export const REFLECTION_COMPANION_LAB_PARAM = 'reflectionCompanion';

/**
 * QA / validation harness (?reflectionCompanion=1). NOT product ship.
 * @param {string} [search]
 * @returns {boolean}
 */
export function isReflectionCompanionLabEnabled(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    return new URLSearchParams(q).get(REFLECTION_COMPANION_LAB_PARAM) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Record<string, string>} answers
 * @returns {boolean}
 */
export function reflectionAnswersHaveContent(answers = {}) {
  return REFLECTION_ANSWER_FIELDS.some((field) => {
    const text = answers[field];
    return typeof text === 'string' && text.trim().length > 0;
  });
}

/**
 * @param {object} [opts]
 * @param {string} [opts.search]
 * @param {number} [opts.widthPx]
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function canOfferReflectionCompanionValidation(
  { search = '', widthPx = 0 } = {},
  globalObj = globalThis
) {
  if (!isReflectionCompanionLabEnabled(search)) return false;
  const bridge = getDesktopCompanionBridge(globalObj);
  if (
    !canRegisterDesktopCompanionGeneration({
      hasBridge: Boolean(bridge),
      widthPx
    })
  ) {
    return false;
  }
  return true;
}

/**
 * @param {{ phase?: string, focusing?: boolean } | null | undefined} status
 * @param {object} [opts]
 * @param {string} [opts.search]
 * @param {number} [opts.widthPx]
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function reflectionCompanionGenerateReady(
  status,
  { search = '', widthPx = 0 } = {},
  globalObj = globalThis
) {
  if (!canOfferReflectionCompanionValidation({ search, widthPx }, globalObj)) {
    return false;
  }
  return companionGenerateEnabled(status, true);
}

/**
 * Flatten reflection answers for the validation generate payload.
 * @param {Record<string, string>} answers
 * @returns {string}
 */
export function formatReflectionCompanionAnswers(answers = {}) {
  const lines = [];
  for (const field of REFLECTION_ANSWER_FIELDS) {
    const text = typeof answers[field] === 'string' ? answers[field].trim() : '';
    if (!text) continue;
    lines.push(`${field}: ${text}`);
  }
  return lines.join('\n');
}

export const REFLECTION_COMPANION_GENERATE_PURPOSE = 'reflection_companion';

export const REFLECTION_COMPANION_SOURCE = Object.freeze({
  GENERATE: 'generate',
  CORPUS_SAFETY: 'corpus_safety',
  CORPUS_FALLBACK: 'corpus_fallback'
});

/**
 * V5: crisis phrases in this session's answers must not go to generate.
 * @param {Record<string, string>} [answers]
 * @returns {boolean}
 */
export function reflectionAnswersMatchSafety(answers = {}) {
  return REFLECTION_ANSWER_FIELDS.some((field) => {
    const text = answers[field];
    return typeof text === 'string' && matchesSafetyRedirect(text);
  });
}

/**
 * @param {{ safety?: boolean, locale?: string }} [opts]
 * @returns {string}
 */
export function pickReflectionCompanionCorpusText({
  safety = false,
  locale = 'en'
} = {}) {
  const route = safety
    ? CONFIDE_ROUTE.SAFETY_REDIRECT
    : CONFIDE_ROUTE.FALLBACK;
  const line = pickConfideLine({ route, localDate: '', salt: 0 });
  return confideLineText(line, locale);
}

/**
 * @param {{
 *   answers?: Record<string, string>,
 *   locale?: string,
 *   generateReady?: boolean,
 *   generateResult?: { ok?: boolean, text?: string } | null
 * }} [opts]
 * @returns {{ source: string, text: string, skipGenerate: boolean }}
 */
export function resolveReflectionCompanionObservation({
  answers = {},
  locale = 'en',
  generateReady = false,
  generateResult = null
} = {}) {
  if (reflectionAnswersMatchSafety(answers)) {
    return {
      source: REFLECTION_COMPANION_SOURCE.CORPUS_SAFETY,
      text: pickReflectionCompanionCorpusText({ safety: true, locale }),
      skipGenerate: true
    };
  }
  if (
    generateReady &&
    generateResult?.ok &&
    typeof generateResult.text === 'string' &&
    generateResult.text.trim()
  ) {
    return {
      source: REFLECTION_COMPANION_SOURCE.GENERATE,
      text: generateResult.text.trim(),
      skipGenerate: false
    };
  }
  return {
    source: REFLECTION_COMPANION_SOURCE.CORPUS_FALLBACK,
    text: pickReflectionCompanionCorpusText({ safety: false, locale }),
    skipGenerate: !generateReady
  };
}
