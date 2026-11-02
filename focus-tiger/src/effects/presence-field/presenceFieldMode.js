/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Shortest scatter dwell; lock is not a timer. */
export const SCATTER_MIN_MS = 45_000;
export const LOCK_ENTER_R = 0.62;
export const LOCK_EXIT_R = 0.4;
export const REST_AFTER_LOCK_MS = 8_000;
export const DETUNE_MS = 5_000;

/** @typedef {'off' | 'scatter' | 'lock' | 'rest' | 'detune'} PresenceFieldMode */
/** @typedef {'off' | 'scatter' | 'invite-lock' | 'lock' | 'rest' | 'detune'} PresenceFieldCoupling */

/**
 * Discrete sit-together field. Does not read user input.
 *
 * @param {{
 *   enabled: boolean,
 *   focusing: boolean,
 *   recoverDisplay?: boolean,
 *   elapsedFocusMs: number,
 *   r: number,
 *   mode: PresenceFieldMode,
 *   lockHeldMs?: number
 * }} ctx
 * @returns {{ visible: boolean, mode: PresenceFieldMode, coupling: PresenceFieldCoupling }}
 */
export function resolvePresenceFieldMode(ctx) {
  const enabled = Boolean(ctx.enabled);
  const focusing = Boolean(ctx.focusing);
  if (!enabled || !focusing) {
    return { visible: false, mode: 'off', coupling: 'off' };
  }
  if (ctx.recoverDisplay) {
    return { visible: true, mode: 'detune', coupling: 'detune' };
  }

  const elapsed = Math.max(0, Number(ctx.elapsedFocusMs) || 0);
  const r = Math.max(0, Math.min(1, Number(ctx.r) || 0));
  const pastMin = elapsed >= SCATTER_MIN_MS;
  const scatterCoupling = pastMin ? 'invite-lock' : 'scatter';
  const mode = ctx.mode;

  if (mode === 'rest') {
    return { visible: true, mode: 'rest', coupling: 'rest' };
  }

  if (mode === 'lock') {
    if (r < LOCK_EXIT_R) {
      return { visible: true, mode: 'scatter', coupling: scatterCoupling };
    }
    const held = Math.max(0, Number(ctx.lockHeldMs) || 0);
    if (held >= REST_AFTER_LOCK_MS) {
      return { visible: true, mode: 'rest', coupling: 'rest' };
    }
    return { visible: true, mode: 'lock', coupling: 'lock' };
  }

  if (pastMin && r >= LOCK_ENTER_R) {
    return { visible: true, mode: 'lock', coupling: 'lock' };
  }
  return { visible: true, mode: 'scatter', coupling: scatterCoupling };
}

/**
 * @param {PresenceFieldCoupling} coupling
 * @param {number | null | undefined} debugK
 * @returns {number}
 */
export function couplingK(coupling, debugK) {
  if (debugK != null && Number.isFinite(Number(debugK))) {
    return Math.max(0, Math.min(12, Number(debugK)));
  }
  switch (coupling) {
    case 'scatter':
      return 0.38;
    case 'invite-lock':
      return 4.2;
    case 'lock':
      return 4.8;
    case 'rest':
      return 3.4;
    case 'detune':
      return 0.22;
    default:
      return 0;
  }
}

/**
 * @param {PresenceFieldCoupling} coupling
 * @param {number | null | undefined} debugSigma
 * @returns {number}
 */
export function couplingSigma(coupling, debugSigma) {
  if (debugSigma != null && Number.isFinite(Number(debugSigma))) {
    return Math.max(0, Math.min(1, Number(debugSigma)));
  }
  switch (coupling) {
    case 'scatter':
      return 0.14;
    case 'invite-lock':
      return 0.06;
    case 'lock':
      return 0.025;
    case 'rest':
      return 0.018;
    case 'detune':
      return 0.2;
    default:
      return 0;
  }
}

/**
 * Visual amplitude of extra lobes (rest retreats to background).
 * @param {PresenceFieldMode} mode
 * @returns {number}
 */
export function visualGainForMode(mode) {
  switch (mode) {
    case 'scatter':
      return 0.82;
    case 'lock':
      return 1;
    case 'rest':
      return 0.22;
    case 'detune':
      return 0.55;
    default:
      return 0;
  }
}
