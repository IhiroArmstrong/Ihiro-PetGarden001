/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * One-time beside-seat codes. Does not gate Sit.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import { getViewerTimeZone, toLocalDayKey } from './focusCircleDayKey.js';
import {
  FOCUS_CIRCLE_MUTATION_TIMEOUT_MS,
  FOCUS_CIRCLE_PATH,
  FOCUS_CIRCLE_SCHEMA_VERSION,
  isFocusCircleClientEnabled,
  newFocusCircleMemberId,
  normalizeFocusCircleCode,
  readFocusCircleMembership,
  setFocusCircleBesideSink,
  withFocusCircleRequestTimeout,
  writeFocusCircleMembership
} from './focusCircleMembership.js';

export const BESIDE_SEAT_QUERY_PARAM = 'besideSeat';
export const BESIDE_JOIN_QUERY_PARAM = 'besideJoin';
export const BESIDE_CODE_LENGTH = 8;
export const BESIDE_UNUSED_QUOTA = 5;
export const BESIDE_SNAPSHOT_STORAGE_KEY = 'focus-tiger.focus-circle-beside.v1';

const CODE_RE = /^[A-HJ-NP-Z2-9]{8}$/;

/** Sit never reads this. */
export function besideSeatBlocksSit() {
  return false;
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeBesideCode(value) {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return CODE_RE.test(code) ? code : null;
}

/**
 * @param {string} [search]
 * @returns {'0' | null}
 */
export function readBesideSeatQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(BESIDE_SEAT_QUERY_PARAM);
    if (value === '0' || value === 'false') return '0';
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {string} [search]
 */
export function isBesideSeatClientEnabled(search = '') {
  return readBesideSeatQueryFlag(search) !== '0' && isFocusCircleClientEnabled({ search });
}

/**
 * @param {string} [search]
 * @returns {string | null}
 */
export function readBesideJoinQueryCode(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    return normalizeBesideCode(new URLSearchParams(q).get(BESIDE_JOIN_QUERY_PARAM) ?? '');
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readBesideSnapshot(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(BESIDE_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const unused = Array.isArray(parsed.unused)
      ? parsed.unused.map((code) => normalizeBesideCode(code)).filter(Boolean)
      : [];
    const remaining = Number(parsed.remaining);
    return {
      unused,
      remaining: Number.isFinite(remaining) ? remaining : BESIDE_UNUSED_QUOTA,
      invitedWasHere: parsed.invitedWasHere === true,
      invitedWasHereName:
        typeof parsed.invitedWasHereName === 'string' && parsed.invitedWasHereName.trim()
          ? parsed.invitedWasHereName.trim()
          : null
    };
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {ReturnType<typeof readBesideSnapshot>} snapshot
 */
export function writeBesideSnapshot(storage, snapshot) {
  if (!storage) return;
  try {
    if (!snapshot) {
      storage.removeItem(BESIDE_SNAPSHOT_STORAGE_KEY);
      return;
    }
    storage.setItem(BESIDE_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // quota
  }
}

setFocusCircleBesideSink((fields) => {
  const storage = globalThis.localStorage;
  if (!storage) return;
  if (!fields) {
    writeBesideSnapshot(storage, null);
    return;
  }
  writeBesideSnapshot(storage, {
    unused: fields.unused,
    remaining: fields.remaining ?? BESIDE_UNUSED_QUOTA,
    invitedWasHere: fields.invitedWasHere,
    invitedWasHereName: fields.invitedWasHereName
  });
});

/**
 * @param {unknown} err
 */
function mapBesideError(err) {
  const status = err && typeof err === 'object' ? Number(err.status) : 0;
  const code =
    err && typeof err === 'object' && err.body && typeof err.body === 'object'
      ? String(err.body.error || '')
      : '';
  if (status === 408) return 'timeout';
  if (code === 'beside_quota') return 'beside_quota';
  if (code === 'beside_used') return 'beside_used';
  if (code === 'circle_full') return 'circle_full';
  if (code === 'beside_not_found' || status === 404) return 'beside_not_found';
  if (code === 'bad_beside_code') return 'bad_beside_code';
  if (code === 'not_member') return 'not_member';
  return 'network';
}

/**
 * @param {object} opts
 * @param {'beside_issue' | 'beside_join' | 'beside_revoke'} opts.action
 */
async function postBeside(opts) {
  const {
    postJson = postCloudJson,
    getBaseUrl = getCloudApiBaseUrl,
    action,
    code = '',
    circleId = '',
    memberId = '',
    search = ''
  } = opts;
  if (!isBesideSeatClientEnabled(search) || !getBaseUrl()) {
    return { ok: false, reason: 'disabled', skipped: true };
  }
  const payload = {
    schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
    action,
    viewerDayKey: toLocalDayKey(),
    viewerTimeZone: getViewerTimeZone()
  };
  if (action === 'beside_join') {
    payload.code = code;
    payload.memberId = memberId;
  } else {
    payload.circleId = circleId;
    payload.memberId = memberId;
    if (action === 'beside_revoke') payload.code = code;
  }
  try {
    const body = await withFocusCircleRequestTimeout(
      postJson(FOCUS_CIRCLE_PATH, { body: JSON.stringify(payload) }, {
        timeoutMs: FOCUS_CIRCLE_MUTATION_TIMEOUT_MS
      }),
      FOCUS_CIRCLE_MUTATION_TIMEOUT_MS
    );
    return { ok: true, body, skipped: false };
  } catch (err) {
    return { ok: false, reason: mapBesideError(err), skipped: true };
  }
}

/**
 * @param {object} [opts]
 */
export async function issueBesideSeat(opts = {}) {
  const storage = opts.storage ?? globalThis.localStorage;
  const search = opts.search ?? '';
  const membership = readFocusCircleMembership(storage);
  if (!membership) return { ok: false, reason: 'need_circle', skipped: true };
  const result = await postBeside({
    ...opts,
    action: 'beside_issue',
    circleId: membership.circleId,
    memberId: membership.memberId,
    search
  });
  if (!result.ok) return result;
  const besideCode = normalizeBesideCode(result.body?.besideCode);
  if (!besideCode) return { ok: false, reason: 'network', skipped: true };
  const unused = Array.isArray(result.body.besideUnused)
    ? result.body.besideUnused.map((code) => normalizeBesideCode(code)).filter(Boolean)
    : [besideCode];
  writeBesideSnapshot(storage, {
    unused,
    remaining: Number(result.body.besideRemaining),
    invitedWasHere: result.body.invitedWasHere === true,
    invitedWasHereName:
      typeof result.body.invitedWasHereName === 'string'
        ? result.body.invitedWasHereName
        : null
  });
  return { ok: true, besideCode, skipped: false };
}

/**
 * @param {object} [opts]
 */
export async function revokeBesideSeat(opts = {}) {
  const storage = opts.storage ?? globalThis.localStorage;
  const membership = readFocusCircleMembership(storage);
  const code = normalizeBesideCode(opts.code);
  if (!membership) return { ok: false, reason: 'need_circle', skipped: true };
  if (!code) return { ok: false, reason: 'bad_beside_code', skipped: true };
  const result = await postBeside({
    ...opts,
    action: 'beside_revoke',
    code,
    circleId: membership.circleId,
    memberId: membership.memberId,
    search: opts.search ?? ''
  });
  if (!result.ok) return result;
  const unused = Array.isArray(result.body?.besideUnused)
    ? result.body.besideUnused.map((item) => normalizeBesideCode(item)).filter(Boolean)
    : [];
  writeBesideSnapshot(storage, {
    unused,
    remaining: Number(result.body?.besideRemaining),
    invitedWasHere: result.body?.invitedWasHere === true,
    invitedWasHereName:
      typeof result.body?.invitedWasHereName === 'string'
        ? result.body.invitedWasHereName
        : null
  });
  return { ok: true, skipped: false };
}

/**
 * @param {object} [opts]
 */
export async function joinBesideSeat(opts = {}) {
  const storage = opts.storage ?? globalThis.localStorage;
  const search = opts.search ?? '';
  const code = normalizeBesideCode(opts.code);
  if (!isBesideSeatClientEnabled(search)) {
    return { ok: false, reason: 'disabled', skipped: true };
  }
  if (!code) return { ok: false, reason: 'bad_beside_code', skipped: true };
  const memberId = readFocusCircleMembership(storage)?.memberId ?? newFocusCircleMemberId();
  const result = await postBeside({
    ...opts,
    action: 'beside_join',
    code,
    memberId,
    search
  });
  if (!result.ok) return result;
  const circleCode = normalizeFocusCircleCode(result.body?.code);
  const circleId = typeof result.body?.circleId === 'string' ? result.body.circleId : '';
  const savedMemberId =
    typeof result.body?.memberId === 'string' ? result.body.memberId : memberId;
  const saved = writeFocusCircleMembership(storage, {
    circleId,
    memberId: savedMemberId,
    code: circleCode,
    memberCount: Number(result.body?.memberCount)
  });
  if (!saved) return { ok: false, reason: 'storage_failed', skipped: true };
  return { ok: true, membership: saved, skipped: false };
}
