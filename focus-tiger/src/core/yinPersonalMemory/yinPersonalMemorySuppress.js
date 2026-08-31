/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personal Memory · Don't save this / memory suppress (Slice 1f).
 * SSOT: docs/YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md
 * Pipeline-only — not a CI registry entry. CI-01 verbal Forget stays separate.
 */

import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { forgetYinPersonalMemory, listActiveYinMemories } from './yinPersonalMemoryForget.js';
import { normalizeYinPersonalMemoryState } from './yinPersonalMemorySchema.js';

/** @typedef {'turn' | 'session'} YinRememberOptOutScope */

/** @typedef {'suppressed' | 'turn_opt_out' | 'no_match'} MemorySuppressOutcome */

function normalizeMemorySuppressText(text) {
  return String(text || '')
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .trim();
}

/** @type {readonly RegExp[]} */
const INLINE_MEMORY_SUPPRESS_RES = Object.freeze([
  /\bdon'?t\s+(?:save|remember|keep)\s+(?:this|that)(?:\s+one)?\b/i,
  /\bdo not\s+(?:save|remember|keep)\s+(?:this|that)(?:\s+one)?\b/i,
  /别记这句/,
  /不要记这句/,
  /这句话别记住/,
  /别记下这一条/,
  /不要留着这句/
]);

/** @type {readonly RegExp[]} */
const POST_RECALL_MEMORY_SUPPRESS_RES = Object.freeze([
  /\bforget\s+(?:this|that|it)\b(?!\s+about\b)/i,
  /\b(?:don'?t|do not)\s+(?:save|remember|keep)\s+(?:this|that|it)(?:\s+one)?\b/i,
  /忘掉刚才那句/,
  /刚才那句别记/,
  /刚才说的别记/
]);

/**
 * @param {number} turnOrdinal
 * @returns {string}
 */
export function buildConfideTurnId(turnOrdinal) {
  const ordinal = Number.isFinite(turnOrdinal) && turnOrdinal >= 0 ? Math.floor(turnOrdinal) : 0;
  return `confide:turn:${ordinal}`;
}

/**
 * @param {unknown} raw
 * @returns {{ turnId: string, scope: YinRememberOptOutScope, at: string } | null}
 */
export function normalizeRememberOptOut(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const turnId = typeof o.turnId === 'string' && o.turnId.trim() ? o.turnId.trim() : null;
  const scope = o.scope === 'session' ? 'session' : o.scope === 'turn' ? 'turn' : null;
  const at = typeof o.at === 'string' && o.at ? o.at : null;
  if (!turnId || !scope || !at) return null;
  return { turnId, scope, at };
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isInlineMemorySuppressIntent(text) {
  const raw = normalizeMemorySuppressText(text);
  if (!raw) return false;
  return INLINE_MEMORY_SUPPRESS_RES.some((re) => re.test(raw));
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isPostRecallMemorySuppressIntent(text) {
  const raw = normalizeMemorySuppressText(text);
  if (!raw) return false;
  return POST_RECALL_MEMORY_SUPPRESS_RES.some((re) => re.test(raw));
}

/**
 * Standalone opt-out utterance with no substantive Confide content left after stripping.
 * @param {string} text
 * @returns {boolean}
 */
export function isMemorySuppressStandaloneIntent(text) {
  const raw = normalizeMemorySuppressText(text);
  if (!raw) return false;
  if (!isInlineMemorySuppressIntent(raw) && !isPostRecallMemorySuppressIntent(raw)) {
    return false;
  }
  return stripMemorySuppressPhrases(raw).length < 8;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function stripMemorySuppressPhrases(text) {
  let next = normalizeMemorySuppressText(text);
  if (!next) return '';
  for (const re of [...INLINE_MEMORY_SUPPRESS_RES, ...POST_RECALL_MEMORY_SUPPRESS_RES]) {
    next = next.replace(re, ' ').replace(/\s+/g, ' ').trim();
  }
  return next.replace(/^[\s,.;:!?-]+|[\s,.;:!?-]+$/g, '').trim();
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} state
 * @param {number} turnOrdinal
 * @returns {boolean}
 */
export function isRememberSuppressedForTurn(state, turnOrdinal) {
  const normalized = normalizeYinPersonalMemoryState(state);
  const turnId = buildConfideTurnId(turnOrdinal);
  return normalized.rememberOptOuts.some(
    (row) => row.turnId === turnId && (row.scope === 'turn' || row.scope === 'session')
  );
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} state
 * @param {{ turnId: string, scope?: YinRememberOptOutScope, at?: string }} payload
 * @returns {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState}
 */
export function appendRememberOptOut(state, payload) {
  const base = normalizeYinPersonalMemoryState(state);
  const turnId = typeof payload?.turnId === 'string' ? payload.turnId.trim() : '';
  if (!turnId) return base;
  const scope = payload?.scope === 'session' ? 'session' : 'turn';
  const at = typeof payload?.at === 'string' && payload.at ? payload.at : new Date().toISOString();
  if (base.rememberOptOuts.some((row) => row.turnId === turnId && row.scope === scope)) {
    return base;
  }
  return {
    ...base,
    rememberOptOuts: [...base.rememberOptOuts, { turnId, scope, at }]
  };
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} state
 * @param {number} turnOrdinal
 * @returns {import('./yinPersonalMemorySchema.js').YinMemoryEntry[]}
 */
export function findActiveMemoriesForConfideTurn(state, turnOrdinal) {
  const normalized = normalizeYinPersonalMemoryState(state);
  const tag = buildConfideTurnId(turnOrdinal);
  return listActiveYinMemories(normalized).filter((entry) =>
    String(entry.evidence || '').includes(tag)
  );
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} state
 * @param {{
 *   previousTurnOrdinal: number,
 *   currentTurnOrdinal: number,
 *   nowIso?: string
 * }} payload
 * @returns {{
 *   state: import('./yinPersonalMemorySchema.js').YinPersonalMemoryState,
 *   outcome: MemorySuppressOutcome,
 *   removedSummaries: string[]
 * }}
 */
export function applyPostRecallMemorySuppress(state, payload) {
  const base = normalizeYinPersonalMemoryState(state);
  const previousTurnOrdinal =
    Number.isFinite(payload?.previousTurnOrdinal) && payload.previousTurnOrdinal >= 0
      ? Math.floor(payload.previousTurnOrdinal)
      : -1;
  const currentTurnOrdinal =
    Number.isFinite(payload?.currentTurnOrdinal) && payload.currentTurnOrdinal >= 0
      ? Math.floor(payload.currentTurnOrdinal)
      : 0;
  const nowIso =
    typeof payload?.nowIso === 'string' && payload.nowIso ? payload.nowIso : new Date().toISOString();

  let next = appendRememberOptOut(base, {
    turnId: buildConfideTurnId(currentTurnOrdinal),
    scope: 'turn',
    at: nowIso
  });

  if (previousTurnOrdinal < 0) {
    return { state: next, outcome: 'no_match', removedSummaries: [] };
  }

  const targets = findActiveMemoriesForConfideTurn(base, previousTurnOrdinal);
  if (!targets.length) {
    return { state: next, outcome: 'no_match', removedSummaries: [] };
  }

  const removedSummaries = [];
  for (const entry of targets) {
    const result = forgetYinPersonalMemory(next, entry.id);
    next = result.state;
    if (result.forgotten && entry.summary) removedSummaries.push(entry.summary);
  }

  return {
    state: next,
    outcome: 'suppressed',
    removedSummaries
  };
}

/**
 * @param {{
 *   route?: string | null,
 *   state?: import('./yinPersonalMemorySchema.js').YinPersonalMemoryState | null,
 *   text?: string,
 *   hasBridge?: boolean,
 *   turnOrdinal?: number
 * }} opts
 * @returns {boolean}
 */
export function shouldHandlePostRecallMemorySuppress({
  route = null,
  state = null,
  text = '',
  hasBridge = false,
  turnOrdinal = 0
} = {}) {
  if (!hasBridge) return false;
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  const raw = normalizeMemorySuppressText(text);
  if (!raw) return false;
  if (!isPostRecallMemorySuppressIntent(raw)) return false;
  return turnOrdinal > 0;
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
export function shouldHandleStandaloneMemorySuppress({
  route = null,
  state = null,
  text = '',
  hasBridge = false,
  turnOrdinal = 0
} = {}) {
  if (!hasBridge) return false;
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  const raw = normalizeMemorySuppressText(text);
  if (!raw) return false;
  if (!isMemorySuppressStandaloneIntent(raw)) return false;
  // Overlap: "Don't keep this" also matches post-recall. Prefer post-recall
  // only when there is a prior turn; otherwise still take the suppress path.
  if (isPostRecallMemorySuppressIntent(raw) && turnOrdinal > 0) return false;
  return true;
}

/**
 * @param {MemorySuppressOutcome} outcome
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatMemorySuppressReply(outcome, tFn) {
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  switch (outcome) {
    case 'suppressed':
      return t('YIN_MEMORY_SUPPRESS_RECALLED');
    case 'turn_opt_out':
      return t('YIN_MEMORY_SUPPRESS_TURN');
    case 'no_match':
    default:
      return t('YIN_MEMORY_SUPPRESS_NO_MATCH');
  }
}
