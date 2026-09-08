/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Calm Action Wisdom content loader — Recover pool (C1 runtime).
 * Separate from Daily Wisdom / Quiet Line / ACTIVE_RECOVER toast pools.
 */

import { CALM_ACTION_RECOVER_EN } from './calm-action-recover.en.js';
import { CALM_ACTION_RECOVER_JA } from './calm-action-recover.ja.js';

/** @typedef {{ id: string, text: string }} CalmActionRecoverEntry */

/** @type {Readonly<Record<string, readonly CalmActionRecoverEntry[]>>} */
const RECOVER_POOLS = Object.freeze({
  en: CALM_ACTION_RECOVER_EN,
  ja: CALM_ACTION_RECOVER_JA
});

/**
 * @param {string} [locale]
 * @returns {readonly CalmActionRecoverEntry[]}
 */
export function getCalmActionRecoverPool(locale = 'en') {
  if (locale === 'ja') return RECOVER_POOLS.ja;
  return RECOVER_POOLS.en;
}

/**
 * @param {string} id
 * @param {string} [locale]
 * @returns {CalmActionRecoverEntry | null}
 */
export function findCalmActionRecoverEntry(id, locale = 'en') {
  const key = String(id || '');
  if (!key) return null;
  const preferred = getCalmActionRecoverPool(locale).find((e) => e.id === key);
  if (preferred) return preferred;
  return RECOVER_POOLS.en.find((e) => e.id === key) ?? null;
}

export { CALM_ACTION_RECOVER_EN, CALM_ACTION_RECOVER_JA };
