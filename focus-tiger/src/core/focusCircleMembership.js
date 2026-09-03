/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Circle — local membership + cloud create/join/leave/status.
 * No account. Optional social layer under Privacy.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';

export const FOCUS_CIRCLE_STORAGE_KEY = 'focus-tiger.focus-circle.v1';
export const FOCUS_CIRCLE_PATH = '/api/focus-circle';
export const FOCUS_CIRCLE_SCHEMA_VERSION = 1;
export const FOCUS_CIRCLE_QUERY_PARAM = 'focusCircle';
export const FOCUS_CIRCLE_JOIN_QUERY_PARAM = 'circleJoin';
export const FOCUS_CIRCLE_CHANGE_EVENT = 'focus-tiger:focus-circle-change';
export const FOCUS_CIRCLE_MAX_MEMBERS = 8;

const CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/;

/**
 * @param {unknown} raw
 * @returns {{ circleId: string, memberId: string, code: string, memberCount?: number } | null}
 */
export function normalizeFocusCircleMembership(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const circleId = typeof o.circleId === 'string' ? o.circleId.trim() : '';
  const memberId = typeof o.memberId === 'string' ? o.memberId.trim() : '';
  const code = normalizeFocusCircleCode(o.code);
  if (!circleId || !memberId || !code) return null;
  const memberCount = Number(o.memberCount);
  return {
    circleId,
    memberId,
    code,
    memberCount: Number.isFinite(memberCount) ? Math.max(0, Math.floor(memberCount)) : undefined
  };
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeFocusCircleCode(value) {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return CODE_RE.test(code) ? code : null;
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ circleId: string, memberId: string, code: string, memberCount?: number } | null}
 */
export function readFocusCircleMembership(storage) {
  const store = storage ?? getDefaultStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(FOCUS_CIRCLE_STORAGE_KEY);
    if (!raw) return null;
    return normalizeFocusCircleMembership(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ circleId: string, memberId: string, code: string, memberCount?: number } | null} membership
 */
export function writeFocusCircleMembership(storage, membership) {
  const store = storage ?? getDefaultStorage();
  if (!store) return null;
  if (!membership) {
    try {
      store.removeItem(FOCUS_CIRCLE_STORAGE_KEY);
    } catch {
      // quota / private mode
    }
    dispatchFocusCircleChange();
    return null;
  }
  const normalized = normalizeFocusCircleMembership(membership);
  if (!normalized) return null;
  const prev = readFocusCircleMembership(store);
  const nextJson = JSON.stringify(normalized);
  if (prev && JSON.stringify(prev) === nextJson) {
    return normalized;
  }
  try {
    store.setItem(FOCUS_CIRCLE_STORAGE_KEY, nextJson);
  } catch {
    // quota / private mode
  }
  dispatchFocusCircleChange();
  return normalized;
}

export function clearFocusCircleMembership(storage) {
  return writeFocusCircleMembership(storage, null);
}

function dispatchFocusCircleChange() {
  try {
    globalThis.dispatchEvent?.(new Event(FOCUS_CIRCLE_CHANGE_EVENT));
  } catch {
    // non-DOM tests
  }
}

/**
 * @param {string} [search]
 * @returns {'0' | null}
 */
export function readFocusCircleQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(FOCUS_CIRCLE_QUERY_PARAM);
    if (value === '0' || value === 'false') return '0';
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {string} [search]
 * @returns {string | null}
 */
export function readCircleJoinQueryCode(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    return normalizeFocusCircleCode(new URLSearchParams(q).get(FOCUS_CIRCLE_JOIN_QUERY_PARAM) ?? '');
  } catch {
    return null;
  }
}

/**
 * @param {{ search?: string, cloudBaseUrl?: string }} [opts]
 */
export function isFocusCircleClientEnabled({
  search = '',
  cloudBaseUrl = getCloudApiBaseUrl()
} = {}) {
  if (readFocusCircleQueryFlag(search) === '0') return false;
  return Boolean(cloudBaseUrl);
}

export function newFocusCircleMemberId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-000000000001';
}

/**
 * @param {unknown} body
 */
function parseCircleResponse(body) {
  if (!body || typeof body !== 'object') return null;
  if (body.schemaVersion !== FOCUS_CIRCLE_SCHEMA_VERSION) return null;
  if (body.ok !== true) return null;
  const circleId = typeof body.circleId === 'string' ? body.circleId.trim() : '';
  const memberId = typeof body.memberId === 'string' ? body.memberId.trim() : '';
  const code = normalizeFocusCircleCode(body.code);
  const memberCount = Number(body.memberCount);
  if (!circleId || !memberId || !code || !Number.isFinite(memberCount)) return null;
  const isMember = body.isMember === undefined ? true : body.isMember === true;
  return {
    circleId,
    memberId,
    code,
    memberCount: Math.max(0, Math.floor(memberCount)),
    isMember
  };
}

/**
 * @param {object} [opts]
 * @param {'create' | 'join' | 'leave' | 'status'} [opts.action]
 * @param {string} [opts.code]
 * @param {string} [opts.circleId]
 * @param {string} [opts.memberId]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {() => string} [opts.getBaseUrl]
 */
export async function postFocusCircle({
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  action = 'status',
  code = '',
  circleId = '',
  memberId = ''
} = {}) {
  if (!getBaseUrl()) {
    return { ok: false, reason: 'cloud_api_unconfigured', skipped: true };
  }
  const payload = {
    schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
    action
  };
  if (action === 'join') payload.code = code;
  if (action !== 'create' && action !== 'join') {
    payload.circleId = circleId;
    payload.memberId = memberId;
  }
  if (action === 'create' || action === 'join') {
    payload.memberId = memberId;
  }
  try {
    const body = await postJson(FOCUS_CIRCLE_PATH, {
      body: JSON.stringify(payload)
    });
    if (action === 'leave') {
      if (!body || body.ok !== true) {
        return { ok: false, reason: 'bad_payload', skipped: true };
      }
      return { ok: true, left: true, skipped: false };
    }
    const parsed = parseCircleResponse(body);
    if (!parsed) {
      return { ok: false, reason: 'bad_payload', skipped: true };
    }
    return { ok: true, membership: parsed, skipped: false };
  } catch (err) {
    const status = err && typeof err === 'object' ? Number(err.status) : 0;
    if (status === 404) return { ok: false, reason: 'not_found', skipped: true };
    if (status === 409) return { ok: false, reason: 'circle_full', skipped: true };
    return { ok: false, reason: 'network', skipped: true };
  }
}

/**
 * @param {object} [opts]
 */
export async function createFocusCircle(opts = {}) {
  const storage = opts.storage ?? getDefaultStorage();
  if (!isFocusCircleClientEnabled({ search: opts.search, cloudBaseUrl: opts.getBaseUrl?.() })) {
    return { ok: false, reason: 'disabled' };
  }
  const existing = readFocusCircleMembership(storage);
  if (existing) {
    const left = await leaveFocusCircle({ ...opts, membership: existing });
    if (!left.ok && left.reason !== 'not_found') {
      return { ok: false, reason: left.reason ?? 'leave_failed' };
    }
  }
  const memberId = newFocusCircleMemberId();
  const result = await postFocusCircle({ ...opts, action: 'create', memberId });
  if (!result.ok || !result.membership) return result;
  writeFocusCircleMembership(storage, result.membership);
  return result;
}

/**
 * @param {object} [opts]
 * @param {string} [opts.code]
 */
export async function joinFocusCircle(opts = {}) {
  const storage = opts.storage ?? getDefaultStorage();
  const code = normalizeFocusCircleCode(opts.code ?? '');
  if (!code) return { ok: false, reason: 'bad_code' };
  if (!isFocusCircleClientEnabled({ search: opts.search, cloudBaseUrl: opts.getBaseUrl?.() })) {
    return { ok: false, reason: 'disabled' };
  }
  const existing = readFocusCircleMembership(storage);
  if (existing) {
    const left = await leaveFocusCircle({ ...opts, membership: existing });
    if (!left.ok && left.reason !== 'not_found') {
      return { ok: false, reason: left.reason ?? 'leave_failed' };
    }
  }
  const memberId = newFocusCircleMemberId();
  const result = await postFocusCircle({ ...opts, action: 'join', code, memberId });
  if (!result.ok || !result.membership) return result;
  writeFocusCircleMembership(storage, result.membership);
  return result;
}

/**
 * @param {object} [opts]
 */
export async function leaveFocusCircle(opts = {}) {
  const storage = opts.storage ?? getDefaultStorage();
  const membership = opts.membership ?? readFocusCircleMembership(storage);
  if (!membership) return { ok: true, reason: 'no_membership' };
  clearFocusCircleMembership(storage);
  if (!isFocusCircleClientEnabled({ search: opts.search, cloudBaseUrl: opts.getBaseUrl?.() })) {
    return { ok: true, reason: 'local_only' };
  }
  const result = await postFocusCircle({
    ...opts,
    action: 'leave',
    circleId: membership.circleId,
    memberId: membership.memberId
  });
  if (!result.ok && result.reason === 'not_found') {
    return { ok: true, reason: 'not_found' };
  }
  return result;
}

/**
 * @param {object} [opts]
 */
export async function refreshFocusCircleStatus(opts = {}) {
  const storage = opts.storage ?? getDefaultStorage();
  const membership = readFocusCircleMembership(storage);
  if (!membership) return { ok: true, membership: null };
  if (!isFocusCircleClientEnabled({ search: opts.search, cloudBaseUrl: opts.getBaseUrl?.() })) {
    return { ok: true, membership };
  }
  const result = await postFocusCircle({
    ...opts,
    action: 'status',
    circleId: membership.circleId,
    memberId: membership.memberId
  });
  if (!result.ok || !result.membership) {
    if (result.reason === 'not_found') {
      clearFocusCircleMembership(storage);
      return { ok: true, membership: null, reason: 'not_found' };
    }
    return { ok: false, reason: result.reason ?? 'network', membership };
  }
  if (result.membership.isMember === false) {
    clearFocusCircleMembership(storage);
    return { ok: true, membership: null, reason: 'not_member' };
  }
  writeFocusCircleMembership(storage, result.membership);
  return { ok: true, membership: result.membership };
}
