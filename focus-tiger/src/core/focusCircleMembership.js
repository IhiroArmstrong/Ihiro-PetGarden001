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
/** While Privacy / circle UI is open, poll cloud status for memberCount changes. */
export const FOCUS_CIRCLE_STATUS_POLL_MS = 5000;
/** Create / join / leave must fail out so buttons are not stuck on wait cursor. */
export const FOCUS_CIRCLE_MUTATION_TIMEOUT_MS = 12000;
/** In-flight status must not hang the next poll forever. */
export const FOCUS_CIRCLE_STATUS_TIMEOUT_MS = 8000;
export const FOCUS_CIRCLE_RATE_LIMIT_BACKOFF_MS = 20000;

const CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/;

/** @type {ReturnType<typeof setInterval> | null} */
let statusPollTimer = null;
/** @type {(() => void) | null} */
let statusPollOnVisible = null;
let membershipGeneration = 0;
let statusRequestSeq = 0;
let lastAppliedStatusSeq = 0;
let statusPollInFlight = false;
let statusPollBackoffUntil = 0;

export function bumpFocusCircleMembershipGeneration() {
  membershipGeneration += 1;
  return membershipGeneration;
}

export function readFocusCircleMembershipGeneration() {
  return membershipGeneration;
}

/**
 * @param {Promise<unknown>} promise
 * @param {number} timeoutMs
 */
export async function withFocusCircleRequestTimeout(promise, timeoutMs) {
  if (!(timeoutMs > 0)) return promise;
  let timer = null;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error('timeout');
          /** @type {any} */ (err).status = 408;
          reject(err);
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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
    return null;
  }
  const readBack = readFocusCircleMembership(store);
  if (
    !readBack ||
    readBack.circleId !== normalized.circleId ||
    readBack.memberId !== normalized.memberId ||
    readBack.code !== normalized.code
  ) {
    return null;
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
 * @param {number} [opts.timeoutMs]
 */
export async function postFocusCircle({
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  action = 'status',
  code = '',
  circleId = '',
  memberId = '',
  timeoutMs
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
  const waitMs =
    timeoutMs ??
    (action === 'status'
      ? FOCUS_CIRCLE_STATUS_TIMEOUT_MS
      : FOCUS_CIRCLE_MUTATION_TIMEOUT_MS);
  try {
    const body = await withFocusCircleRequestTimeout(
      postJson(FOCUS_CIRCLE_PATH, {
        body: JSON.stringify(payload)
      }),
      waitMs
    );
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
    if (status === 408) return { ok: false, reason: 'timeout', skipped: true };
    if (status === 429) return { ok: false, reason: 'rate_limited', skipped: true };
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
  bumpFocusCircleMembershipGeneration();
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
  if (!writeFocusCircleMembership(storage, result.membership)) {
    return { ok: false, reason: 'storage_failed', membership: result.membership };
  }
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
  bumpFocusCircleMembershipGeneration();
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
  if (!writeFocusCircleMembership(storage, result.membership)) {
    return { ok: false, reason: 'storage_failed', membership: result.membership };
  }
  return result;
}

/**
 * @param {object} [opts]
 */
export async function leaveFocusCircle(opts = {}) {
  bumpFocusCircleMembershipGeneration();
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
  const requestGen = membershipGeneration;
  const requestCircleId = membership.circleId;
  const requestMemberId = membership.memberId;
  const requestSeq = ++statusRequestSeq;
  const result = await postFocusCircle({
    ...opts,
    action: 'status',
    circleId: requestCircleId,
    memberId: requestMemberId
  });
  if (membershipGeneration !== requestGen) {
    return {
      ok: true,
      membership: readFocusCircleMembership(storage),
      stale: true
    };
  }
  const current = readFocusCircleMembership(storage);
  if (
    !current ||
    current.circleId !== requestCircleId ||
    current.memberId !== requestMemberId
  ) {
    return { ok: true, membership: current, stale: true };
  }
  if (requestSeq < lastAppliedStatusSeq) {
    return { ok: true, membership: current, stale: true };
  }
  if (!result.ok || !result.membership) {
    if (result.reason === 'not_found') {
      lastAppliedStatusSeq = requestSeq;
      clearFocusCircleMembership(storage);
      return { ok: true, membership: null, reason: 'not_found' };
    }
    return { ok: false, reason: result.reason ?? 'network', membership: current };
  }
  if (result.membership.isMember === false) {
    lastAppliedStatusSeq = requestSeq;
    clearFocusCircleMembership(storage);
    return { ok: true, membership: null, reason: 'not_member' };
  }
  lastAppliedStatusSeq = requestSeq;
  writeFocusCircleMembership(storage, result.membership);
  return { ok: true, membership: result.membership };
}

/**
 * Poll cloud status while circle settings are visible (e.g. Privacy sheet open).
 * Stops when membership clears or {@link stopFocusCircleStatusPolling} runs.
 *
 * @param {object} [opts]
 * @param {Storage | null | undefined} [opts.storage]
 * @param {string} [opts.search]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {() => string} [opts.getBaseUrl]
 * @param {number} [opts.intervalMs]
 * @param {(result: Awaited<ReturnType<typeof refreshFocusCircleStatus>>) => void} [opts.onUpdate]
 */
export function startFocusCircleStatusPolling(opts = {}) {
  if (statusPollTimer) return;
  const tick = () => {
    if (!readFocusCircleMembership(opts.storage ?? getDefaultStorage())) {
      stopFocusCircleStatusPolling();
      return;
    }
    if (Date.now() < statusPollBackoffUntil) return;
    if (statusPollInFlight) return;
    statusPollInFlight = true;
    void refreshFocusCircleStatus(opts)
      .then((result) => {
        if (result.reason === 'rate_limited') {
          statusPollBackoffUntil = Date.now() + FOCUS_CIRCLE_RATE_LIMIT_BACKOFF_MS;
        }
        if (!result.stale) opts.onUpdate?.(result);
      })
      .finally(() => {
        statusPollInFlight = false;
      });
  };
  tick();
  statusPollTimer = setInterval(
    tick,
    opts.intervalMs ?? FOCUS_CIRCLE_STATUS_POLL_MS
  );
  if (typeof globalThis.addEventListener === 'function') {
    statusPollOnVisible = () => {
      if (globalThis.document?.visibilityState !== 'visible') return;
      tick();
    };
    globalThis.addEventListener('visibilitychange', statusPollOnVisible);
    globalThis.addEventListener('focus', statusPollOnVisible);
  }
}

export function stopFocusCircleStatusPolling() {
  if (statusPollTimer) clearInterval(statusPollTimer);
  statusPollTimer = null;
  statusPollInFlight = false;
  if (
    statusPollOnVisible &&
    typeof globalThis.removeEventListener === 'function'
  ) {
    globalThis.removeEventListener('visibilitychange', statusPollOnVisible);
    globalThis.removeEventListener('focus', statusPollOnVisible);
    statusPollOnVisible = null;
  }
}
