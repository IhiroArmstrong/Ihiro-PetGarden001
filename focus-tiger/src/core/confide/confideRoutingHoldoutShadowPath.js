/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Coarse shadow `data-source` for routing holdout (band C). Not the send path.
 */

import { confideClassify } from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  isConfideOperationalProductAskShape,
  resolveProductKnowledgeGateAction
} from './confideProductKnowledgeSemantic.js';
import { probeProductKnowledgeCatalog } from './confideProductKnowledge.js';
import { catalogKeywordSpeakAllowed } from './confideFactFirstSpeak.js';
import { ROUTING_NEAR_HIT_MIN } from './confideRoutingArbitrationShadow.js';

/**
 * @param {{
 *   text: string,
 *   productPath: boolean,
 *   gate?: {
 *     score?: number,
 *     nearestId?: string | null,
 *     nearestScore?: number | null,
 *     lifeOutranksProduct?: boolean,
 *     moodOutranksProduct?: boolean | null
 *   }
 * }} input
 */
export function resolveHoldoutShadowDataSource(input) {
  const text = String(input.text || '').trim();
  const route = confideClassify(text) ?? CONFIDE_ROUTE.FALLBACK;
  if (route !== CONFIDE_ROUTE.FALLBACK) return 'corpus';
  if (input.productPath !== true) return 'generate';
  const catalog = probeProductKnowledgeCatalog(text);
  const keywordOk = catalogKeywordSpeakAllowed({
    catalogHit: Boolean(catalog.hit),
    catalogId: catalog.id,
    embeddingState: 'ready',
    text
  });
  const nearestScore = Number(input.gate?.nearestScore);
  const nearAction =
    Number.isFinite(nearestScore) && nearestScore >= ROUTING_NEAR_HIT_MIN ? 'honesty' : null;
  const action = resolveProductKnowledgeGateAction({
    text,
    embeddingState: 'ready',
    semanticIsProduct: Number(input.gate?.score) >= 0.42,
    catalogHit: keywordOk,
    nearAction,
    lifeOutranksProduct: input.gate?.lifeOutranksProduct === true,
    moodOutranksProduct: input.gate?.moodOutranksProduct ?? null,
    moodVetoLive: false
  });
  if (action === 'hit') return 'product_knowledge';
  if (action === 'honesty') return 'product_knowledge_honesty';
  if (isConfideOperationalProductAskShape(text)) return 'product_knowledge_honesty';
  return 'generate';
}

/**
 * @param {{
 *   text: string,
 *   productPath: boolean,
 *   gate?: { nearestId?: string | null, nearestScore?: number | null, score?: number }
 * }} input
 */
export function resolveHoldoutShadowCatalogId(input) {
  if (input.productPath !== true) return null;
  const catalog = probeProductKnowledgeCatalog(input.text);
  if (catalog.hit) return catalog.id;
  const nearestScore = Number(input.gate?.nearestScore);
  if (Number.isFinite(nearestScore) && nearestScore >= ROUTING_NEAR_HIT_MIN) {
    return input.gate?.nearestId ?? null;
  }
  return null;
}
