/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * L4 · 同屏最多 1 个发现性脉冲 — 仲裁序（Brief §8.1 / STANDARDS §四）。
 * @see docs/task-briefs/task-entry-signal-ledger.md §8
 */

import { ENTRY_SIGNAL_NO_MINT_HINT_IDS } from './entrySignalLedgerContract.js';
import { isClickTriggerHint } from './onboardingHintRegistry.js';

/** PO 2026-11-21 · 主路径先于外围；簇 A/B/C 不是本序。 */
export const DISCOVERY_PULSE_ARBITRATION_ORDER = Object.freeze([
  'how-shall-we-sit',
  'rise-button',
  'idle-after-session',
  'ambient-soundscape',
  'in-app-reminder',
  'weekly-heatmap',
  'language-preference',
  'help-affordance'
]);

/** @type {ReadonlySet<string>} */
const DISCOVERY_PULSE_ORDER_INDEX = new Set(DISCOVERY_PULSE_ARBITRATION_ORDER);

/**
 * Hints that participate in arbitration but do not paint a visible mint dot today.
 * help-affordance: purpose-only 「?」; excluded from visible pulse count.
 */
export const DISCOVERY_PULSE_NOPAINT_HINT_IDS = Object.freeze(
  new Set(['help-affordance'])
);

/**
 * @param {string} hintId
 * @returns {boolean}
 */
export function paintsDiscoveryPulseHint(hintId) {
  if (!hintId || !isClickTriggerHint(hintId)) return false;
  if (ENTRY_SIGNAL_NO_MINT_HINT_IDS.has(hintId)) return false;
  if (DISCOVERY_PULSE_NOPAINT_HINT_IDS.has(hintId)) return false;
  return DISCOVERY_PULSE_ORDER_INDEX.has(hintId);
}

/**
 * @param {{ isDone: (id: string) => boolean, isResting?: (id: string) => boolean }} store
 * @param {string} hintId
 * @returns {boolean}
 */
export function isDiscoveryPulseEligible(store, hintId) {
  if (!paintsDiscoveryPulseHint(hintId)) return false;
  if (store.isDone(hintId)) return false;
  if (typeof store.isResting === 'function' && store.isResting(hintId)) return false;
  return true;
}

/**
 * Pick at most one discovery pulse winner from on-screen / catalog candidates.
 * @param {string[]} candidateHintIds
 * @param {{ isDone: (id: string) => boolean, isResting?: (id: string) => boolean }} store
 * @returns {string | null}
 */
export function pickDiscoveryPulseWinner(candidateHintIds, store) {
  if (!Array.isArray(candidateHintIds) || candidateHintIds.length === 0) return null;
  const want = new Set(candidateHintIds);
  for (const id of DISCOVERY_PULSE_ARBITRATION_ORDER) {
    if (!want.has(id)) continue;
    if (isDiscoveryPulseEligible(store, id)) return id;
  }
  return null;
}

/**
 * Visible mint surfaces for policy guardrails / e2e.
 * @param {string[]} candidateHintIds
 * @param {{ isDone: (id: string) => boolean, isResting?: (id: string) => boolean }} store
 * @returns {string[]}
 */
export function resolveVisibleDiscoveryPulseIds(candidateHintIds, store) {
  const winner = pickDiscoveryPulseWinner(candidateHintIds, store);
  return winner ? [winner] : [];
}

/**
 * ⋯ / drawer row mint: L4 仲裁后才算 unread。
 * @param {string} hintId
 * @param {{ isDone: (id: string) => boolean, isSeen: (id: string) => boolean, isResting?: (id: string) => boolean }} store
 * @param {{ isDiscoveryPulseVisible?: (id: string) => boolean } | null | undefined} hintsUi
 * @returns {boolean}
 */
export function resolveSecondaryMenuHintUnread(hintId, store, hintsUi) {
  if (isClickTriggerHint(hintId)) {
    if (store.isDone(hintId) || store.isResting?.(hintId)) return false;
    return hintsUi?.isDiscoveryPulseVisible?.(hintId) === true;
  }
  return !store.isSeen(hintId);
}