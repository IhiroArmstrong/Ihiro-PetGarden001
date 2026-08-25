/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personalization Engine · L0 local policy runtime.
 *
 * SSOT: `docs/YIN_PERSONALIZATION_ENGINE.md`.
 * Wraps existing silence / layer-order / user-initiated generate gates.
 * Does not replace Memory store, taste overlay, Qwen, or practice backup.
 * L0 never applies a State Pack. L1 retrieve rewrite and L2 cloud are out of scope.
 */

import { CONFIDE_ROUTE } from './confide/confideRoutes.js';
import { shouldUseDesktopCompanionGenerate } from './desktopCompanionL2Route.js';
import { shouldShowMomentWhisper } from './momentWhispersGate.js';

/** V1 three named styles; L0 always uses factory `default`. */
export const YPE_COMPANION_STYLES = Object.freeze(['quiet', 'default', 'warm']);

export const YPE_FACTORY_COMPANION_STYLE = 'default';

export const YPE_RUNTIME_LEVEL = 'L0';

/** Safety > corpus / ritual copy > Memory retrieve > Qwen. Memory never skips 0–2. */
export const YPE_LAYER_ORDER = Object.freeze([
  'safety',
  'corpus',
  'memory',
  'qwen'
]);

/**
 * L0 factory style. Pack / requested style is ignored until L1/L2.
 * @param {unknown} [_requested]
 * @returns {'default'}
 */
export function resolveLocalCompanionStyle(_requested) {
  return YPE_FACTORY_COMPANION_STYLE;
}

/**
 * L0 never installs a cloud overlay. Unknown or well-formed packs are discarded.
 * @param {unknown} [_pack]
 * @returns {{ applied: false, reason: 'l0-local-only' }}
 */
export function discardPersonalizationStatePack(_pack) {
  return Object.freeze({ applied: false, reason: 'l0-local-only' });
}

/**
 * Same Confide layer-3 generate gate as today (user-initiated desktop fallback).
 * @param {Parameters<typeof shouldUseDesktopCompanionGenerate>[0]} [opts]
 * @returns {boolean}
 */
export function ypeMayUseCompanionGenerate(opts) {
  return shouldUseDesktopCompanionGenerate(opts);
}

/**
 * Same lifetime + busy Moment Whisper gate as today.
 * @param {Storage | null | undefined} storage
 * @param {string} key
 * @param {{ busy?: boolean }} [opts]
 * @returns {boolean}
 */
export function ypeMayShowMomentWhisper(storage, key, opts = {}) {
  return shouldShowMomentWhisper(storage, key, opts);
}

/**
 * @param {object} [input]
 * @param {string | null} [input.route]
 * @param {boolean} [input.generateEnabled]
 * @param {boolean} [input.generateLayerOpen]
 * @param {boolean} [input.hasGenerateFn]
 * @param {Storage | null} [input.whisperStorage]
 * @param {string} [input.whisperKey]
 * @param {boolean} [input.whisperBusy]
 * @param {unknown} [input.pack]
 * @param {unknown} [input.requestedStyle]
 * @returns {Readonly<{
 *   runtimeLevel: 'L0',
 *   companionStyle: 'default',
 *   packOverlayApplied: false,
 *   packDiscardReason: 'l0-local-only',
 *   layerOrder: readonly string[],
 *   skipYpeOnSafety: boolean,
 *   mayGenerate: boolean,
 *   mayWhisper: boolean
 * }>}
 */
export function evaluateYinPersonalizationPolicy(input = {}) {
  const packResult = discardPersonalizationStatePack(input.pack);
  const route = input.route ?? null;
  const skipYpeOnSafety = route === CONFIDE_ROUTE.SAFETY_REDIRECT;
  const mayGenerate = ypeMayUseCompanionGenerate({
    route,
    generateEnabled: Boolean(input.generateEnabled),
    generateLayerOpen: Boolean(input.generateLayerOpen),
    hasGenerateFn: Boolean(input.hasGenerateFn)
  });
  const mayWhisper = ypeMayShowMomentWhisper(
    input.whisperStorage,
    input.whisperKey,
    { busy: Boolean(input.whisperBusy) }
  );

  return Object.freeze({
    runtimeLevel: YPE_RUNTIME_LEVEL,
    companionStyle: resolveLocalCompanionStyle(input.requestedStyle),
    packOverlayApplied: packResult.applied,
    packDiscardReason: packResult.reason,
    layerOrder: YPE_LAYER_ORDER,
    skipYpeOnSafety,
    mayGenerate,
    mayWhisper
  });
}
