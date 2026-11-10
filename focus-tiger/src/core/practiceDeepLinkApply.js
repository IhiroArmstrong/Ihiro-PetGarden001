/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Web B-slice: decide what a parsed practice deep link should do.
 * Sit only (PO §13-4). Breath/micro stay parse-ok and discard with a hint.
 * No fetch. No localStorage.
 */

import { checkoutKindFromSearch } from './desktopCheckoutConfirm.js';
import {
  PRACTICE_DEEP_LINK_START_PARAM,
  parsePracticeDeepLink
} from './practiceDeepLinkParse.js';

/** @typedef {'none' | 'checkout' | 'invalid' | 'unsupported' | 'sit'} PracticeDeepLinkClassKind */
/** @typedef {'ignore' | 'toast-discard' | 'discard-silent' | 'defer' | 'toast-busy' | 'apply-sit' | 'consume-quiet'} PracticeDeepLinkAction */

/**
 * @typedef {{
 *   kind: PracticeDeepLinkClassKind,
 *   intent?: { start: string, minutes: number }
 * }} PracticeDeepLinkClassified
 */

/**
 * @param {unknown} search
 * @returns {URLSearchParams}
 */
function searchParamsFromUnknown(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return new URLSearchParams();
  const query = text.startsWith('?') ? text.slice(1) : text;
  return new URLSearchParams(query);
}

/**
 * @param {unknown} search
 * @returns {PracticeDeepLinkClassified}
 */
export function classifyPracticeDeepLinkSearch(search) {
  if (checkoutKindFromSearch(search)) {
    return { kind: 'checkout' };
  }
  const startRaw = searchParamsFromUnknown(search).get(
    PRACTICE_DEEP_LINK_START_PARAM
  );
  if (startRaw == null || String(startRaw).trim() === '') {
    return { kind: 'none' };
  }
  const parsed = parsePracticeDeepLink(search);
  if (!parsed) {
    return { kind: 'invalid' };
  }
  if (parsed.start !== 'sit') {
    return { kind: 'unsupported', intent: parsed };
  }
  return { kind: 'sit', intent: parsed };
}

/**
 * @param {object} input
 * @param {PracticeDeepLinkClassified} input.classified
 * @param {boolean} input.uiReady
 * @param {boolean} input.overlayBusy
 * @param {string} input.sessionState
 * @param {boolean} input.completionPending
 * @param {boolean} input.deferColdStart
 * @param {boolean} input.alreadyOnSitPath
 * @param {'ignore' | 'start-arrival' | string} input.sitAction
 * @returns {{ action: PracticeDeepLinkAction, intent?: { start: string, minutes: number } }}
 */
export function resolvePracticeDeepLinkApply({
  classified,
  uiReady,
  overlayBusy,
  sessionState,
  completionPending,
  deferColdStart,
  alreadyOnSitPath,
  sitAction
}) {
  if (classified.kind === 'none' || classified.kind === 'checkout') {
    return { action: 'ignore' };
  }
  if (classified.kind === 'invalid' || classified.kind === 'unsupported') {
    return {
      action: uiReady ? 'toast-discard' : 'discard-silent'
    };
  }

  const intent = classified.intent;
  if (deferColdStart) {
    return { action: 'defer', intent };
  }
  if (alreadyOnSitPath) {
    return { action: 'consume-quiet', intent };
  }

  const sessionBusy =
    sessionState === 'FOCUSING' ||
    sessionState === 'CELEBRATE' ||
    completionPending === true;
  if (overlayBusy || sessionBusy || sitAction === 'ignore') {
    return { action: 'toast-busy', intent };
  }
  return { action: 'apply-sit', intent };
}
