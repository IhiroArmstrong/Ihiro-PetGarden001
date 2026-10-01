/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · product-knowledge miss / embedding-not-ready honesty (Brief §四).
 */

import { overlayConfideTemplateTextForKey } from '../tasteLayerOverlay.js';

/**
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatConfideProductKnowledgeHonestyReply(tFn) {
  const overlay = overlayConfideTemplateTextForKey('CONFIDE_PRODUCT_KNOWLEDGE_HONESTY');
  if (overlay) return overlay;
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  return t('CONFIDE_PRODUCT_KNOWLEDGE_HONESTY');
}
