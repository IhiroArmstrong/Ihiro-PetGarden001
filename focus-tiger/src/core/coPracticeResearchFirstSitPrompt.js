/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T83 — Practice Study first-sit positioning invite (Brief + data pack §4.1).
 */

import { hasCoPracticeResearchConsent } from './coPracticeResearchConsent.js';
import { STATES } from './StateManager.js';

export const CO_PRACTICE_RESEARCH_FIRST_SIT_PROMPT_KEY =
  'focus-tiger.co-practice-research-first-sit-prompt.v1';

export const CO_PRACTICE_RESEARCH_FIRST_SIT_COOLDOWN_MS =
  30 * 24 * 60 * 60 * 1000;

export const CO_PRACTICE_RESEARCH_FIRST_SIT_MAX_SHOWS = 2;

/** Locked §4.1 forbidden substrings (R-12 pre-research-product wording). */
export const CO_PRACTICE_RESEARCH_FIRST_SIT_FORBIDDEN_COPY =
  /已证明|诊疗|训练模型|clinical|proven effective|train the model|研究产品|informed by research|科学研究|裏打ち/i;

/**
 * @param {unknown} storage
 * @returns {Storage | null}
 */
function resolveStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} raw
 * @returns {{ showCount: number, lastDismissedAt: string | null, finished: boolean }}
 */
export function normalizeFirstSitPromptState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { showCount: 0, lastDismissedAt: null, finished: false };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const showCount =
    typeof o.showCount === 'number' && o.showCount >= 0
      ? Math.min(CO_PRACTICE_RESEARCH_FIRST_SIT_MAX_SHOWS, Math.floor(o.showCount))
      : 0;
  return {
    showCount,
    lastDismissedAt:
      typeof o.lastDismissedAt === 'string' && o.lastDismissedAt
        ? o.lastDismissedAt
        : null,
    finished: o.finished === true
  };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readFirstSitPromptState(storage) {
  const store = resolveStorage(storage);
  if (!store?.getItem) {
    return normalizeFirstSitPromptState(null);
  }
  try {
    const raw = store.getItem(CO_PRACTICE_RESEARCH_FIRST_SIT_PROMPT_KEY);
    if (!raw) return normalizeFirstSitPromptState(null);
    return normalizeFirstSitPromptState(JSON.parse(raw));
  } catch {
    return normalizeFirstSitPromptState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {ReturnType<typeof normalizeFirstSitPromptState>} next
 */
function writeFirstSitPromptState(storage, next) {
  const store = resolveStorage(storage);
  if (!store?.setItem) return false;
  try {
    store.setItem(
      CO_PRACTICE_RESEARCH_FIRST_SIT_PROMPT_KEY,
      JSON.stringify(next)
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * User chose Learn — open T82; never auto-prompt again.
 * @param {Storage | null | undefined} storage
 */
export function recordFirstSitPromptLearn(storage) {
  const prev = readFirstSitPromptState(storage);
  return writeFirstSitPromptState(storage, {
    ...prev,
    showCount: CO_PRACTICE_RESEARCH_FIRST_SIT_MAX_SHOWS,
    finished: true
  });
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [nowMs]
 */
export function recordFirstSitPromptDismiss(storage, nowMs = Date.now()) {
  const prev = readFirstSitPromptState(storage);
  const showCount = Math.min(
    CO_PRACTICE_RESEARCH_FIRST_SIT_MAX_SHOWS,
    prev.showCount + 1
  );
  return writeFirstSitPromptState(storage, {
    showCount,
    lastDismissedAt: new Date(nowMs).toISOString(),
    finished: showCount >= CO_PRACTICE_RESEARCH_FIRST_SIT_MAX_SHOWS
  });
}

/**
 * @typedef {{ shouldShow: boolean, reason?: string }} FirstSitPromptCandidate
 */

/**
 * @param {object} [input]
 * @param {number} [input.nowMs]
 * @param {Storage | null} [input.storage]
 * @param {boolean} [input.hasQualifiedPractice]
 * @param {boolean} [input.focusing]
 * @param {boolean} [input.sessionBusy]
 * @param {boolean} [input.inviteVisible]
 * @param {boolean} [input.coldStartGoalOpen]
 * @param {boolean} [input.postSessionOverlayActive]
 * @param {boolean} [input.completionPending]
 * @param {string} [input.sessionState]
 */
export function evaluateCoPracticeResearchFirstSitPrompt(input = {}) {
  const storage = resolveStorage(input.storage);
  if (hasCoPracticeResearchConsent(storage)) {
    return { shouldShow: false, reason: 'already-enrolled' };
  }

  const prompt = readFirstSitPromptState(storage);
  if (prompt.finished || prompt.showCount >= CO_PRACTICE_RESEARCH_FIRST_SIT_MAX_SHOWS) {
    return { shouldShow: false, reason: 'cap-reached' };
  }

  if (input.hasQualifiedPractice !== true) {
    return { shouldShow: false, reason: 'no-qualified-practice' };
  }

  if (input.focusing === true) {
    return { shouldShow: false, reason: 'focusing' };
  }
  if (input.sessionState === STATES.CELEBRATE) {
    return { shouldShow: false, reason: 'celebrate' };
  }
  if (input.completionPending === true) {
    return { shouldShow: false, reason: 'completion-pending' };
  }
  if (input.postSessionOverlayActive === true) {
    return { shouldShow: false, reason: 'post-session' };
  }
  if (input.sessionBusy === true) {
    return { shouldShow: false, reason: 'session-busy' };
  }
  if (input.coldStartGoalOpen === true) {
    return { shouldShow: false, reason: 'cold-start-goal' };
  }
  if (input.inviteVisible === true) {
    return { shouldShow: false, reason: 'already-visible' };
  }

  const nowMs = Number(input.nowMs) || Date.now();
  if (
    prompt.showCount >= 1 &&
    prompt.lastDismissedAt &&
    nowMs - Date.parse(prompt.lastDismissedAt) <
      CO_PRACTICE_RESEARCH_FIRST_SIT_COOLDOWN_MS
  ) {
    return { shouldShow: false, reason: 'cooldown' };
  }

  return { shouldShow: true };
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function firstSitPromptCopyContainsForbidden(text) {
  return CO_PRACTICE_RESEARCH_FIRST_SIT_FORBIDDEN_COPY.test(String(text || ''));
}
