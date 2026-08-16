/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Web soft update prompt — compare local build id to same-origin version.json.
 * Product: only reveal when a newer build is detected; click → reload (not patch download).
 */

/** @typedef {{ version: string, buildId: string }} AppVersionManifest */

export const LOCAL_APP_BUILD_ID = String(
  import.meta.env?.VITE_APP_BUILD_ID || ''
).trim();

export const LOCAL_APP_VERSION = String(
  import.meta.env?.VITE_APP_VERSION || ''
).trim();

/**
 * @param {unknown} raw
 * @returns {AppVersionManifest | null}
 */
export function parseVersionManifest(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const buildId = String(/** @type {{ buildId?: unknown }} */ (raw).buildId || '').trim();
  if (!buildId) return null;
  const version = String(
    /** @type {{ version?: unknown }} */ (raw).version || ''
  ).trim();
  return {
    buildId,
    version: version || buildId
  };
}

/**
 * Same-origin builds: any different buildId means “update available”.
 * @param {{
 *   localBuildId?: string,
 *   remoteBuildId?: string,
 *   force?: boolean,
 * }} [opts]
 * @returns {boolean}
 */
export function isUpdateAvailable({
  localBuildId = LOCAL_APP_BUILD_ID,
  remoteBuildId = '',
  force = false
} = {}) {
  if (force) return true;
  const local = String(localBuildId || '').trim();
  const remote = String(remoteBuildId || '').trim();
  if (!local || !remote) return false;
  return local !== remote;
}

/**
 * Quiet entry: only when update is known and session is not busy.
 * @param {{ updateAvailable?: boolean, busySession?: boolean }} [opts]
 * @returns {boolean}
 */
export function shouldRevealSoftUpdatePrompt({
  updateAvailable = false,
  busySession = false
} = {}) {
  return Boolean(updateAvailable) && !busySession;
}

/**
 * @param {string} template
 * @param {string} version
 * @returns {string}
 */
export function formatSoftUpdateLabel(template, version) {
  return String(template || '').replaceAll('{version}', String(version || ''));
}

/**
 * Read ?forceUpdatePrompt=1 from a search string (DEV / manual QA).
 * @param {string} [search]
 * @returns {boolean}
 */
export function readForceUpdatePromptFlag(search = '') {
  try {
    const q = String(search || '');
    const params = new URLSearchParams(
      q.startsWith('?') ? q.slice(1) : q
    );
    return params.get('forceUpdatePrompt') === '1';
  } catch {
    return false;
  }
}
