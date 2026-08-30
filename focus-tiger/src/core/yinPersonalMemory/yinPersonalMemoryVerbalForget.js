/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personal Memory · verbal Forget routing (Slice 1e).
 * SSOT: task-yin-memory-slice-1e-verbal-forget.md · CONFIDE_EXECUTABLE_INTENTS.md
 * Pre-L3 only; never calls Qwen. Reuses 1d theme overlap for target pick.
 */

import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { canRememberYinPersonalMemory } from './yinPersonalMemoryConsent.js';
import { listActiveYinMemories } from './yinPersonalMemoryForget.js';
import { isYinMemoryThemeRelatedToUserText } from './yinPersonalMemoryRetrieve.js';
import { normalizeYinPersonalMemoryState } from './yinPersonalMemorySchema.js';
import {
  isInlineMemorySuppressIntent,
  isPostRecallMemorySuppressIntent
} from './yinPersonalMemorySuppress.js';

const CONFIDENCE_RANK = Object.freeze({ high: 2, medium: 1, low: 0 });

/** @type {readonly RegExp[]} */
const VERBAL_FORGET_INTENT_RES = Object.freeze([
  /\b(?:please\s+)?forget\s+(?:what\s+i\s+said\b|about\b)/i,
  /\bstop\s+remembering\b/i,
  /别再记/,
  /不要记住/,
  /别再记录/,
  /别再记住/
]);

/** @type {readonly RegExp[]} */
const BULK_VERBAL_FORGET_RES = Object.freeze([
  /\b(?:forget|erase|delete)\s+(?:everything|all(?:\s+of\s+it)?|it\s+all)\b/i,
  /忘掉你记得的一切/,
  /(?:全部|都).*(?:忘掉|忘记|别再记)/
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isBulkVerbalForgetIntent(text) {
  const raw = typeof text === 'string' ? text.trim() : '';
  if (!raw) return false;
  return BULK_VERBAL_FORGET_RES.some((re) => re.test(raw));
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isVerbalForgetIntent(text) {
  const raw = typeof text === 'string' ? text.trim() : '';
  if (!raw) return false;
  return VERBAL_FORGET_INTENT_RES.some((re) => re.test(raw));
}

/**
 * @param {{
 *   route?: string | null,
 *   state?: import('./yinPersonalMemorySchema.js').YinPersonalMemoryState | null,
 *   text?: string,
 *   hasBridge?: boolean
 * }} opts
 * @returns {boolean}
 */
export function shouldHandleVerbalForget({
  route = null,
  state = null,
  text = '',
  hasBridge = false
} = {}) {
  if (!hasBridge) return false;
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  const normalized = normalizeYinPersonalMemoryState(state);
  if (!canRememberYinPersonalMemory(normalized)) return false;
  const raw = typeof text === 'string' ? text.trim() : '';
  if (!raw) return false;
  if (isBulkVerbalForgetIntent(raw)) return true;
  if (isPostRecallMemorySuppressIntent(raw) || isInlineMemorySuppressIntent(raw)) return false;
  return isVerbalForgetIntent(raw);
}

/**
 * @typedef {'forgotten' | 'no_match' | 'ambiguous' | 'bulk_rejected'} VerbalForgetOutcome
 */

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState | null | undefined} state
 * @param {string} userText
 * @returns {{
 *   outcome: VerbalForgetOutcome,
 *   memoryId?: string,
 *   summary?: string
 * } | null}
 */
export function resolveVerbalForgetTarget(state, userText) {
  const raw = typeof userText === 'string' ? userText.trim() : '';
  if (!raw) return null;
  if (isBulkVerbalForgetIntent(raw)) {
    return { outcome: 'bulk_rejected' };
  }
  if (!isVerbalForgetIntent(raw)) return null;
  if (isPostRecallMemorySuppressIntent(raw) || isInlineMemorySuppressIntent(raw)) return null;

  const normalized = normalizeYinPersonalMemoryState(state);
  if (!canRememberYinPersonalMemory(normalized)) return null;

  const matches = listActiveYinMemories(normalized).filter((entry) =>
    isYinMemoryThemeRelatedToUserText(entry, raw)
  );
  if (!matches.length) return { outcome: 'no_match' };

  const scored = matches
    .map((entry) => ({
      entry,
      rank: CONFIDENCE_RANK[entry.confidence] ?? 0,
      lastSeenAt: String(entry.lastSeenAt || '')
    }))
    .sort((a, b) => {
      const rankDiff = b.rank - a.rank;
      if (rankDiff !== 0) return rankDiff;
      return b.lastSeenAt.localeCompare(a.lastSeenAt);
    });

  const top = scored[0];
  const tied = scored.filter(
    (row) => row.rank === top.rank && row.lastSeenAt === top.lastSeenAt
  );
  if (tied.length > 1) return { outcome: 'ambiguous' };

  const summary =
    typeof top.entry.summary === 'string' ? top.entry.summary.trim() : '';
  return {
    outcome: 'forgotten',
    memoryId: top.entry.id,
    summary
  };
}

/**
 * @param {VerbalForgetOutcome} outcome
 * @param {string} [summary]
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatVerbalForgetReply(outcome, summary, tFn) {
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  switch (outcome) {
    case 'forgotten':
      if (summary) {
        return t('YIN_MEMORY_VERBAL_FORGET_OK').replaceAll('{summary}', summary);
      }
      return t('YIN_MEMORY_VERBAL_FORGET_OK_GENERIC');
    case 'ambiguous':
      return t('YIN_MEMORY_VERBAL_FORGET_AMBIGUOUS');
    case 'bulk_rejected':
      return t('YIN_MEMORY_VERBAL_FORGET_BULK');
    case 'no_match':
    default:
      return t('YIN_MEMORY_VERBAL_FORGET_NO_MATCH');
  }
}
