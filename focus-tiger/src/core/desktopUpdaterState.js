/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Desktop DMG updater UI state machine (renderer + tests).
 * Web soft-update reload path stays separate in appVersionCheck.js.
 */

/** @typedef {'idle' | 'available' | 'downloading' | 'readyToInstall' | 'failed' | 'skipped'} DesktopUpdatePhase */

export const DESKTOP_UPDATE_PHASES = {
  IDLE: 'idle',
  AVAILABLE: 'available',
  DOWNLOADING: 'downloading',
  READY_TO_INSTALL: 'readyToInstall',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

const VISIBLE_PHASES = new Set([
  DESKTOP_UPDATE_PHASES.AVAILABLE,
  DESKTOP_UPDATE_PHASES.DOWNLOADING,
  DESKTOP_UPDATE_PHASES.READY_TO_INSTALL,
  DESKTOP_UPDATE_PHASES.FAILED
]);

/**
 * MVP maps `required` urgency to optional behavior.
 * @param {unknown} urgency
 * @returns {'optional'}
 */
export function mapUrgencyForMvp(urgency) {
  if (String(urgency || '').trim().toLowerCase() === 'required') {
    return 'optional';
  }
  return 'optional';
}

/**
 * @param {{
 *   phase?: DesktopUpdatePhase | string,
 *   busySession?: boolean,
 *   skippedVersion?: string,
 *   availableVersion?: string,
 * }} [opts]
 * @returns {boolean}
 */
export function shouldRevealDesktopUpdateChip({
  phase = DESKTOP_UPDATE_PHASES.IDLE,
  busySession = false,
  skippedVersion = '',
  availableVersion = ''
} = {}) {
  if (busySession) return false;
  if (!VISIBLE_PHASES.has(String(phase))) return false;
  const skipped = String(skippedVersion || '').trim();
  const available = String(availableVersion || '').trim();
  if (skipped && available && skipped === available) return false;
  return true;
}

/**
 * @param {{ phase?: DesktopUpdatePhase | string, busySession?: boolean }} [opts]
 * @returns {boolean}
 */
export function shouldDeferQuitAndInstall({
  phase = DESKTOP_UPDATE_PHASES.IDLE,
  busySession = false
} = {}) {
  return (
    String(phase) === DESKTOP_UPDATE_PHASES.READY_TO_INSTALL &&
    Boolean(busySession)
  );
}

/**
 * Failed chip must expose both exit actions (contract for UI/tests).
 * @param {DesktopUpdatePhase | string} phase
 * @returns {boolean}
 */
export function desktopUpdateFailedActionsVisible(phase) {
  return String(phase) === DESKTOP_UPDATE_PHASES.FAILED;
}

/**
 * @param {string} [search]
 * @returns {boolean}
 */
export function readForceDesktopUpdateFlag(search = '') {
  try {
    const q = String(search || '');
    const params = new URLSearchParams(q.startsWith('?') ? q.slice(1) : q);
    return params.get('forceDesktopUpdate') === '1';
  } catch {
    return false;
  }
}

/**
 * @param {unknown} progress
 * @returns {number | null}
 */
export function normalizeUpdaterProgressPercent(progress) {
  if (!progress || typeof progress !== 'object') return null;
  const percent = Number(/** @type {{ percent?: unknown }} */ (progress).percent);
  if (!Number.isFinite(percent)) return null;
  return Math.max(0, Math.min(100, Math.round(percent)));
}
