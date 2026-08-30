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
