/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle Document Picture-in-Picture companion (experimental prototype).
 *
 * Records whether the user has opened the Idle float once — for later
 * investment decisions only. Must not drive reminders, streaks, or prompts.
 *
 * @see docs/DESIGN.md「Idle Document PiP 陪伴浮窗」
 */

import {
  hasDocumentPictureInPictureShape,
  shouldShowDocumentPictureInPictureEntry,
  supportsDocumentPictureInPicture
} from './immersivePresenceSupport.js';

export {
  hasDocumentPictureInPictureShape,
  shouldShowDocumentPictureInPictureEntry,
  supportsDocumentPictureInPicture
};

export const IDLE_COMPANION_PIP_STORAGE_KEY =
  'focus-tiger.idle-companion-pip.v1';

/**
 * @typedef {{
 *   used: boolean,
 *   usedAt: number | null
 * }} IdleCompanionPipState
 */

/**
 * Whether the Idle entry may exist in the DOM at all.
 * Unsupported browsers (Safari / Firefox / mobile Chrome) → false.
 * @param {Window | undefined | null} [win]
 * @returns {boolean}
 */
export function shouldMountIdleCompanionPipEntry(win = globalThis) {
  return hasDocumentPictureInPictureShape(win);
}

/**
 * Whether the Idle entry is visible right now.
 * Unsupported → hidden. Non-Idle chrome → hidden. No "unsupported" copy.
 *
 * @param {{
 *   documentPipSupported?: boolean,
 *   isIdle?: boolean
 * }} [state]
 * @returns {boolean}
 */
export function shouldShowIdleCompanionPipEntry(state = {}) {
  const pipOk =
    typeof state.documentPipSupported === 'boolean'
      ? state.documentPipSupported
      : shouldShowDocumentPictureInPictureEntry();
  return Boolean(pipOk) && Boolean(state.isIdle);
}

/**
 * @param {unknown} raw
 * @returns {IdleCompanionPipState}
 */
export function normalizeIdleCompanionPipState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { used: false, usedAt: null };
  }
  const o = /** @type {{ used?: unknown, usedAt?: unknown }} */ (raw);
  const usedAt =
    typeof o.usedAt === 'number' && Number.isFinite(o.usedAt) ? o.usedAt : null;
  return {
    used: Boolean(o.used) || usedAt != null,
    usedAt
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {IdleCompanionPipState}
 */
export function readIdleCompanionPipState(storage) {
  if (!storage?.getItem) return normalizeIdleCompanionPipState(null);
  try {
    const raw = storage.getItem(IDLE_COMPANION_PIP_STORAGE_KEY);
    if (!raw) return normalizeIdleCompanionPipState(null);
    return normalizeIdleCompanionPipState(JSON.parse(raw));
  } catch {
    return normalizeIdleCompanionPipState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {IdleCompanionPipState} state
 * @returns {void}
 */
export function writeIdleCompanionPipState(storage, state) {
  if (!storage?.setItem) return;
  const next = normalizeIdleCompanionPipState(state);
  try {
    storage.setItem(
      IDLE_COMPANION_PIP_STORAGE_KEY,
      JSON.stringify({
        used: Boolean(next.used),
        usedAt: next.usedAt
      })
    );
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasUsedIdleCompanionPip(storage) {
  return readIdleCompanionPipState(storage).used === true;
}

/**
 * First successful open of the Idle float. Idempotent; does not remind.
 * @param {Storage | null | undefined} storage
 * @param {() => number} [now]
 * @returns {void}
 */
export function markIdleCompanionPipUsed(
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => Date.now()
) {
  const prev = readIdleCompanionPipState(storage);
  if (prev.used && prev.usedAt != null) return;
  writeIdleCompanionPipState(storage, {
    used: true,
    usedAt: prev.usedAt ?? now()
  });
}
