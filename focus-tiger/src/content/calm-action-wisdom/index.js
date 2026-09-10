/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Calm Action Wisdom content loader — Recover (C1) + Arrive (C2) + Reflect (C4) + Transition (C5) pools.
 * Separate from Daily Wisdom / Quiet Line / ACTIVE_RECOVER toast pools.
 */

import { CALM_ACTION_ARRIVE_EN } from './calm-action-arrive.en.js';
import { CALM_ACTION_ARRIVE_JA } from './calm-action-arrive.ja.js';
import { CALM_ACTION_RECOVER_EN } from './calm-action-recover.en.js';
import { CALM_ACTION_RECOVER_JA } from './calm-action-recover.ja.js';
import { CALM_ACTION_REFLECT_EN } from './calm-action-reflect.en.js';
import { CALM_ACTION_REFLECT_JA } from './calm-action-reflect.ja.js';
import { CALM_ACTION_TRANSITION_EN } from './calm-action-transition.en.js';
import { CALM_ACTION_TRANSITION_JA } from './calm-action-transition.ja.js';
import {
  overlayCalmActionArriveTextForId,
  overlayCalmActionRecoverTextForId,
  overlayCalmActionReflectTextForId
} from '../../core/tasteLayerOverlay.js';

/** @typedef {{ id: string, text: string }} CalmActionRecoverEntry */
/** @typedef {{ id: string, text: string }} CalmActionArriveEntry */
/** @typedef {{ id: string, text: string }} CalmActionReflectEntry */
/** @typedef {{ id: string, text: string }} CalmActionTransitionEntry */

/** @type {Readonly<Record<string, readonly CalmActionRecoverEntry[]>>} */
const RECOVER_POOLS = Object.freeze({
  en: CALM_ACTION_RECOVER_EN,
  ja: CALM_ACTION_RECOVER_JA
});

/** @type {Readonly<Record<string, readonly CalmActionArriveEntry[]>>} */
const ARRIVE_POOLS = Object.freeze({
  en: CALM_ACTION_ARRIVE_EN,
  ja: CALM_ACTION_ARRIVE_JA
});

/** @type {Readonly<Record<string, readonly CalmActionReflectEntry[]>>} */
const REFLECT_POOLS = Object.freeze({
  en: CALM_ACTION_REFLECT_EN,
  ja: CALM_ACTION_REFLECT_JA
});

/** @type {Readonly<Record<string, readonly CalmActionTransitionEntry[]>>} */
const TRANSITION_POOLS = Object.freeze({
  en: CALM_ACTION_TRANSITION_EN,
  ja: CALM_ACTION_TRANSITION_JA
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
  const overlayText = overlayCalmActionRecoverTextForId(key, locale);
  if (overlayText) return { id: key, text: overlayText };
  const preferred = getCalmActionRecoverPool(locale).find((e) => e.id === key);
  if (preferred) return preferred;
  return RECOVER_POOLS.en.find((e) => e.id === key) ?? null;
}

/**
 * @param {string} [locale]
 * @returns {readonly CalmActionArriveEntry[]}
 */
export function getCalmActionArrivePool(locale = 'en') {
  if (locale === 'ja') return ARRIVE_POOLS.ja;
  return ARRIVE_POOLS.en;
}

/**
 * @param {string} id
 * @param {string} [locale]
 * @returns {CalmActionArriveEntry | null}
 */
export function findCalmActionArriveEntry(id, locale = 'en') {
  const key = String(id || '');
  if (!key) return null;
  const overlayText = overlayCalmActionArriveTextForId(key, locale);
  if (overlayText) return { id: key, text: overlayText };
  const preferred = getCalmActionArrivePool(locale).find((e) => e.id === key);
  if (preferred) return preferred;
  return ARRIVE_POOLS.en.find((e) => e.id === key) ?? null;
}

/**
 * @param {string} [locale]
 * @returns {readonly CalmActionReflectEntry[]}
 */
export function getCalmActionReflectPool(locale = 'en') {
  if (locale === 'ja') return REFLECT_POOLS.ja;
  return REFLECT_POOLS.en;
}

/**
 * @param {string} id
 * @param {string} [locale]
 * @returns {CalmActionReflectEntry | null}
 */
export function findCalmActionReflectEntry(id, locale = 'en') {
  const key = String(id || '');
  if (!key) return null;
  const overlayText = overlayCalmActionReflectTextForId(key, locale);
  if (overlayText) return { id: key, text: overlayText };
  const preferred = getCalmActionReflectPool(locale).find((e) => e.id === key);
  if (preferred) return preferred;
  return REFLECT_POOLS.en.find((e) => e.id === key) ?? null;
}

/**
 * @param {string} [locale]
 * @returns {readonly CalmActionTransitionEntry[]}
 */
export function getCalmActionTransitionPool(locale = 'en') {
  if (locale === 'ja') return TRANSITION_POOLS.ja;
  return TRANSITION_POOLS.en;
}

/**
 * @param {string} id
 * @param {string} [locale]
 * @returns {CalmActionTransitionEntry | null}
 */
export function findCalmActionTransitionEntry(id, locale = 'en') {
  const key = String(id || '');
  if (!key) return null;
  const preferred = getCalmActionTransitionPool(locale).find((e) => e.id === key);
  if (preferred) return preferred;
  return TRANSITION_POOLS.en.find((e) => e.id === key) ?? null;
}

export {
  CALM_ACTION_ARRIVE_EN,
  CALM_ACTION_ARRIVE_JA,
  CALM_ACTION_RECOVER_EN,
  CALM_ACTION_RECOVER_JA,
  CALM_ACTION_REFLECT_EN,
  CALM_ACTION_REFLECT_JA,
  CALM_ACTION_TRANSITION_EN,
  CALM_ACTION_TRANSITION_JA
};
