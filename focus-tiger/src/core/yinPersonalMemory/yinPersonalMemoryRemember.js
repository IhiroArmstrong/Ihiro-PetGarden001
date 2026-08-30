/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personal Memory · Remember pipeline (Slice 1b).
 * SSOT: docs/YIN_PERSONAL_MEMORY.md §4, §6, §8.
 * Silent on failure — no UI toast.
 */

import { CONFIDE_EMOTION_BUCKETS, CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { shouldAnswerWithPracticeFacts } from '../confide/confidePracticeFacts.js';
import { canRememberYinPersonalMemory } from './yinPersonalMemoryConsent.js';
import { normalizeYinPersonalMemoryState } from './yinPersonalMemorySchema.js';
import {
  appendRememberOptOut,
  buildConfideTurnId,
  isInlineMemorySuppressIntent,
  isRememberSuppressedForTurn,
  stripMemorySuppressPhrases
} from './yinPersonalMemorySuppress.js';

export const YIN_MEMORY_SOURCE_ROUTE = Object.freeze({
  CONFIDE_FALLBACK: 'confide_fallback',
  SYSTEM_SESSION_FACT: 'system_session_fact'
});

const ALLOWED_SOURCE_ROUTES = new Set(Object.values(YIN_MEMORY_SOURCE_ROUTE));

/** @returns {string} */
function createYinMemoryId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `yin-mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

const FORBIDDEN_EXTRACT_PATTERNS = [
  /\b(suicid|kill myself|end my life|don't want to live|want to die)\b/i,
  /\b(depress(ed|ion)?|bipolar|adhd|autism|disorder|ptsd|ocd|schizo)\b/i,
  /\b(therapy|therapist|diagnos(ed|is)?|medication|prescri)\b/i
];

/** @typedef {{ ruleId: string, kind: import('./yinPersonalMemorySchema.js').YinMemoryKind, summary: string, evidence: string, sourceRoute: string }} YinMemoryRememberCandidate */

/**
 * @param {string} route
 * @returns {boolean}
 */
export function isRememberBlockedConfideRoute(route) {
  if (!route || route === CONFIDE_ROUTE.SAFETY_REDIRECT) return true;
  if (CONFIDE_EMOTION_BUCKETS.includes(route)) return true;
  return false;
}

/**
 * @param {string} userText
 * @returns {boolean}
 */
export function containsForbiddenRememberExtractText(userText) {
  const text = typeof userText === 'string' ? userText.trim() : '';
  if (!text) return true;
  return FORBIDDEN_EXTRACT_PATTERNS.some((re) => re.test(text));
}

/**
 * @param {{
 *   userText: string,
 *   route: string,
 *   replySource: string,
 *   consentGranted?: boolean
 * }} opts
 * @returns {boolean}
 */
export function canRememberFromConfideTurn({
  userText,
  route,
  replySource,
  consentGranted = false
} = {}) {
  if (!consentGranted) return false;
  if (replySource !== 'generate') return false;
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  if (isRememberBlockedConfideRoute(route)) return false;
  if (shouldAnswerWithPracticeFacts(route, userText)) return false;
  if (containsForbiddenRememberExtractText(userText)) return false;
  return true;
}

/**
 * @param {string} userText
 * @returns {null | { ruleId: string, kind: import('./yinPersonalMemorySchema.js').YinMemoryKind, summary: string }}
 */
export function matchYinMemoryRememberRule(userText) {
  const text = stripMemorySuppressPhrases(typeof userText === 'string' ? userText : '');
  if (!text || containsForbiddenRememberExtractText(text)) return null;

  if (
    /\b(don't|do not|please don't|rather not)\b.+\b(advice|fix(?:es|ing)?|solutions?|tell me what to do)\b/i.test(
      text
    ) ||
    /\b(no advice|without advice|not looking for advice)\b/i.test(text)
  ) {
    return {
      ruleId: 'relationship-no-advice',
      kind: 'relationship',
      summary: 'You like when Yin does not jump to advice.'
    };
  }

  if (
    /\b(prefer|like|want|need|love)\b.+\b(quiet|short|gentle|simple|soft|brief)\b/i.test(text) ||
    /\b(keep it|stay)\b.+\b(quiet|short|gentle|simple|soft|brief)\b/i.test(text)
  ) {
    return {
      ruleId: 'preference-quiet-short',
      kind: 'preference',
      summary: 'You prefer quiet, short reflections.'
    };
  }

  if (/\bmonday(s)?\b/i.test(text)) {
    if (/\b(hard|tough|crowded|heavy|rough|stress(ed|ful)?|overwhelm)\b/i.test(text)) {
      return {
        ruleId: 'pattern-monday-crowded',
        kind: 'pattern',
        summary: 'Mondays have often felt crowded for you.'
      };
    }
    return {
      ruleId: 'pattern-monday',
      kind: 'pattern',
      summary: 'Mondays have come up when you check in.'
    };
  }

  return null;
}

/**
 * @param {{
 *   userText: string,
 *   route: string,
 *   replySource: string,
 *   turnOrdinal?: number,
 *   nowIso?: string
 * }} opts
 * @returns {YinMemoryRememberCandidate | null}
 */
export function proposeYinMemoryFromConfideTurn({
  userText,
  route,
  replySource,
  turnOrdinal = 0,
  nowIso = new Date().toISOString()
} = {}) {
  if (!canRememberFromConfideTurn({ userText, route, replySource, consentGranted: true })) {
    return null;
  }
  const rule = matchYinMemoryRememberRule(userText);
  if (!rule) return null;
  const ordinal = Number.isFinite(turnOrdinal) && turnOrdinal >= 0 ? Math.floor(turnOrdinal) : 0;
  return {
    ruleId: rule.ruleId,
    kind: rule.kind,
    summary: rule.summary,
    evidence: `confide:turn:${ordinal}`,
    sourceRoute: YIN_MEMORY_SOURCE_ROUTE.CONFIDE_FALLBACK
  };
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinMemoryConfidence} current
 * @returns {import('./yinPersonalMemorySchema.js').YinMemoryConfidence}
 */
function bumpConfidence(current) {
  if (current === 'high') return 'high';
  if (current === 'medium') return 'high';
  return 'medium';
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} state
 * @param {YinMemoryRememberCandidate} candidate
 * @param {string} [nowIso]
 * @returns {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState}
 */
export function applyYinMemoryRemember(state, candidate, nowIso = new Date().toISOString()) {
  const base = normalizeYinPersonalMemoryState(state);
  if (!canRememberYinPersonalMemory(base)) return base;
  if (!candidate || !ALLOWED_SOURCE_ROUTES.has(candidate.sourceRoute)) return base;

  const ruleTag = `rule:${candidate.ruleId}`;
  const memories = base.memories.map((row) => ({ ...row }));
  const existingIdx = memories.findIndex(
    (row) =>
      row.status === 'active' &&
      row.kind === candidate.kind &&
      (row.evidence.startsWith(ruleTag) || row.summary === candidate.summary)
  );

  if (existingIdx >= 0) {
    const prev = memories[existingIdx];
    memories[existingIdx] = {
      ...prev,
      summary: candidate.summary,
      evidence: `${ruleTag};${candidate.evidence}`,
      confidence: bumpConfidence(prev.confidence),
      lastSeenAt: nowIso
    };
    return { ...base, memories };
  }

  memories.push({
    id: createYinMemoryId(),
    kind: candidate.kind,
    summary: candidate.summary,
    evidence: `${ruleTag};${candidate.evidence}`,
    confidence: 'low',
    firstSeenAt: nowIso,
    lastSeenAt: nowIso,
    status: 'active',
    sourceRoute: candidate.sourceRoute
  });

  return { ...base, memories };
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} state
 * @param {{
 *   userText: string,
 *   route: string,
 *   replySource: string,
 *   turnOrdinal?: number,
 *   nowIso?: string
 * }} payload
 * @returns {{ state: import('./yinPersonalMemorySchema.js').YinPersonalMemoryState, remembered: boolean }}
 */
export function rememberFromConfideTurn(state, payload) {
  const base = normalizeYinPersonalMemoryState(state);
  if (!canRememberYinPersonalMemory(base)) {
    return { state: base, remembered: false };
  }
  const turnOrdinal =
    Number.isFinite(payload?.turnOrdinal) && payload.turnOrdinal >= 0
      ? Math.floor(payload.turnOrdinal)
      : 0;
  if (isRememberSuppressedForTurn(base, turnOrdinal)) {
    return { state: base, remembered: false };
  }
  const userText = typeof payload?.userText === 'string' ? payload.userText : '';
  if (isInlineMemorySuppressIntent(userText)) {
    const next = appendRememberOptOut(base, {
      turnId: buildConfideTurnId(turnOrdinal),
      scope: 'turn',
      at: typeof payload?.nowIso === 'string' ? payload.nowIso : new Date().toISOString()
    });
    return { state: next, remembered: false };
  }
  const candidate = proposeYinMemoryFromConfideTurn(payload);
  if (!candidate) {
    return { state: base, remembered: false };
  }
  const next = applyYinMemoryRemember(base, candidate, payload?.nowIso);
  const remembered = next.memories.length > base.memories.length || next.memories.some((row, i) => {
    const prev = base.memories[i];
    return prev && row.lastSeenAt !== prev.lastSeenAt;
  });
  return { state: next, remembered: Boolean(remembered) };
}
