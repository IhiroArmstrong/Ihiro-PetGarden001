/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Monetization intent funnel · opt-in upload payload + flush.
 * Never posts unless consent is enabled.
 */

import { postCloudJson, getCloudApiBaseUrl } from './cloudApiClient.js';
import {
  MONETIZATION_FUNNEL_EVENTS,
  isAllowedMonetizationFunnelCountKey,
  parseMonetizationFunnelLayout,
  readMonetizationFunnelState
} from './monetizationIntentFunnel.js';
import {
  ensureMonetizationFunnelClientId,
  isMonetizationFunnelOptInEnabled,
  patchMonetizationFunnelUploadMeta,
  readMonetizationFunnelOptInState
} from './monetizationFunnelOptIn.js';

export const MONETIZATION_FUNNEL_UPLOAD_SCHEMA_VERSION = 1;
export const MONETIZATION_FUNNEL_UPLOAD_PATH =
  '/api/monetization-funnel-ingest';
/** Min gap between successful or attempted flushes (ms). */
export const MONETIZATION_FUNNEL_UPLOAD_THROTTLE_MS = 60_000;
export const MONETIZATION_FUNNEL_UPLOAD_MAX_EVENTS = 20;

const ALLOWED_EVENT_NAMES = new Set(Object.values(MONETIZATION_FUNNEL_EVENTS));
const ALLOWED_SOURCES = new Set([
  'fab',
  'support-modal',
  'card',
  'return',
  'tip-jar',
  'sanctuary-card',
  'membership-card',
  'dev'
]);

/**
 * @param {string} name
 * @returns {boolean}
 */
export function isAllowedMonetizationFunnelEventName(name) {
  return typeof name === 'string' && ALLOWED_EVENT_NAMES.has(name);
}

/**
 * @param {Record<string, number>} counts
 * @returns {Record<string, number>}
 */
export function sanitizeMonetizationFunnelCounts(counts) {
  /** @type {Record<string, number>} */
  const out = {};
  if (!counts || typeof counts !== 'object') return out;
  for (const [k, v] of Object.entries(counts)) {
    if (!isAllowedMonetizationFunnelCountKey(k)) continue;
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) continue;
    out[k] = Math.min(Math.floor(n), 1_000_000);
  }
  return out;
}

/**
 * @param {import('./monetizationIntentFunnel.js').MonetizationFunnelEvent[]} events
 * @param {number} [max]
 */
export function sanitizeMonetizationFunnelEvents(
  events,
  max = MONETIZATION_FUNNEL_UPLOAD_MAX_EVENTS
) {
  if (!Array.isArray(events)) return [];
  /** @type {import('./monetizationIntentFunnel.js').MonetizationFunnelEvent[]} */
  const out = [];
  for (const row of events.slice(-max)) {
    if (!row || typeof row !== 'object') continue;
    if (!isAllowedMonetizationFunnelEventName(row.name)) continue;
    const track =
      row.track === 'tea' ||
      row.track === 'sanctuary' ||
      row.track === 'membership'
        ? row.track
        : null;
    const source =
      typeof row.source === 'string' && ALLOWED_SOURCES.has(row.source)
        ? row.source
        : null;
    out.push({
      at: typeof row.at === 'string' ? row.at.slice(0, 40) : '',
      name: row.name,
      track,
      source,
      layout: parseMonetizationFunnelLayout(row.layout)
    });
  }
  return out;
}

/**
 * @param {object} options
 * @param {Storage | null | undefined} options.storage
 * @param {() => Date} [options.now]
 * @returns {null | {
 *   schemaVersion: number,
 *   clientId: string,
 *   consentedAt: string | null,
 *   uploadedAt: string,
 *   counts: Record<string, number>,
 *   events: object[]
 * }}
 */
export function buildMonetizationFunnelUploadPayload({
  storage,
  now = () => new Date()
}) {
  if (!isMonetizationFunnelOptInEnabled(storage)) return null;
  const opt = ensureMonetizationFunnelClientId(storage, now);
  if (!opt.clientId) return null;
  const funnel = readMonetizationFunnelState(storage);
  return {
    schemaVersion: MONETIZATION_FUNNEL_UPLOAD_SCHEMA_VERSION,
    clientId: opt.clientId,
    consentedAt: opt.consentedAt,
    uploadedAt: now().toISOString(),
    counts: sanitizeMonetizationFunnelCounts(funnel.counts),
    events: sanitizeMonetizationFunnelEvents(funnel.events)
  };
}

/** @type {number} */
let lastFlushAttemptMs = 0;
/** @type {Promise<{ ok: boolean, reason?: string }> | null} */
let inFlight = null;

/**
 * @param {object} [options]
 * @param {Storage | null | undefined} [options.storage]
 * @param {() => Date} [options.now]
 * @param {typeof postCloudJson} [options.postJson]
 * @param {boolean} [options.force] skip throttle
 * @param {number} [options.throttleMs]
 * @returns {Promise<{ ok: boolean, reason?: string, skipped?: boolean }>}
 */
export async function flushMonetizationFunnelUpload({
  storage = globalThis.localStorage,
  now = () => new Date(),
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  force = false,
  throttleMs = MONETIZATION_FUNNEL_UPLOAD_THROTTLE_MS
} = {}) {
  if (inFlight) return inFlight;

  const run = (async () => {
    if (!isMonetizationFunnelOptInEnabled(storage)) {
      return { ok: false, reason: 'opt_in_disabled', skipped: true };
    }
    const t = now().getTime();
    if (!force && t - lastFlushAttemptMs < throttleMs) {
      return { ok: false, reason: 'throttled', skipped: true };
    }
    lastFlushAttemptMs = t;

    if (!getBaseUrl()) {
      patchMonetizationFunnelUploadMeta(storage, {
        error: 'cloud_api_unconfigured'
      });
      return { ok: false, reason: 'cloud_api_unconfigured', skipped: true };
    }

    const payload = buildMonetizationFunnelUploadPayload({ storage, now });
    if (!payload) {
      return { ok: false, reason: 'no_payload', skipped: true };
    }

    try {
      await postJson(MONETIZATION_FUNNEL_UPLOAD_PATH, {
        body: JSON.stringify(payload)
      });
      patchMonetizationFunnelUploadMeta(storage, {
        at: payload.uploadedAt,
        error: null
      });
      return { ok: true };
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String(/** @type {{ message?: unknown }} */ (err).message || 'error')
          : 'error';
      patchMonetizationFunnelUploadMeta(storage, {
        error: msg.slice(0, 120)
      });
      return { ok: false, reason: msg };
    }
  })();

  inFlight = run.finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/**
 * Hook after a local funnel `record`. Forces flush on checkout_complete.
 * @param {string} eventName
 * @param {object} [options]
 */
export function scheduleMonetizationFunnelUploadAfterRecord(
  eventName,
  options = {}
) {
  const force =
    eventName === MONETIZATION_FUNNEL_EVENTS.CHECKOUT_COMPLETE ||
    eventName === MONETIZATION_FUNNEL_EVENTS.CHECKOUT_START;
  // Fire-and-forget; never block payment UX.
  void flushMonetizationFunnelUpload({ ...options, force });
}

/** Test helper — reset throttle / in-flight. */
export function resetMonetizationFunnelUploadThrottleForTests() {
  lastFlushAttemptMs = 0;
  inFlight = null;
}

/**
 * DEV summary line.
 * @param {Storage | null | undefined} storage
 */
export function formatMonetizationFunnelOptInSummary(storage) {
  const s = readMonetizationFunnelOptInState(storage);
  const lines = [
    `opt-in: ${s.enabled ? 'ON' : 'OFF'}`,
    `clientId: ${s.clientId || '(none)'}`,
    `consentedAt: ${s.consentedAt || '—'}`,
    `lastUploadAt: ${s.lastUploadAt || '—'}`,
    `lastUploadError: ${s.lastUploadError || '—'}`
  ];
  return lines.join('\n');
}
