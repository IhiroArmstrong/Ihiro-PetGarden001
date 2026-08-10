/**
 * Confide · user-visible mount gate vs QA harness.
 *
 * Analyst lock (2026-08-10):
 * - Skeleton / classify may ship in code while safety copy is still draft.
 * - Real-user Idle menu must stay hidden until safety corpus review=ok.
 * - `?confide=1` is a QA harness only — not a product launch.
 */

import { isConfideSafetyCorpusOk } from './confideCorpus.js';

/**
 * Real-user product surface (Idle ⋯ / drawer row).
 * @param {object} [opts]
 * @param {() => boolean} [opts.safetyOk]
 * @returns {boolean}
 */
export function isConfideUserVisible({
  safetyOk = isConfideSafetyCorpusOk
} = {}) {
  return safetyOk() === true;
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
 * Whether Confide panel may open in this session (menu or harness).
 * @param {object} [opts]
 * @param {string} [opts.search]
 * @param {() => boolean} [opts.safetyOk]
 * @returns {boolean}
 */
export function canOpenConfidePanel({
  search = '',
  safetyOk = isConfideSafetyCorpusOk
} = {}) {
  return isConfideUserVisible({ safetyOk }) || isConfideDevHarness(search);
}
