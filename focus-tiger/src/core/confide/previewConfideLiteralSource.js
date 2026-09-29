/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab preview of the coarse literal bucket a Confide send would log.
 * Same classify + tool/reflective order as the desktop handler, without UI,
 * memory, or the read-hybrid model. A product-knowledge hit stays non-functional
 * here, matching resolveConfideLiteralCoarseBucket (KB source is not in that set).
 */

import { confideClassify } from './confideClassify.js';
import { matchConfideExecutableTool } from './confideExecutableTools.js';
import { shouldHandleConfideReflectiveHonesty } from './confideReflectiveHonesty.js';
import {
  resolveConfideLiteralCoarseBucket,
  shouldRunConfideSemanticShadow
} from './confideSemanticCoarseMap.js';

/**
 * @param {string} text
 * @returns {{
 *   text: string,
 *   route: string | null,
 *   source: string | null,
 *   literalCoarse: string | null,
 *   skipped: boolean
 * }}
 */
export function previewConfideLiteralSource(text) {
  const raw = typeof text === 'string' ? text.trim() : '';
  const route = confideClassify(raw);
  if (!route || !shouldRunConfideSemanticShadow({ route })) {
    return {
      text: raw,
      route: route || null,
      source: null,
      literalCoarse: null,
      skipped: true
    };
  }
  const tool = matchConfideExecutableTool({
    route,
    text: raw,
    memoryState: null,
    hasBridge: false
  });
  let source = 'generate';
  if (tool?.source) source = tool.source;
  else if (shouldHandleConfideReflectiveHonesty({ route, text: raw })) {
    source = 'reflective_honesty';
  }
  return {
    text: raw,
    route,
    source,
    literalCoarse: resolveConfideLiteralCoarseBucket({ route, source }),
    skipped: false
  };
}
