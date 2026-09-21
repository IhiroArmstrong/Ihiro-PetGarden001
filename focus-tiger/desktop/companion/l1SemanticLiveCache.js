/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Keep in sync with src/core/confide/confideSemanticShadowPriorTurn.js
 * `canReuseConfideSemanticLiveCache` (desktop runtime must not import renderer src).
 *
 * @param {object | null | undefined} cached
 * @param {{
 *   text?: string,
 *   contextualText?: string,
 *   hadPriorTurn?: boolean
 * }} [query]
 * @returns {boolean}
 */
export function canReuseConfideSemanticLiveCache(cached, query = {}) {
  if (!cached || cached.ok !== true) return false;
  const text = typeof query.text === 'string' ? query.text.trim() : '';
  if (!text || cached.text !== text) return false;
  const cachedCtx =
    typeof cached.contextualText === 'string' ? cached.contextualText.trim() : '';
  const ctx =
    typeof query.contextualText === 'string' ? query.contextualText.trim() : '';
  if (cachedCtx !== ctx) return false;
  if (query.hadPriorTurn && !cached.semanticResultWithPrior) return false;
  return true;
}
