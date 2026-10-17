/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Product-object side of CR-52 (operational ask ∧ object).
 * Reuses existing role / whether-object / catalog noun keywords.
 * Does not add topic lists.
 */

import catalog from './productKnowledgeCatalog.json' with { type: 'json' };
import { normalizeConfideIntentText } from './confideBoundaryRespect.js';
import { isPracticeFactsQuestion } from './confidePracticeFacts.js';
import {
  classifyConfideProductAskRole,
  hasConfideWhetherRequiredProductObject
} from './confideProductAskRole.js';

/**
 * Catalog keywords that are themselves ask shapes — not objects.
 * @param {string} keyword
 * @returns {boolean}
 */
function isAskShapeKeyword(keyword) {
  const s = String(keyword || '').trim();
  if (!s) return false;
  return /^(how\s+|where\s+|what\s+|which\s+|怎么|如何|从哪|在哪)/i.test(s);
}

/**
 * @param {string} haystack
 * @param {string} needle
 * @returns {boolean}
 */
function keywordMatches(haystack, needle) {
  const n = String(needle || '').trim();
  if (!n) return false;
  if (/[\u3040-\u30ff\u3400-\u9fff]/.test(n)) {
    return haystack.includes(n);
  }
  return haystack.toLowerCase().includes(n.toLowerCase());
}

/**
 * Existing catalog nouns only (skip how/where keyword rows).
 * @param {string} text
 * @returns {boolean}
 */
export function hasConfideCatalogNounObject(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  for (const entry of catalog.entries || []) {
    for (const keyword of entry.keywords || []) {
      if (isAskShapeKeyword(keyword)) continue;
      if (keywordMatches(raw, keyword)) return true;
    }
  }
  return false;
}

/**
 * @param {string} text
 * @param {{ catalogHit?: boolean }} [opts]
 * @returns {boolean}
 */
export function hasConfideProductObject(text, opts = {}) {
  if (opts.catalogHit === true) return true;
  if (isPracticeFactsQuestion(text)) return true;
  if (hasConfideWhetherRequiredProductObject(text)) return true;
  const role = classifyConfideProductAskRole(text);
  if (role === 'what-is' || role === 'whether-required' || role === 'why-compare') {
    return true;
  }
  return hasConfideCatalogNounObject(text);
}
