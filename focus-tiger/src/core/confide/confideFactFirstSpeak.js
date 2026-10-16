/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * CR-50 send-chain: speak only a card that answers this ask; else Help excerpt;
 * device records never generate.
 */

import {
  getRetrievableProductKnowledgeEntry,
  productKnowledgeReplyPassesGuard
} from './confideProductKnowledge.js';
import { resolveProductKnowledgeGateAction } from './confideProductKnowledgeSemantic.js';
import {
  CONFIDE_RECORD_INTENT_KIND,
  decideConfideRecordIntent
} from './confideRecordIntent.js';
import { decideHelpCenterExcerpt } from './confideHelpCenterExcerpt.js';
import { decideKbNearMatch } from './kbNearMatch.js';

/**
 * Literal catalog hits share the near-match door (CR-50).
 * @param {{
 *   catalogHit?: boolean,
 *   catalogId?: string,
 *   embeddingState?: string,
 *   nearestId?: string | null,
 *   nearestScore?: number | null,
 *   text?: string,
 *   entry?: object | null
 * }} input
 * @returns {boolean}
 */
export function catalogKeywordSpeakAllowed(input) {
  if (!input?.catalogHit || !input.catalogId) return false;
  // Shape-axis work is CR-49, not this knife. Without embeddings, keyword
  // remain; with embeddings the near-match id is the fact door (CR-50).
  if (input.embeddingState !== 'ready') return true;
  const near = decideKbNearMatch({
    nearestId: input.nearestId,
    nearestScore: input.nearestScore
  });
  return near.action === 'hit' && near.id === input.catalogId;
}

/**
 * @param {{
 *   text: string,
 *   catalogResult: { hit?: boolean, id?: string, text?: string },
 *   embeddingState: 'ready' | 'not_ready' | 'error',
 *   semanticIsProduct?: boolean,
 *   nearestId?: string | null,
 *   nearestScore?: number | null,
 *   helpNearestId?: string | null,
 *   helpNearestScore?: number | null,
 *   recordKind?: string | null,
 *   recordScore?: number | null,
 *   lifeOutranksProduct?: boolean,
 *   moodOutranksProduct?: boolean | null,
 *   moodVetoLive?: boolean
 * }} input
 * @returns {{
 *   action: 'practice_facts' | 'product_knowledge' | 'help_center_excerpt' | 'honesty' | 'skip',
 *   id?: string | null,
 *   text?: string | null,
 *   nearAction?: string | null
 * }}
 */
export function resolveConfideFactFirstSpeak(input) {
  const record = decideConfideRecordIntent({
    kind: input.recordKind,
    score: input.recordScore
  });
  if (record === CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD) {
    return { action: 'practice_facts' };
  }

  let nearAction = null;
  let nearId = null;
  if (input.embeddingState === 'ready') {
    const near = decideKbNearMatch({
      nearestId: input.nearestId,
      nearestScore: input.nearestScore
    });
    nearAction = near.action;
    if (near.action === 'hit') nearId = near.id;
  }

  const catalog = input.catalogResult || {};
  const keywordEntry = catalog.hit
    ? getRetrievableProductKnowledgeEntry(catalog.id)
    : null;
  const keywordOk = catalogKeywordSpeakAllowed({
    catalogHit: Boolean(catalog.hit),
    catalogId: catalog.id,
    embeddingState: input.embeddingState,
    nearestId: input.nearestId,
    nearestScore: input.nearestScore,
    text: input.text,
    entry: keywordEntry
  });

  const shownId = nearId || (keywordOk ? catalog.id : null);
  const gateAction = resolveProductKnowledgeGateAction({
    text: input.text,
    embeddingState: input.embeddingState,
    semanticIsProduct: input.semanticIsProduct,
    catalogHit: Boolean(shownId),
    nearAction,
    lifeOutranksProduct: input.lifeOutranksProduct,
    moodOutranksProduct: input.moodOutranksProduct,
    moodVetoLive: input.moodVetoLive
  });

  if (gateAction === 'hit' && shownId) {
    const entry = getRetrievableProductKnowledgeEntry(shownId);
    const spokenText =
      shownId === catalog.id && catalog.text
        ? catalog.text
        : entry?.shortAnswerEn;
    if (spokenText && productKnowledgeReplyPassesGuard(spokenText)) {
      return {
        action: 'product_knowledge',
        id: shownId,
        text: spokenText,
        nearAction
      };
    }
  }

  const help = decideHelpCenterExcerpt({
    nearestId: input.helpNearestId,
    nearestScore: input.helpNearestScore
  });
  if (help.action === 'hit' && help.id) {
    return { action: 'help_center_excerpt', id: help.id, nearAction };
  }

  if (record === CONFIDE_RECORD_INTENT_KIND.DESIGN_DURATION) {
    return { action: 'skip', nearAction };
  }

  if (gateAction === 'honesty') {
    return { action: 'honesty', nearAction };
  }
  return { action: 'skip', nearAction };
}
