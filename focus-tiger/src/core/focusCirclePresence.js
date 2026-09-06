/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Circle sitting presence — heartbeat while sitting; peek on Idle/Arrive.
 * Requires local circle membership. Never gates Sit.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import {
  FOCUS_CIRCLE_PATH,
  FOCUS_CIRCLE_SCHEMA_VERSION,
  isFocusCircleClientEnabled,
  readFocusCircleMembership
} from './focusCircleMembership.js';
import { getViewerTimeZone, toLocalDayKey } from './focusCircleDayKey.js';
import {
  isFocusCircleWasHereClientEnabled,
  readFocusCircleWasHereQueryFlag
} from './focusCircleWasHere.js';
import {
  LANTERN_BUSY_RETRY_MS,
  LANTERN_HEARTBEAT_MS,
  LANTERN_IDLE_OBSERVER_PEEK_MS,
  LANTERN_JOIN_DELAY_MS,
  LANTERN_PEEK_IDLE_MS
} from './quietTogetherPresence.js';

export const FOCUS_CIRCLE_SITTING_EVENT = 'focus-tiger:focus-circle-sitting';

export {
  LANTERN_BUSY_RETRY_MS as FOCUS_CIRCLE_BUSY_RETRY_MS,
  LANTERN_HEARTBEAT_MS as FOCUS_CIRCLE_HEARTBEAT_MS,
  LANTERN_IDLE_OBSERVER_PEEK_MS as FOCUS_CIRCLE_IDLE_OBSERVER_PEEK_MS,
  LANTERN_JOIN_DELAY_MS as FOCUS_CIRCLE_JOIN_DELAY_MS,
  LANTERN_PEEK_IDLE_MS as FOCUS_CIRCLE_PEEK_IDLE_MS
};

/** @type {ReturnType<typeof setInterval> | null} */
let heartbeatTimer = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let joinTimer = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let peekTimer = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let idleObserverTimer = null;
let idleObserverActive = false;
/** @type {object | null} */
let idleObserverOpts = null;
let sittingOthersSnapshot = null;
let hereTodayOthersSnapshot = null;
let peekInFlight = false;
let contributing = false;

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
export function setFocusCirclePresenceBusyProbe(fn) {
  busyProbe = typeof fn === 'function' ? fn : () => false;
}

/**
 * @param {{ search?: string, storage?: Storage | null, cloudBaseUrl?: string }} [opts]
 */
export function isFocusCirclePresenceClientEnabled({
  search = '',
  storage = globalThis.localStorage,
  cloudBaseUrl = getCloudApiBaseUrl()
} = {}) {
  if (!isFocusCircleClientEnabled({ search, cloudBaseUrl })) return false;
  return Boolean(readFocusCircleMembership(storage));
}

function parseSittingOthers(body) {
  if (!body || typeof body !== 'object') return null;
  if (body.schemaVersion !== FOCUS_CIRCLE_SCHEMA_VERSION) return null;
  const n = Number(body.sittingOthers);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(Math.floor(n), 7);
}

function parseHereTodayOthers(body) {
  if (!body || typeof body !== 'object') return null;
  if (body.schemaVersion !== FOCUS_CIRCLE_SCHEMA_VERSION) return null;
  if (!('hereTodayOthers' in body)) return null;
  const n = Number(body.hereTodayOthers);
  if (!Number.isFinite(n) || n < 0) return null;
  return n >= 1 ? 1 : 0;
}

/**
 * @returns {number | null}
 */
export function getFocusCircleSittingOthersSnapshot() {
  return sittingOthersSnapshot;
}

/**
 * @returns {number | null}
 */
export function getFocusCircleHereTodayOthersSnapshot() {
  return hereTodayOthersSnapshot;
}

export function setFocusCirclePresenceContributing(value) {
  contributing = Boolean(value);
}

export function isFocusCirclePresenceContributing() {
  return contributing;
}

export function resetFocusCirclePresenceForTests() {
  if (joinTimer) clearTimeout(joinTimer);
  if (peekTimer) clearTimeout(peekTimer);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  stopFocusCircleIdleObserverPeek();
  joinTimer = null;
  peekTimer = null;
  heartbeatTimer = null;
  sittingOthersSnapshot = null;
  hereTodayOthersSnapshot = null;
  peekInFlight = false;
  contributing = false;
  busyProbe = () => false;
}

/**
 * @param {object} [opts]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {() => string} [opts.getBaseUrl]
 * @param {'presence_peek' | 'presence_heartbeat' | 'presence_leave'} [opts.action]
 * @param {string} [opts.circleId]
 * @param {string} [opts.memberId]
 * @param {Storage | null} [opts.storage]
 */
export async function postFocusCirclePresence({
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  action = 'presence_peek',
  circleId = '',
  memberId = '',
  storage = globalThis.localStorage
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
    action,
    circleId: circleId || membership.circleId,
    memberId: memberId || membership.memberId
  };
  if (
    action === 'presence_peek' &&
    isFocusCircleWasHereClientEnabled({
      storage,
      cloudBaseUrl: getBaseUrl()
    })
  ) {
    payload.viewerDayKey = toLocalDayKey();
    payload.viewerTimeZone = getViewerTimeZone();
  }
  try {
    const body = await postJson(FOCUS_CIRCLE_PATH, {
      body: JSON.stringify(payload)
    });
    const sittingOthers = parseSittingOthers(body);
    if (sittingOthers == null) {
      return { ok: false, reason: 'bad_payload', skipped: true };
    }
    const hereTodayOthers = parseHereTodayOthers(body);
    return {
      ok: true,
      sittingOthers,
      hereTodayOthers,
      skipped: false
    };
  } catch {
    return { ok: false, reason: 'network', skipped: true };
  }
}

function rememberPresencePeek(sittingOthers, hereTodayOthers) {
  const sittingChanged = sittingOthersSnapshot !== sittingOthers;
  const hereChanged =
    hereTodayOthers != null && hereTodayOthersSnapshot !== hereTodayOthers;
  sittingOthersSnapshot = sittingOthers;
  if (hereTodayOthers != null) {
    hereTodayOthersSnapshot = hereTodayOthers;
  }
  if (!sittingChanged && !hereChanged) {
    return { changed: false, sittingOthers, hereTodayOthers };
  }
  try {
    globalThis.dispatchEvent?.(
      new CustomEvent(FOCUS_CIRCLE_SITTING_EVENT, {
        detail: { sittingOthers, hereTodayOthers: hereTodayOthersSnapshot }
      })
    );
  } catch {
    // non-DOM tests
  }
  return {
    changed: sittingChanged || hereChanged,
    sittingOthers,
    hereTodayOthers: hereTodayOthersSnapshot
  };
}

/**
 * @param {object} [opts]
 */
export async function peekFocusCirclePresence(opts = {}) {
  if (peekInFlight) return { ok: false, reason: 'in_flight', skipped: true };
  if (
    !isFocusCirclePresenceClientEnabled({
      search: opts.search ?? globalThis.location?.search ?? '',
      storage: opts.storage ?? globalThis.localStorage,
      cloudBaseUrl: opts.getBaseUrl?.() ?? getCloudApiBaseUrl()
    })
  ) {
    sittingOthersSnapshot = null;
    return { ok: false, reason: 'disabled', skipped: true };
  }
  const { busy, retry } = readBusyProbe();
  if (busy) {
    if (retry) {
      scheduleFocusCirclePeek({
        ...opts,
        delayMs: LANTERN_BUSY_RETRY_MS
      });
    }
    return { ok: false, reason: 'busy', skipped: true };
  }
  peekInFlight = true;
  try {
    const result = await postFocusCirclePresence({
      ...opts,
      action: 'presence_peek'
    });
    if (!result.ok) return result;
    const remembered = rememberPresencePeek(
      result.sittingOthers,
      result.hereTodayOthers
    );
    return { ...result, changed: remembered.changed };
  } finally {
    peekInFlight = false;
  }
}

/**
 * @param {object} [opts]
 * @param {number} [opts.delayMs]
 */
export function scheduleFocusCirclePeek(opts = {}) {
  if (peekTimer) clearTimeout(peekTimer);
  const delayMs = opts.delayMs ?? LANTERN_PEEK_IDLE_MS;
  peekTimer = setTimeout(() => {
    peekTimer = null;
    void peekFocusCirclePresence(opts);
  }, delayMs);
}

function clearIdleObserverTimer() {
  if (idleObserverTimer) clearTimeout(idleObserverTimer);
  idleObserverTimer = null;
}

export function stopFocusCircleIdleObserverPeek() {
  idleObserverActive = false;
  idleObserverOpts = null;
  clearIdleObserverTimer();
}

async function runIdleObserverPeekTick() {
  if (!idleObserverActive) return;
  await peekFocusCirclePresence(idleObserverOpts ?? {});
  if (!idleObserverActive) return;
  clearIdleObserverTimer();
  const intervalMs =
    idleObserverOpts?.intervalMs ?? LANTERN_IDLE_OBSERVER_PEEK_MS;
  idleObserverTimer = setTimeout(() => {
    idleObserverTimer = null;
    void runIdleObserverPeekTick();
  }, intervalMs);
}

/**
 * @param {object} [opts]
 */
export function startFocusCircleIdleObserverPeek(opts = {}) {
  stopFocusCircleIdleObserverPeek();
  if (
    !isFocusCirclePresenceClientEnabled({
      search: opts.search ?? globalThis.location?.search ?? '',
      storage: opts.storage ?? globalThis.localStorage,
      cloudBaseUrl: opts.getBaseUrl?.() ?? getCloudApiBaseUrl()
    })
  ) {
    return;
  }
  idleObserverActive = true;
  idleObserverOpts = opts;
  clearIdleObserverTimer();
  const delayMs = opts.delayMs ?? LANTERN_PEEK_IDLE_MS;
  idleObserverTimer = setTimeout(() => {
    idleObserverTimer = null;
    void runIdleObserverPeekTick();
  }, delayMs);
}

async function sendHeartbeat(opts = {}) {
  if (
    !isFocusCirclePresenceClientEnabled({
      search: opts.search ?? globalThis.location?.search ?? '',
      storage: opts.storage ?? globalThis.localStorage,
      cloudBaseUrl: opts.getBaseUrl?.() ?? getCloudApiBaseUrl()
    })
  ) {
    return;
  }
  const result = await postFocusCirclePresence({
    ...opts,
    action: 'presence_heartbeat'
  });
  if (result.ok) {
    rememberPresencePeek(result.sittingOthers, result.hereTodayOthers);
  }
}

/**
 * Heartbeat while sitting (Sit / breath / ritual).
 * @param {object} [opts]
 */
export function startFocusCircleHeartbeat(opts = {}) {
  stopFocusCircleHeartbeatTimers();
  if (
    !isFocusCirclePresenceClientEnabled({
      search: opts.search ?? globalThis.location?.search ?? '',
      storage: opts.storage ?? globalThis.localStorage,
      cloudBaseUrl: opts.getBaseUrl?.() ?? getCloudApiBaseUrl()
    })
  ) {
    return;
  }
  const delayMs = opts.joinDelayMs ?? LANTERN_JOIN_DELAY_MS;
  joinTimer = setTimeout(() => {
    joinTimer = null;
    void sendHeartbeat(opts);
    heartbeatTimer = setInterval(() => {
      void sendHeartbeat(opts);
    }, opts.heartbeatMs ?? LANTERN_HEARTBEAT_MS);
  }, delayMs);
}

function stopFocusCircleHeartbeatTimers() {
  if (joinTimer) clearTimeout(joinTimer);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  joinTimer = null;
  heartbeatTimer = null;
}

/**
 * @param {object} [opts]
 */
export async function stopFocusCircleHeartbeat(opts = {}) {
  stopFocusCircleHeartbeatTimers();
  if (
    !isFocusCirclePresenceClientEnabled({
      search: opts.search ?? globalThis.location?.search ?? '',
      storage: opts.storage ?? globalThis.localStorage,
      cloudBaseUrl: opts.getBaseUrl?.() ?? getCloudApiBaseUrl()
    })
  ) {
    return { ok: true, skipped: true, reason: 'disabled' };
  }
  const result = await postFocusCirclePresence({
    ...opts,
    action: 'presence_leave'
  });
  if (result.ok) {
    rememberPresencePeek(result.sittingOthers, result.hereTodayOthers);
  }
  return result;
}

export function bindFocusCirclePresencePageHide() {
  const onHide = () => {
    void stopFocusCircleHeartbeat();
  };
  globalThis.addEventListener?.('pagehide', onHide);
  return () => globalThis.removeEventListener?.('pagehide', onHide);
}

/**
 * @param {() => boolean} [isIdle]
 */
export function bindFocusCirclePresenceVisibilityPeek(isIdle = () => true) {
  const onVisible = () => {
    if (globalThis.document?.visibilityState !== 'visible') return;
    if (!isIdle()) return;
    scheduleFocusCirclePeek();
  };
  globalThis.document?.addEventListener?.('visibilitychange', onVisible);
  return () =>
    globalThis.document?.removeEventListener?.('visibilitychange', onVisible);
}

/**
 * Clear local snapshot when membership is removed.
 */
export function clearFocusCirclePresenceSnapshot() {
  sittingOthersSnapshot = null;
  hereTodayOthersSnapshot = null;
  try {
    globalThis.dispatchEvent?.(
      new CustomEvent(FOCUS_CIRCLE_SITTING_EVENT, {
        detail: { sittingOthers: null, hereTodayOthers: null }
      })
    );
  } catch {
    // non-DOM tests
  }
}

export { readFocusCircleWasHereQueryFlag };
