/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Renderer bridge for Yin Personal Memory (Electron preload only).
 * Web / narrow shell: no bridge → consent UI hidden, store unused.
 */

import { getDesktopShellBridge } from './desktopShell.js';
import { normalizeYinPersonalMemoryState } from './yinPersonalMemory/yinPersonalMemorySchema.js';

/**
 * @param {object} [globalObj]
 * @returns {null | {
 *   getState: () => Promise<unknown>,
 *   setConsent: (granted: boolean) => Promise<unknown>,
 *   rememberFromConfide: (payload: object) => Promise<unknown>,
 *   recordOptOut: (payload: object) => Promise<unknown>,
 *   suppressPostRecallFromConfide: (payload: object) => Promise<unknown>,
 *   forget: (memoryId: string) => Promise<unknown>
 * }}
 */
export function getYinPersonalMemoryBridge(globalObj = globalThis) {
  const shell = getDesktopShellBridge(globalObj);
  const memory = shell && shell.yinPersonalMemory;
  if (!memory || typeof memory.getState !== 'function') return null;
  if (typeof memory.setConsent !== 'function') return null;
  if (typeof memory.rememberFromConfide !== 'function') return null;
  if (typeof memory.recordOptOut !== 'function') return null;
  if (typeof memory.suppressPostRecallFromConfide !== 'function') return null;
  if (typeof memory.forget !== 'function') return null;
  return memory;
}

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function hasYinPersonalMemoryBridge(globalObj = globalThis) {
  return getYinPersonalMemoryBridge(globalObj) != null;
}

/**
 * @param {object} [globalObj]
 * @returns {Promise<import('./yinPersonalMemory/yinPersonalMemorySchema.js').YinPersonalMemoryState>}
 */
export async function fetchYinPersonalMemoryState(globalObj = globalThis) {
  const bridge = getYinPersonalMemoryBridge(globalObj);
  if (!bridge) return normalizeYinPersonalMemoryState(null);
  try {
    const raw = await bridge.getState();
    return normalizeYinPersonalMemoryState(raw);
  } catch {
    return normalizeYinPersonalMemoryState(null);
  }
}

/**
 * @param {boolean} granted
 * @param {object} [globalObj]
 */
export async function saveYinPersonalMemoryConsent(granted, globalObj = globalThis) {
  const bridge = getYinPersonalMemoryBridge(globalObj);
  if (!bridge) return normalizeYinPersonalMemoryState(null);
  try {
    const raw = await bridge.setConsent(Boolean(granted));
    return normalizeYinPersonalMemoryState(raw);
  } catch {
    return normalizeYinPersonalMemoryState(null);
  }
}

/**
 * Silent Remember after successful L3 generate (Slice 1b).
 * @param {{
 *   userText: string,
 *   route: string,
 *   replySource: string,
 *   turnOrdinal?: number
 * }} payload
 * @param {object} [globalObj]
 */
export async function rememberYinPersonalMemoryFromConfide(payload, globalObj = globalThis) {
  const bridge = getYinPersonalMemoryBridge(globalObj);
  if (!bridge) return normalizeYinPersonalMemoryState(null);
  try {
    const raw = await bridge.rememberFromConfide(payload && typeof payload === 'object' ? payload : {});
    return normalizeYinPersonalMemoryState(raw);
  } catch {
    return normalizeYinPersonalMemoryState(null);
  }
}

/**
 * @param {string} memoryId
 * @param {object} [globalObj]
 */
export async function forgetYinPersonalMemoryEntry(memoryId, globalObj = globalThis) {
  const bridge = getYinPersonalMemoryBridge(globalObj);
  if (!bridge) return normalizeYinPersonalMemoryState(null);
  try {
    const raw = await bridge.forget(typeof memoryId === 'string' ? memoryId : '');
    return normalizeYinPersonalMemoryState(raw);
  } catch {
    return normalizeYinPersonalMemoryState(null);
  }
}

/**
 * @param {{ turnId: string, scope?: 'turn' | 'session', at?: string }} payload
 * @param {object} [globalObj]
 */
export async function recordYinPersonalMemoryOptOut(payload, globalObj = globalThis) {
  const bridge = getYinPersonalMemoryBridge(globalObj);
  if (!bridge) return normalizeYinPersonalMemoryState(null);
  try {
    const raw = await bridge.recordOptOut(payload && typeof payload === 'object' ? payload : {});
    return normalizeYinPersonalMemoryState(raw);
  } catch {
    return normalizeYinPersonalMemoryState(null);
  }
}

/**
 * @param {{
 *   previousTurnOrdinal: number,
 *   currentTurnOrdinal: number,
 *   nowIso?: string
 * }} payload
 * @param {object} [globalObj]
 */
export async function suppressYinPersonalMemoryPostRecall(payload, globalObj = globalThis) {
  const bridge = getYinPersonalMemoryBridge(globalObj);
  if (!bridge) {
    return { state: normalizeYinPersonalMemoryState(null), outcome: 'no_match' };
  }
  try {
    const raw = await bridge.suppressPostRecallFromConfide(
      payload && typeof payload === 'object' ? payload : {}
    );
    if (raw && typeof raw === 'object' && 'state' in raw) {
      const o = /** @type {{ state?: unknown, outcome?: string }} */ (raw);
      const outcome =
        o.outcome === 'suppressed' || o.outcome === 'turn_opt_out' || o.outcome === 'no_match'
          ? o.outcome
          : 'no_match';
      return { state: normalizeYinPersonalMemoryState(o.state), outcome };
    }
    return { state: normalizeYinPersonalMemoryState(raw), outcome: 'no_match' };
  } catch {
    return { state: normalizeYinPersonalMemoryState(null), outcome: 'no_match' };
  }
}

