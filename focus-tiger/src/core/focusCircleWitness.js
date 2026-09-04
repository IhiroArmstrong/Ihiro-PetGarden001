/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Circle Gentle Witness — peek on Idle/Arrive; leave/respond on user confirm.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import {
  FOCUS_CIRCLE_PATH,
  FOCUS_CIRCLE_SCHEMA_VERSION,
  isFocusCircleClientEnabled,
  readFocusCircleMembership
} from './focusCircleMembership.js';
import {
  LANTERN_BUSY_RETRY_MS,
  LANTERN_IDLE_OBSERVER_PEEK_MS,
  LANTERN_PEEK_IDLE_MS
} from './quietTogetherPresence.js';

export const FOCUS_CIRCLE_WITNESS_QUERY_PARAM = 'focusCircleWitness';
export const FOCUS_CIRCLE_WITNESS_CHANGE_EVENT =
  'focus-tiger:focus-circle-witness-change';
export const FOCUS_CIRCLE_WITNESS_RESPONDED_STORAGE_KEY =
  'focus-tiger.focus-circle-witness-responded.v1';
export const FOCUS_CIRCLE_WITNESS_MIN_SESSION_SECONDS = 60;
export const FOCUS_CIRCLE_WITNESS_LEAVE_DELAY_MS = 3000;
export const FOCUS_CIRCLE_WITNESS_LEAVE_RETRY_MS = 1500;

export {
  LANTERN_BUSY_RETRY_MS as FOCUS_CIRCLE_WITNESS_BUSY_RETRY_MS,
  LANTERN_IDLE_OBSERVER_PEEK_MS as FOCUS_CIRCLE_WITNESS_IDLE_OBSERVER_PEEK_MS,
  LANTERN_PEEK_IDLE_MS as FOCUS_CIRCLE_WITNESS_PEEK_IDLE_MS
};

/** @type {ReturnType<typeof setTimeout> | null} */
let peekTimer = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let idleObserverTimer = null;
let idleObserverActive = false;
/** @type {object | null} */
let idleObserverOpts = null;
let peekInFlight = false;
/** @type {{ traceId: string, phraseKey: string, hasResponded: boolean, respondPhraseKey?: string } | null} */
let witnessPeekSnapshot = null;
let witnessPromptedThisSession = false;

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
export function setFocusCircleWitnessBusyProbe(fn) {
  busyProbe = typeof fn === 'function' ? fn : () => false;
}

/**
 * @param {string} [search]
 * @returns {'0' | null}
 */
export function readFocusCircleWitnessQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(FOCUS_CIRCLE_WITNESS_QUERY_PARAM);
    if (value === '0' || value === 'false') return '0';
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {{ search?: string, storage?: Storage | null, cloudBaseUrl?: string }} [opts]
 */
export function isFocusCircleWitnessClientEnabled({
  search = '',
  storage = globalThis.localStorage,
  cloudBaseUrl = getCloudApiBaseUrl()
} = {}) {
  if (readFocusCircleWitnessQueryFlag(search) === '0') return false;
  if (!isFocusCircleClientEnabled({ search, cloudBaseUrl })) return false;
  return Boolean(readFocusCircleMembership(storage));
}

/**
 * @returns {typeof witnessPeekSnapshot}
 */
export function getFocusCircleWitnessPeekSnapshot() {
  return witnessPeekSnapshot;
}

export function resetFocusCircleWitnessSessionPrompt() {
  witnessPromptedThisSession = false;
}

export function hasWitnessPromptedThisSession() {
  return witnessPromptedThisSession;
}

export function markWitnessPromptedThisSession() {
  witnessPromptedThisSession = true;
}

export function resetFocusCircleWitnessForTests() {
  if (peekTimer) clearTimeout(peekTimer);
  stopFocusCircleWitnessIdleObserverPeek();
  peekTimer = null;
  peekInFlight = false;
  witnessPeekSnapshot = null;
  witnessPromptedThisSession = false;
  busyProbe = () => false;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {Set<string>}
 */
export function readRespondedTraceIds(storage) {
  const store = storage ?? globalThis.localStorage ?? null;
  if (!store) return new Set();
  try {
    const raw = store.getItem(FOCUS_CIRCLE_WITNESS_RESPONDED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === 'string' && id));
  } catch {
    return new Set();
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} traceId
 */
export function rememberRespondedTraceId(storage, traceId) {
  const store = storage ?? globalThis.localStorage ?? null;
  if (!store || !traceId) return;
  const ids = readRespondedTraceIds(store);
  if (ids.has(traceId)) return;
  ids.add(traceId);
  try {
    store.setItem(
      FOCUS_CIRCLE_WITNESS_RESPONDED_STORAGE_KEY,
      JSON.stringify([...ids].slice(-64))
    );
  } catch {
    // quota / private mode
  }
}

/**
 * @param {unknown[]} traces
 * @param {Set<string>} respondedIds
 * @returns {{ traceId: string, phraseKey: string, hasResponded: boolean, respondPhraseKey?: string } | null}
 */
export function pickIdleWitnessTrace(traces, respondedIds) {
  if (!Array.isArray(traces)) return null;
  for (const row of traces) {
    if (!row || typeof row !== 'object') continue;
    const traceId = typeof row.traceId === 'string' ? row.traceId : '';
    const phraseKey = typeof row.phraseKey === 'string' ? row.phraseKey : '';
    if (!traceId || !phraseKey) continue;
    const hasResponded =
      Boolean(row.hasResponded) || respondedIds.has(traceId);
    if (hasResponded) continue;
    return {
      traceId,
      phraseKey,
      hasResponded: false,
      ...(typeof row.respondPhraseKey === 'string'
        ? { respondPhraseKey: row.respondPhraseKey }
        : {})
    };
  }
  return null;
}

function parseWitnessPeekBody(body) {
  if (!body || typeof body !== 'object') return null;
  if (body.schemaVersion !== FOCUS_CIRCLE_SCHEMA_VERSION) return null;
  if (!Array.isArray(body.traces)) return null;
  return body.traces;
}

function dispatchWitnessChange() {
  try {
    globalThis.dispatchEvent?.(
      new CustomEvent(FOCUS_CIRCLE_WITNESS_CHANGE_EVENT, {
        detail: { trace: witnessPeekSnapshot }
      })
    );
  } catch {
    // non-DOM tests
  }
}

function rememberWitnessPeek(traces, storage) {
  const respondedIds = readRespondedTraceIds(storage);
  const next = pickIdleWitnessTrace(traces, respondedIds);
  const prevJson = witnessPeekSnapshot
    ? JSON.stringify(witnessPeekSnapshot)
    : '';
  const nextJson = next ? JSON.stringify(next) : '';
  if (prevJson === nextJson) {
    return { changed: false, trace: next };
  }
  witnessPeekSnapshot = next;
  dispatchWitnessChange();
  return { changed: true, trace: next };
}

/**
 * @param {object} [opts]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {'witness_peek' | 'witness_leave' | 'witness_respond'} [opts.action]
 */
export async function postFocusCircleWitness({
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  action = 'witness_peek',
  circleId = '',
  memberId = '',
  phraseKey = '',
  traceId = '',
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
    memberId: memberId || membership.memberId,
    ...(phraseKey ? { phraseKey } : {}),
    ...(traceId ? { traceId } : {})
  };
  try {
    const body = await postJson(FOCUS_CIRCLE_PATH, {
      body: JSON.stringify(payload)
    });
    if (!body || typeof body !== 'object') {
      return { ok: false, reason: 'bad_payload', skipped: true };
    }
    if (body.schemaVersion !== FOCUS_CIRCLE_SCHEMA_VERSION) {
      return { ok: false, reason: 'bad_payload', skipped: true };
    }
    if (action === 'witness_peek') {
      const traces = parseWitnessPeekBody(body);
      if (!traces) return { ok: false, reason: 'bad_payload', skipped: true };
      const remembered = rememberWitnessPeek(traces, storage);
      return { ok: true, traces, ...remembered, skipped: false };
    }
    if (action === 'witness_leave') {
      if (body.ok !== true || typeof body.traceId !== 'string') {
        return { ok: false, reason: 'bad_payload', skipped: true };
      }
      return { ok: true, traceId: body.traceId, skipped: false };
    }
    if (action === 'witness_respond') {
      if (body.ok === true) {
        return { ok: true, skipped: false };
      }
      if (body.reason === 'already_responded') {
        return { ok: false, reason: 'already_responded', skipped: false };
      }
      return { ok: false, reason: 'bad_payload', skipped: true };
    }
    return { ok: false, reason: 'bad_action', skipped: true };
  } catch {
    return { ok: false, reason: 'network', skipped: true };
  }
}

/**
 * @param {object} [opts]
 */
export async function peekFocusCircleWitness(opts = {}) {
  if (peekInFlight) return { ok: false, reason: 'in_flight', skipped: true };
  if (
    !isFocusCircleWitnessClientEnabled({
      search: opts.search ?? globalThis.location?.search ?? '',
      storage: opts.storage ?? globalThis.localStorage,
      cloudBaseUrl: opts.getBaseUrl?.() ?? getCloudApiBaseUrl()
    })
  ) {
    witnessPeekSnapshot = null;
    dispatchWitnessChange();
    return { ok: false, reason: 'disabled', skipped: true };
  }
  const { busy, retry } = readBusyProbe();
  if (busy) {
    if (retry) {
      scheduleFocusCircleWitnessPeek({
        ...opts,
        delayMs: LANTERN_BUSY_RETRY_MS
      });
    }
    return { ok: false, reason: 'busy', skipped: true };
  }
  peekInFlight = true;
  try {
    return await postFocusCircleWitness({ ...opts, action: 'witness_peek' });
  } finally {
    peekInFlight = false;
  }
}

/**
 * @param {object} [opts]
 * @param {number} [opts.delayMs]
 */
export function scheduleFocusCircleWitnessPeek(opts = {}) {
  if (peekTimer) clearTimeout(peekTimer);
  const delayMs = opts.delayMs ?? LANTERN_PEEK_IDLE_MS;
  peekTimer = setTimeout(() => {
    peekTimer = null;
    void peekFocusCircleWitness(opts);
  }, delayMs);
}

function clearIdleObserverTimer() {
  if (idleObserverTimer) clearTimeout(idleObserverTimer);
  idleObserverTimer = null;
}

export function stopFocusCircleWitnessIdleObserverPeek() {
  idleObserverActive = false;
  idleObserverOpts = null;
  clearIdleObserverTimer();
}

async function runIdleObserverPeekTick() {
  if (!idleObserverActive) return;
  await peekFocusCircleWitness(idleObserverOpts ?? {});
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
export function startFocusCircleWitnessIdleObserverPeek(opts = {}) {
  stopFocusCircleWitnessIdleObserverPeek();
  if (
    !isFocusCircleWitnessClientEnabled({
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

/**
 * @param {number} elapsedSeconds
 * @returns {boolean}
 */
export function isWitnessEligibleSession(elapsedSeconds) {
  const n = Number(elapsedSeconds);
  return Number.isFinite(n) && n >= FOCUS_CIRCLE_WITNESS_MIN_SESSION_SECONDS;
}

export function clearFocusCircleWitnessSnapshot() {
  witnessPeekSnapshot = null;
  dispatchWitnessChange();
}

export function bindFocusCircleWitnessPageHide() {
  const onHide = () => {
    stopFocusCircleWitnessIdleObserverPeek();
  };
  globalThis.addEventListener?.('pagehide', onHide);
  return () => globalThis.removeEventListener?.('pagehide', onHide);
}
