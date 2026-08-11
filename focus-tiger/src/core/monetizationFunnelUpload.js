/**
 * Upload monetization funnel count deltas when user opted in.
 */

import { postCloudJson, getCloudApiBaseUrl } from './cloudApiClient.js';
import {
  buildMonetizationFunnelIngestPayload,
  readMonetizationFunnelConsent,
  writeMonetizationFunnelConsent
} from './monetizationFunnelConsent.js';
import { getMonetizationFunnelStore } from './monetizationIntentFunnel.js';

/** @type {ReturnType<typeof setTimeout> | null} */
let _debounceTimer = null;
let _inFlight = false;

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => { counts: Record<string, number> }} [opts.readCounts]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function tryUploadMonetizationFunnel(opts = {}) {
  const storage =
    opts.storage ??
    (typeof localStorage !== 'undefined' ? localStorage : null);
  const consent = readMonetizationFunnelConsent(storage);
  if (!consent.optedIn) return { sent: false, reason: 'opted_out' };
  if (!getCloudApiBaseUrl() && !opts.postJson) {
    return { sent: false, reason: 'cloud_unconfigured' };
  }

  const readCounts =
    opts.readCounts ?? (() => getMonetizationFunnelStore().read().counts);
  const counts = readCounts();
  const payload = buildMonetizationFunnelIngestPayload(consent, counts);
  if (!payload) return { sent: false, reason: 'no_delta' };

  const post = opts.postJson ?? postCloudJson;
  try {
    await post('/api/monetization-funnel-ingest', {
      body: JSON.stringify(payload)
    });
  } catch {
    return { sent: false, reason: 'network' };
  }

  writeMonetizationFunnelConsent(storage, {
    ...consent,
    lastSentCounts: { ...counts },
    lastSentAt: new Date().toISOString()
  });
  return { sent: true };
}

/**
 * Debounced upload after local funnel events (opt-in only).
 * @param {object} [opts]
 * @param {number} [opts.delayMs]
 */
export function scheduleMonetizationFunnelUpload(opts = {}) {
  const delayMs = Math.max(0, Number(opts.delayMs) || 2500);
  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    _debounceTimer = null;
    if (_inFlight) return;
    _inFlight = true;
    void tryUploadMonetizationFunnel()
      .catch(() => {})
      .finally(() => {
        _inFlight = false;
      });
  }, delayMs);
}
