/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide · user-visible mount gate vs QA harness.
 *
 * Gates (independent):
 * 1. Safety copy review=ok (`isConfideSafetyCorpusOk`)
 * 2. Product mount flag (`CONFIDE_USER_MOUNT_ENABLED`) — true for first
 *    English ship (PO 2026-11-14)
 * 3. UI locale is not Japanese (`isConfideLocaleAllowed`) — first ship
 *    disables Confide chrome when the product language is 日本語
 * 4. Chrome stage must be idle (no Arrival / Focusing / overlay disturb)
 * 5. `?confide=1` QA harness — may open panel without product mount, but
 *    still not when the UI locale is Japanese
 */

import { isConfideSafetyCorpusOk } from './confideCorpus.js';
import { isClientQaHarnessAllowed } from '../clientQaHarnessGate.js';
import { getLocale } from '../../locales/i18n.js';

/**
 * Flip to false only to hide Confide from every locale again.
 * First product ship: English (and other non-ja) Idle menu + ear are on.
 */
export const CONFIDE_USER_MOUNT_ENABLED = true;

/**
 * Japanese UI locale is out of first-ship Confide. Input-language T36
 * (kana → not-yet-open) remains a send-path backstop on English UI.
 * @param {string} [locale]
 * @returns {boolean}
 */
export function isConfideLocaleAllowed(locale) {
  return String(locale || '').toLowerCase() !== 'ja';
}

/**
 * Real-user Idle ⋯ / drawer row.
 * @param {object} [opts]
 * @param {() => boolean} [opts.safetyOk]
 * @param {boolean} [opts.mountEnabled]
 * @param {string} [opts.locale]
 * @returns {boolean}
 */
export function isConfideUserVisible({
  safetyOk = isConfideSafetyCorpusOk,
  mountEnabled = CONFIDE_USER_MOUNT_ENABLED,
  locale = getLocale()
} = {}) {
  return (
    mountEnabled === true &&
    safetyOk() === true &&
    isConfideLocaleAllowed(locale)
  );
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
 * @param {boolean} [opts.companionGeneration] ignored (Plan A option 1: purchase does not open Confide while mount is off)
 * @param {boolean} [opts.qaHarnessAllowed]
 * @param {string} [opts.locale]
 * @returns {boolean}
 */
export function canOpenConfidePanel({
  search = '',
  stage = 'idle',
  safetyOk = isConfideSafetyCorpusOk,
  mountEnabled = CONFIDE_USER_MOUNT_ENABLED,
  companionGeneration = false,
  qaHarnessAllowed = isClientQaHarnessAllowed(),
  locale = getLocale()
} = {}) {
  void companionGeneration;
  if (!isConfideChromeStageAllowed(stage)) return false;
  if (!isConfideLocaleAllowed(locale)) return false;
  const harnessAllowed =
    qaHarnessAllowed === true && isConfideDevHarness(search);
  return isConfideUserVisible({ safetyOk, mountEnabled, locale }) || harnessAllowed;
}

/**
 * Idle ear chrome (wide top-left / narrow ActionBar) uses the *open* gate.
 * Hidden when the panel cannot open — no dead click.
 * @param {Parameters<typeof canOpenConfidePanel>[0]} [opts]
 * @returns {boolean}
 */
export function shouldShowConfideEarChrome(opts = {}) {
  return canOpenConfidePanel(opts);
}
