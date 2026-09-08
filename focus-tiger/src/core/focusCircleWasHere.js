/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Circle was-here-today — automatic mark on Rise; peek merged with presence.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import { toLocalDayKey, getViewerTimeZone } from './focusCircleDayKey.js';
import {
  FOCUS_CIRCLE_PATH,
  FOCUS_CIRCLE_SCHEMA_VERSION,
  isFocusCircleClientEnabled,
  readFocusCircleMembership
} from './focusCircleMembership.js';
import { isFocusCirclePassiveShareEnabled } from './focusCirclePassiveShare.js';
import { FOCUS_CIRCLE_WITNESS_MIN_SESSION_SECONDS } from './focusCircleWitness.js';

export const FOCUS_CIRCLE_WAS_HERE_QUERY_PARAM = 'focusCircleWasHere';
export const FOCUS_CIRCLE_WAS_HERE_MARK_STORAGE_KEY =
  'focus-tiger.focus-circle-was-here-mark.v1';

export {
  FOCUS_CIRCLE_WITNESS_MIN_SESSION_SECONDS as FOCUS_CIRCLE_WAS_HERE_MIN_SESSION_SECONDS
};

/**
 * @param {string} [search]
 * @returns {'0' | null}
 */
export function readFocusCircleWasHereQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(FOCUS_CIRCLE_WAS_HERE_QUERY_PARAM);
    if (value === '0' || value === 'false') return '0';
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {{ search?: string, storage?: Storage | null, cloudBaseUrl?: string }} [opts]
 */
export function isFocusCircleWasHereClientEnabled({
  search = '',
  storage = globalThis.localStorage,
  cloudBaseUrl = getCloudApiBaseUrl()
} = {}) {
  if (readFocusCircleWasHereQueryFlag(search) === '0') return false;
  if (!isFocusCircleClientEnabled({ search, cloudBaseUrl })) return false;
  return Boolean(readFocusCircleMembership(storage));
}

/**
 * @param {number} elapsedSeconds
 */
export function isWasHereEligibleSession(elapsedSeconds) {
  const n = Number(elapsedSeconds);
  return Number.isFinite(n) && n >= FOCUS_CIRCLE_WITNESS_MIN_SESSION_SECONDS;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} dayKey
 */
function readLocalMarkDayKey(storage, dayKey) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(FOCUS_CIRCLE_WAS_HERE_MARK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed.dayKey === dayKey ? dayKey : null;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} dayKey
 */
function rememberLocalMarkDayKey(storage, dayKey) {
  if (!storage) return;
  try {
    storage.setItem(
      FOCUS_CIRCLE_WAS_HERE_MARK_STORAGE_KEY,
      JSON.stringify({ dayKey, markedAt: Date.now() })
    );
  } catch {
    // quota
  }
}

/**
 * @param {object} [opts]
 */
export async function postFocusCircleWasHereMark({
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  circleId = '',
  memberId = '',
  storage = globalThis.localStorage,
  markerDayKey = toLocalDayKey(),
  markedAtMs = Date.now()
} = {}) {
  if (!getBaseUrl()) {
    return { ok: false, reason: 'cloud_api_unconfigured', skipped: true };
  }
  const membership = readFocusCircleMembership(storage);
  if (!membership) {
    return { ok: false, reason: 'no_membership', skipped: true };
  }
  const payload = {
    schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
    action: 'was_here_mark',
    circleId: circleId || membership.circleId,
    memberId: memberId || membership.memberId,
    markerDayKey,
    markedAtMs
  };
  try {
    const body = await postJson(FOCUS_CIRCLE_PATH, {
      body: JSON.stringify(payload)
    });
    if (!body || body.schemaVersion !== FOCUS_CIRCLE_SCHEMA_VERSION) {
      return { ok: false, reason: 'bad_payload', skipped: true };
    }
    if (body.ok !== true) {
      return { ok: false, reason: 'server_rejected', skipped: true };
    }
    return { ok: true, skipped: false };
  } catch {
    return { ok: false, reason: 'network', skipped: true };
  }
}

/**
 * Fire-and-forget was-here mark after eligible Rise.
 * @param {object} [opts]
 * @param {number} [opts.elapsedSeconds]
 */
export function maybeWasHereMark(opts = {}) {
  const elapsedSeconds = opts.elapsedSeconds ?? 0;
  if (!isWasHereEligibleSession(elapsedSeconds)) return { skipped: true };
  const storage = opts.storage ?? globalThis.localStorage;
  const search = opts.search ?? globalThis.location?.search ?? '';
  if (
    !isFocusCircleWasHereClientEnabled({
      search,
      storage,
      cloudBaseUrl: opts.getBaseUrl?.() ?? getCloudApiBaseUrl()
    })
  ) {
    return { skipped: true, reason: 'disabled' };
  }
  if (!isFocusCirclePassiveShareEnabled(storage)) {
    return { skipped: true, reason: 'passive_share_off' };
  }
  const dayKey = toLocalDayKey(opts.nowMs ?? Date.now(), opts.timeZone);
  if (readLocalMarkDayKey(storage, dayKey)) {
    return { skipped: true, reason: 'already_marked_today' };
  }
  void postFocusCircleWasHereMark({
    ...opts,
    storage,
    markerDayKey: dayKey
  }).then((result) => {
    if (result.ok) rememberLocalMarkDayKey(storage, dayKey);
  });
  return { skipped: false, scheduled: true };
}

export function resetFocusCircleWasHereForTests() {
  // stateless module; tests use storage resets
}

export { getViewerTimeZone, toLocalDayKey };
