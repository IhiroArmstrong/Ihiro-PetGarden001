/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · user-visible mount gate vs QA harness.
 *
 * Gates (independent):
 * 1. Safety copy review=ok (`isConfideSafetyCorpusOk`)
 * 2. Explicit product mount flag (`CONFIDE_USER_MOUNT_ENABLED`) — stays false
 *    until panel UX is intentionally launched to real users
 * 3. Chrome stage must be idle (no Arrival / Focusing / overlay disturb)
 * 4. `?confide=1` QA harness — may open panel without product mount
 */

import { isConfideSafetyCorpusOk } from './confideCorpus.js';

/**
 * Flip to true only when Confide is intentionally user-launched
 * (safety ok + panel wired + product decision to show Idle menu).
 * PR / MVP scaffold keeps this false so real users never see the row yet.
 */
export const CONFIDE_USER_MOUNT_ENABLED = false;

/**
 * Real-user Idle ⋯ / drawer row.
 * @param {object} [opts]
 * @param {() => boolean} [opts.safetyOk]
 * @param {boolean} [opts.mountEnabled]
 * @returns {boolean}
 */
export function isConfideUserVisible({
  safetyOk = isConfideSafetyCorpusOk,
  mountEnabled = CONFIDE_USER_MOUNT_ENABLED
} = {}) {
  return mountEnabled === true && safetyOk() === true;
}

/**
 * QA / local harness query (?confide=1). Does NOT imply user-visible ship.
 * @param {string} [search] location.search or query without ?
 * @returns {boolean}
 */
export function isConfideDevHarness(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    return new URLSearchParams(q).get('confide') === '1';
  } catch {
    return false;
  }
}

/**
 * Only Idle chrome — hide during Arrival / Focusing / overlay / bridge.
 * @param {string} [stage]
 * @returns {boolean}
 */
export function isConfideChromeStageAllowed(stage) {
  return stage === 'idle';
}

/**
 * Whether Confide panel may open in this session (menu or harness) + stage.
 * @param {object} [opts]
 * @param {string} [opts.search]
 * @param {string} [opts.stage]
 * @param {() => boolean} [opts.safetyOk]
 * @param {boolean} [opts.mountEnabled]
 * @returns {boolean}
 */
export function canOpenConfidePanel({
  search = '',
  stage = 'idle',
  safetyOk = isConfideSafetyCorpusOk,
  mountEnabled = CONFIDE_USER_MOUNT_ENABLED
} = {}) {
  if (!isConfideChromeStageAllowed(stage)) return false;
  return (
    isConfideUserVisible({ safetyOk, mountEnabled }) ||
    isConfideDevHarness(search)
  );
}
