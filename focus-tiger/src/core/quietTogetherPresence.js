/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Anonymous lantern presence client. Heartbeat while sitting; peek on Idle/Arrive.
 * Never gates Sit. Unchanged sitting counts skip DOM writes (caller compares).
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import { isQuietTogetherEnabled } from './quietTogetherPreference.js';

export const LANTERN_PRESENCE_PATH = '/api/lantern-presence';
export const LANTERN_PRESENCE_SCHEMA_VERSION = 1;
export const LANTERN_HEARTBEAT_MS = 45_000;
export const LANTERN_JOIN_DELAY_MS = 2500;
export const LANTERN_PEEK_IDLE_MS = 2500;
export const LANTERN_BUSY_RETRY_MS = 2000;
export const QUIET_TOGETHER_QUERY_PARAM = 'quietTogether';
export const QUIET_TOGETHER_SITTING_EVENT = 'focus-tiger:quiet-together-sitting';

/** @type {string | null} */
let sessionId = null;
/** @type {ReturnType<typeof setInterval> | null} */
let heartbeatTimer = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let joinTimer = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let peekTimer = null;
let sittingSnapshot = null;
let peekInFlight = false;

let busyProbe = () => false;

function readBusyProbe() {
  const v = busyProbe();
  if (v && typeof v === 'object') {
    return { busy: Boolean(v.busy), retry: Boolean(v.retry) };
  }
  return { busy: Boolean(v), retry: false };
}

/**
 * @param {() => boolean | { busy?: boolean, retry?: boolean }} fn
 */
export function setLanternPresenceBusyProbe(fn) {
  busyProbe = typeof fn === 'function' ? fn : () => false;
}

/**
 * @param {string} [search]
 * @returns {'0' | null}
 */
export function readQuietTogetherQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(QUIET_TOGETHER_QUERY_PARAM);
    if (value === '0' || value === 'false') return '0';
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {{ search?: string, storage?: Storage | null, cloudBaseUrl?: string }} [opts]
 */
export function isLanternPresenceClientEnabled({
  search = '',
  storage = globalThis.localStorage,
  cloudBaseUrl = getCloudApiBaseUrl()
} = {}) {
  if (readQuietTogetherQueryFlag(search) === '0') return false;
  if (!isQuietTogetherEnabled(storage)) return false;
  return Boolean(cloudBaseUrl);
}

function newSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-000000000001';
}

function parseSitting(body) {
  if (!body || typeof body !== 'object') return null;
  if (body.schemaVersion !== LANTERN_PRESENCE_SCHEMA_VERSION) return null;
  const n = Number(body.sitting);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(Math.floor(n), 9999);
}

/**
 * @returns {number | null}
 */
export function getLanternSittingSnapshot() {
  return sittingSnapshot;
}

export function resetLanternPresenceForTests() {
  if (joinTimer) clearTimeout(joinTimer);
  if (peekTimer) clearTimeout(peekTimer);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  joinTimer = null;
  peekTimer = null;
  heartbeatTimer = null;
  sessionId = null;
  sittingSnapshot = null;
  peekInFlight = false;
  busyProbe = () => false;
}

/**
 * @param {object} [opts]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {() => string} [opts.getBaseUrl]
 * @param {'peek' | 'heartbeat' | 'leave'} [opts.action]
 * @param {string | null} [opts.sessionId]
 */
export async function postLanternPresence({
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  action = 'peek',
  sessionId: sid = null
} = {}) {
  if (!getBaseUrl()) {
    return { ok: false, reason: 'cloud_api_unconfigured', skipped: true };
  }
  const payload = {
    schemaVersion: LANTERN_PRESENCE_SCHEMA_VERSION,
    action
  };
  if (action !== 'peek') payload.sessionId = sid;
  try {
    const body = await postJson(LANTERN_PRESENCE_PATH, {
      body: JSON.stringify(payload)
    });
    const sitting = parseSitting(body);
    if (sitting == null) {
      return { ok: false, reason: 'bad_payload', skipped: true };
    }
    return { ok: true, sitting, skipped: false };
  } catch {
    return { ok: false, reason: 'network', skipped: true };
  }
}

function rememberSitting(sitting) {
  if (sittingSnapshot === sitting) {
    return { changed: false, sitting };
  }
  sittingSnapshot = sitting;
  try {
    globalThis.dispatchEvent?.(
      new CustomEvent(QUIET_TOGETHER_SITTING_EVENT, { detail: { sitting } })
    );
  } catch {
    // non-DOM tests
  }
  return { changed: true, sitting };
}

/**
 * Idle / Arrive peek. Skips write when the count is unchanged.
 * @param {object} [opts]
 */
export async function peekLanternPresence(opts = {}) {
  if (peekInFlight) return { ok: false, reason: 'in_flight', skipped: true };
  if (
    !isLanternPresenceClientEnabled({
      search: opts.search ?? globalThis.location?.search ?? '',
      storage: opts.storage ?? globalThis.localStorage,
      cloudBaseUrl: opts.getBaseUrl?.() ?? getCloudApiBaseUrl()
    })
  ) {
    sittingSnapshot = null;
    return { ok: false, reason: 'disabled', skipped: true };
  }
  const { busy, retry } = readBusyProbe();
  if (busy) {
    if (retry) {
      scheduleLanternPeek({
        ...opts,
        delayMs: LANTERN_BUSY_RETRY_MS
      });
    }
    return { ok: false, reason: 'busy', skipped: true };
  }
  peekInFlight = true;
  try {
    const result = await postLanternPresence({
      postJson: opts.postJson,
      getBaseUrl: opts.getBaseUrl,
      action: 'peek'
    });
    if (!result.ok) return result;
    const remembered = rememberSitting(result.sitting);
    return { ...result, changed: remembered.changed };
  } finally {
    peekInFlight = false;
  }
}

/**
 * @param {object} [opts]
 * @param {number} [opts.delayMs]
 */
export function scheduleLanternPeek(opts = {}) {
  if (peekTimer) clearTimeout(peekTimer);
  const delayMs = opts.delayMs ?? LANTERN_PEEK_IDLE_MS;
  peekTimer = setTimeout(() => {
    peekTimer = null;
    void peekLanternPresence(opts);
  }, delayMs);
}

async function sendHeartbeat(opts = {}) {
  if (!sessionId) return;
  if (
    !isLanternPresenceClientEnabled({
      search: opts.search ?? globalThis.location?.search ?? '',
      storage: opts.storage ?? globalThis.localStorage
    })
  ) {
    return;
  }
  const result = await postLanternPresence({
    postJson: opts.postJson,
    getBaseUrl: opts.getBaseUrl,
    action: 'heartbeat',
    sessionId
  });
  if (result.ok) rememberSitting(result.sitting);
}

/**
 * Light a lantern after Sit (delayed so Arrival/Idle breath is not blocked).
 */
export function startLanternHeartbeat(opts = {}) {
  stopLanternHeartbeatTimers();
  if (
    !isLanternPresenceClientEnabled({
      search: opts.search ?? globalThis.location?.search ?? '',
      storage: opts.storage ?? globalThis.localStorage
    })
  ) {
    return;
  }
  sessionId = newSessionId();
  const delayMs = opts.joinDelayMs ?? LANTERN_JOIN_DELAY_MS;
  joinTimer = setTimeout(() => {
    joinTimer = null;
    void sendHeartbeat(opts);
    heartbeatTimer = setInterval(() => {
      void sendHeartbeat(opts);
    }, opts.heartbeatMs ?? LANTERN_HEARTBEAT_MS);
  }, delayMs);
}

function stopLanternHeartbeatTimers() {
  if (joinTimer) clearTimeout(joinTimer);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  joinTimer = null;
  heartbeatTimer = null;
}

/**
 * Leave the anonymous room (Rise / complete / opt-out / pagehide).
 */
export async function stopLanternHeartbeat(opts = {}) {
  stopLanternHeartbeatTimers();
  const id = sessionId;
  sessionId = null;
  if (!id) return { ok: true, skipped: true, reason: 'no_session' };
  return postLanternPresence({
    postJson: opts.postJson,
    getBaseUrl: opts.getBaseUrl,
    action: 'leave',
    sessionId: id
  });
}

export function bindLanternPresencePageHide() {
  const onHide = () => {
    void stopLanternHeartbeat();
  };
  globalThis.addEventListener?.('pagehide', onHide);
  return () => globalThis.removeEventListener?.('pagehide', onHide);
}
