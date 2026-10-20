/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Help Center ask-cards retrieval (T22). Retrieve-and-list only — never executes T10 commands.
 * SSOT: docs/task-briefs/task-confide-product-ask-entry-split.md
 */

import { HELP_CENTER_ARTICLES } from './helpCenterCatalog.js';
import { normalizeConfideObjectPhrase } from './confide/confideObjectNormalize.js';
import { catalogKeywordSpeakAllowed } from './confide/confideFactFirstSpeak.js';
import { decideKbNearMatch } from './confide/kbNearMatch.js';
import {
  pickProductKnowledgeHit,
  scoreProductKnowledgeEntries
} from './confide/confideProductKnowledge.js';
import { isConfideOperationalProductAskShape } from './confide/confideProductKnowledgeSemantic.js';
import { resolveVoiceCommandOutcome } from './voiceCommandOutcome.js';

export const HELP_CENTER_ASK_MAX_CARDS = 3;

/**
 * @param {string} kbId
 * @returns {string | null}
 */
export function resolveHelpCenterArticleIdForKbId(kbId) {
  const id = String(kbId || '').trim();
  if (!id) return null;
  const row =
    HELP_CENTER_ARTICLES.find((article) => article.id === id || article.kbTraceId === id) ??
    null;
  return row?.id ?? null;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function normalizeHelpCenterAskText(text) {
  return normalizeConfideObjectPhrase(text);
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isHelpCenterAskQuestionShape(text) {
  const raw = normalizeHelpCenterAskText(text);
  if (!raw) return false;
  if (/[?？]/.test(raw)) return true;
  return isConfideOperationalProductAskShape(raw);
}

/**
 * Imperative / command-shaped input (T22: list cards, never execute).
 * @param {string} text
 * @returns {boolean}
 */
export function isHelpCenterAskImperativeShape(text) {
  const raw = normalizeHelpCenterAskText(text);
  if (!raw) return false;
  if (isHelpCenterAskQuestionShape(raw)) return false;
  const spaced = raw.replace(/\s+/g, ' ').trim();
  const lower = spaced.toLowerCase();
  if (/\b(now|please)\b$/.test(lower)) return true;
  if (/^(back\s*up|backup|restore|start|stop|open|close|export)\b/i.test(spaced)) {
    return true;
  }
  const voice = resolveVoiceCommandOutcome(spaced, { showOpenEnded: true, focusing: false });
  return (
    voice.kind === 'start_fixed' ||
    voice.kind === 'start_open' ||
    voice.kind === 'end_focus' ||
    voice.kind === 'ask_duration'
  );
}

/**
 * T22 hard rule: Help Center ask never runs voice-command execution.
 * @param {string} text
 * @returns {{ shouldExecute: false, shouldSearch: boolean }}
 */
export function resolveHelpCenterAskSubmitPolicy(text) {
  const raw = normalizeHelpCenterAskText(text);
  return {
    shouldExecute: false,
    shouldSearch: raw.length > 0
  };
}

/**
 * @param {string} kbId
 * @param {{
 *   catalogHit?: boolean,
 *   embeddingState?: string,
 *   nearestId?: string | null,
 *   nearestScore?: number | null,
 *   leadMargin?: number | null
 * }} ctx
 * @returns {boolean}
 */
function kbIdAllowedInAskResults(kbId, normalizedText, ctx) {
  const ranked = scoreProductKnowledgeEntries(normalizedText);
  const picked = pickProductKnowledgeHit(normalizedText, ranked);
  if (picked?.id === kbId) return true;
  if (ctx.embeddingState !== 'ready') {
    const row = ranked.find((entry) => entry.id === kbId);
    return Boolean(row && row.score >= 1);
  }
  return catalogKeywordSpeakAllowed({
    catalogHit: true,
    catalogId: kbId,
    embeddingState: ctx.embeddingState,
    nearestId: ctx.nearestId,
    nearestScore: ctx.nearestScore,
    leadMargin: ctx.leadMargin,
    text: normalizedText
  });
}

/**
 * @param {string} text
 * @param {{
 *   embeddingState?: 'ready' | 'not_ready' | 'error',
 *   nearestId?: string | null,
 *   nearestScore?: number | null,
 *   leadMargin?: number | null,
 *   helpNearestId?: string | null,
 *   helpNearestScore?: number | null
 * }} [opts]
 * @returns {{ articleIds: string[], empty: boolean, imperativeShape: boolean }}
 */
export function searchHelpCenterAskCards(text, opts = {}) {
  const normalizedText = normalizeHelpCenterAskText(text);
  const imperativeShape = isHelpCenterAskImperativeShape(normalizedText);
  if (!normalizedText) {
    return { articleIds: [], empty: true, imperativeShape: false };
  }

  const embeddingState = opts.embeddingState || 'not_ready';
  const ctx = {
    normalizedText,
    embeddingState,
    nearestId: opts.nearestId ?? null,
    nearestScore: opts.nearestScore ?? null,
    leadMargin: opts.leadMargin ?? null
  };

  const ranked = scoreProductKnowledgeEntries(normalizedText);
  const topScore = ranked[0]?.score ?? 0;
  /** @type {string[]} */
  const articleIds = [];

  const pushKb = (kbId) => {
    if (!kbId || !kbIdAllowedInAskResults(kbId, normalizedText, ctx)) return;
    const articleId = resolveHelpCenterArticleIdForKbId(kbId);
    if (!articleId || articleIds.includes(articleId)) return;
    articleIds.push(articleId);
  };

  if (embeddingState === 'ready' && ctx.nearestId) {
    const near = decideKbNearMatch({
      nearestId: ctx.nearestId,
      nearestScore: ctx.nearestScore,
      leadMargin: ctx.leadMargin,
      rankMarginConfirm: true
    });
    if (near.action === 'hit') pushKb(ctx.nearestId);
  }

  if (embeddingState === 'ready' && opts.helpNearestId) {
    const helpNear = decideKbNearMatch({
      nearestId: opts.helpNearestId,
      nearestScore: opts.helpNearestScore
    });
    if (helpNear.action === 'hit' && helpNear.id) {
      const exists = HELP_CENTER_ARTICLES.some((row) => row.id === helpNear.id);
      if (exists && !articleIds.includes(helpNear.id)) {
        articleIds.push(helpNear.id);
      }
    }
  }

  for (const row of ranked) {
    if (articleIds.length >= HELP_CENTER_ASK_MAX_CARDS) break;
    if (row.score < 1) continue;
    if (topScore > 0 && row.score < topScore) {
      const margin = topScore - row.score;
      if (margin > 1) continue;
    }
    pushKb(row.id);
  }

  const trimmed = articleIds.slice(0, HELP_CENTER_ASK_MAX_CARDS);
  return {
    articleIds: trimmed,
    empty: trimmed.length === 0,
    imperativeShape
  };
}
