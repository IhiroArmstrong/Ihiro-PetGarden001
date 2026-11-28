/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

export const STORAGE_KEY = 'focus-tiger.mindflow-nebula-enabled.v1';

/**
 * Hide user mount (menu + chrome) until presentation is reliable (PO 2026-11-20 / 11-27).
 * Preference storage may still persist; nothing user-facing mounts while suspended.
 */
export const MINDFLOW_NEBULA_CHROME_SUSPENDED = true;

/** @returns {boolean} */
export function isMindflowNebulaUserMountEnabled() {
  return MINDFLOW_NEBULA_CHROME_SUSPENDED !== true;
}

/** @typedef {'rest' | 'confide' | 'companion_speak'} MindflowNebulaMode */

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function readMindflowNebulaEnabled(storage) {
  if (MINDFLOW_NEBULA_CHROME_SUSPENDED) return false;
  if (!storage) return false;
  try {
    return storage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @returns {boolean} true when persisted
 */
export function writeMindflowNebulaEnabled(storage, enabled) {
  if (!storage) return false;
  try {
    if (enabled) storage.setItem(STORAGE_KEY, '1');
    else storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {{
 *   enabled: boolean,
 *   focusing: boolean,
 *   confideOpen: boolean,
 *   companionSpeaking: boolean
 * }} ctx
 * @returns {{ visible: boolean, mode: MindflowNebulaMode }}
 */
export function resolveMindflowNebulaPresentation(ctx) {
  if (MINDFLOW_NEBULA_CHROME_SUSPENDED) {
    return { visible: false, mode: 'rest' };
  }
  const enabled = Boolean(ctx.enabled);
  const focusing = Boolean(ctx.focusing);
  if (!enabled || focusing) {
    return { visible: false, mode: 'rest' };
  }
  if (ctx.companionSpeaking && ctx.confideOpen) {
    return { visible: true, mode: 'companion_speak' };
  }
  if (ctx.confideOpen) {
    return { visible: true, mode: 'confide' };
  }
  return { visible: true, mode: 'rest' };
}
