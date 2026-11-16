/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T100 PR-3 helpers for wiring the output gate onto companion generate.
 * Keep this file free of UI.
 */

/**
 * @param {{
 *   isReflectionCompanion?: boolean,
 *   observeWing?: boolean,
 *   attempt?: number
 * }} [opts]
 * @returns {string}
 */
export function chooseGeneratePathId({
  isReflectionCompanion = false,
  observeWing = false,
  attempt = 0
} = {}) {
  if (isReflectionCompanion) return 'reflection-companion';
  if (!observeWing) return 'confide-chat-l3';
  return Number(attempt) > 0 ? 'confide-observe-retry' : 'confide-observe-l3';
}

/**
 * Observe-wing cliché may retry. Rule hits, uncovered language, and gate
 * failure must not.
 * @param {{
 *   observeWing?: boolean,
 *   verdict?: string,
 *   clicheFlagged?: boolean
 * }} [opts]
 * @returns {boolean}
 */
export function shouldRetryObserveAfterGate({
  observeWing = false,
  verdict = '',
  clicheFlagged = false
} = {}) {
  return Boolean(observeWing) && verdict === 'pass' && Boolean(clicheFlagged);
}

/**
 * Display layer: missing gateVersion is untreated model text.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isGatedText(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.text === 'string' &&
      typeof value.gateVersion === 'string' &&
      value.gateVersion.trim()
  );
}
