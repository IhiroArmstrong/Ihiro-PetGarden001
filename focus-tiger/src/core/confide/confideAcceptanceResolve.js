/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Shared resolvers for Confide frozen acceptance fixtures (unit tests only).
 */

import { shouldUseDesktopCompanionGenerate } from '../desktopCompanionL2Route.js';
import { shouldHandleStandaloneMemorySuppress } from '../yinPersonalMemory/yinPersonalMemorySuppress.js';
import { confideClassify } from './confideClassify.js';
import { shouldHandleConfideBoundary } from './confideBoundaryRespect.js';
import { shouldHandleConfideCompanionGreeting } from './confideCompanionGreeting.js';
import { shouldHandleConfideCompanionPresence } from './confideCompanionPresence.js';
import { shouldHandleConfideReflectiveHonesty } from './confideReflectiveHonesty.js';
import { shouldAnswerWithMemoryList } from './confideMemoryList.js';
import { shouldAnswerWithPracticeFacts } from './confidePracticeFacts.js';
import { shouldAnswerWithPresenceFacts } from './confidePresenceFacts.js';
import { shouldRunConfideReadHybridClassify } from './confideReadHybrid.js';
import { mayTryConfideProductKnowledge, retrieveProductKnowledge } from './confideProductKnowledge.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

const FALLBACK = CONFIDE_ROUTE.FALLBACK;

const READY_GENERATE = Object.freeze({
  generateEnabled: true,
  generateLayerOpen: true,
  hasGenerateFn: true
});

/**
 * Desktop handler bucket resolver (regex layer; assumes classify already ran).
 * @param {string} text
 * @param {string} [route]
 * @returns {import('./confideMetaQueryAcceptanceFixtures.js').ConfideMetaQueryBucket}
 */
export function resolveConfideMetaQueryBucket(text, route = confideClassify(text) ?? FALLBACK) {
  if (shouldHandleStandaloneMemorySuppress({
    route,
    text,
    state: null,
    hasBridge: true,
    turnOrdinal: 0
  })) {
    return 'memory_suppress';
  }
  if (shouldHandleConfideBoundary({ route, text })) {
    return 'boundary';
  }
  if (shouldHandleConfideCompanionPresence({ route, text })) {
    return 'companion_presence';
  }
  if (shouldAnswerWithMemoryList(route, text, true)) {
    return 'memory_list';
  }
  if (shouldAnswerWithPracticeFacts(route, text)) {
    return 'practice_facts';
  }
  if (shouldAnswerWithPresenceFacts(route, text)) {
    return 'presence_facts';
  }
  if (shouldHandleConfideReflectiveHonesty({ route, text })) {
    return 'reflective_honesty';
  }
  if (shouldHandleConfideCompanionGreeting({ route, text })) {
    return 'companion_greeting';
  }
  if (
    mayTryConfideProductKnowledge({
      route,
      text,
      wideViewport: true,
      hasBridge: true,
      hasMemoryBridge: true
    }) &&
    retrieveProductKnowledge(text).hit
  ) {
    return 'product_knowledge';
  }
  if (shouldRunConfideReadHybridClassify(text)) {
    return 'hybrid_classify';
  }
  return 'generate_skip_classify';
}

/**
 * Full Electron desktop `data-source` resolver (memory bridge on, no hybrid execution).
 * @param {string} text
 * @returns {string}
 */
export function resolveConfideDesktopSource(text) {
  const route = confideClassify(text) ?? FALLBACK;
  if (route === CONFIDE_ROUTE.SAFETY_REDIRECT || route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS) {
    return 'corpus';
  }
  if (route !== FALLBACK) {
    return 'corpus';
  }
  const bucket = resolveConfideMetaQueryBucket(text, route);
  if (bucket === 'generate_skip_classify') {
    return shouldUseDesktopCompanionGenerate({ ...READY_GENERATE, route })
      ? 'generate'
      : 'corpus';
  }
  if (bucket === 'memory_suppress') return 'memory_suppress';
  if (bucket === 'boundary') return 'boundary';
  return bucket;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideGenerateEligible(text) {
  const route = confideClassify(text) ?? FALLBACK;
  return shouldUseDesktopCompanionGenerate({ ...READY_GENERATE, route });
}
