/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * YPE L2 sync: ingest signals + receive Pack; delete on opt-out.
 * Non-blocking; respects busy probe (practice-backup pattern).
 */

import { postCloudJson, getCloudApiBaseUrl } from './cloudApiClient.js';
import {
  getActiveYpeProfileId,
  isYpeCloudPersonalizationConsentEnabled,
  patchYpeCloudPersonalizationSyncMeta,
  readYpeCloudPersonalizationConsentState,
  clearYpePendingDelete
} from './ypeCloudPersonalizationConsent.js';
import { buildYpePersonalizationSignals } from './ypePersonalizationSignals.js';
import {
  discardCachedPersonalizationPack,
  writeCachedPersonalizationPack
} from './ypePersonalizationPack.js';

export const YPE_PERSONALIZATION_INGEST_SCHEMA_VERSION = 1;
export const YPE_PERSONALIZATION_INGEST_PATH =
  '/api/ype-personalization-ingest';
export const YPE_PERSONALIZATION_DELETE_PATH =
  '/api/ype-personalization-delete';

export const YPE_PERSONALIZATION_DEBOUNCE_MS = 10 * 60 * 1000;
export const YPE_PERSONALIZATION_MIN_GAP_MS = 60 * 1000;
export const YPE_PERSONALIZATION_IDLE_FLUSH_MS = 2500;
export const YPE_PERSONALIZATION_BUSY_RETRY_MS = 2000;

/** @type {ReturnType<typeof setTimeout> | null} */
let debounceTimer = null;
let lastIngestAttemptMs = 0;
let lastSignalsFingerprint = null;
let ingestInFlight = false;
let deleteInFlight = false;

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
export function setYpePersonalizationBusyProbe(fn) {
  busyProbe = typeof fn === 'function' ? fn : () => false;
}

export function resetYpePersonalizationSyncForTests() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
  lastIngestAttemptMs = 0;
  lastSignalsFingerprint = null;
  ingestInFlight = false;
  deleteInFlight = false;
  busyProbe = () => false;
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {number} [opts.debounceMs]
 * @param {boolean} [opts.forceSoon]
 */
export function scheduleYpePersonalizationIngest(opts = {}) {
  const storage =
    opts.storage ??
    (typeof localStorage !== 'undefined' ? localStorage : null);
  const debounceMs = opts.debounceMs ?? YPE_PERSONALIZATION_DEBOUNCE_MS;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void flushYpePersonalizationIngest({
      storage,
      force: Boolean(opts.forceSoon)
    });
  }, debounceMs);
}

/**
 * @param {object} [opts]
 * @param {Storage | null | undefined} [opts.storage]
 * @param {boolean} [opts.force]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {() => Date} [opts.now]
 */
export async function flushYpePersonalizationIngest({
  storage = globalThis.localStorage,
  force = false,
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  now = () => new Date()
} = {}) {
  if (ingestInFlight) return { ok: false, reason: 'in_flight', skipped: true };
  if (!isYpeCloudPersonalizationConsentEnabled(storage)) {
    return { ok: false, reason: 'consent_off', skipped: true };
  }
  const profileId = getActiveYpeProfileId(storage);
  if (!profileId) {
    return { ok: false, reason: 'no_profile', skipped: true };
  }

  const { busy, retry } = readBusyProbe();
  if (busy) {
    if (retry) {
      setTimeout(() => {
        void flushYpePersonalizationIngest({ storage, force, postJson, now });
      }, YPE_PERSONALIZATION_BUSY_RETRY_MS);
    }
    return { ok: false, reason: 'busy', skipped: true };
  }

  const t = now().getTime();
  if (!force && t - lastIngestAttemptMs < YPE_PERSONALIZATION_MIN_GAP_MS) {
    return { ok: false, reason: 'throttled', skipped: true };
  }

  const built = buildYpePersonalizationSignals(storage, now);
  if (!force && built.fingerprint === lastSignalsFingerprint) {
    patchYpeCloudPersonalizationSyncMeta(storage, { ingestError: null });
    return { ok: true, reason: 'unchanged', skipped: true };
  }

  if (!getBaseUrl()) {
    patchYpeCloudPersonalizationSyncMeta(storage, {
      ingestError: 'cloud_api_unconfigured'
    });
    return { ok: false, reason: 'cloud_api_unconfigured', skipped: true };
  }

  ingestInFlight = true;
  lastIngestAttemptMs = t;
  try {
    const consent = readYpeCloudPersonalizationConsentState(storage);
    const body = {
      schemaVersion: YPE_PERSONALIZATION_INGEST_SCHEMA_VERSION,
      ypeProfileId: profileId,
      consentedAt: consent.consentedAt,
      uploadedAt: now().toISOString(),
      signals: built.signals,
      windowCompletionCount: built.windowCompletionCount
    };
    const res = await postJson(YPE_PERSONALIZATION_INGEST_PATH, {
      body: JSON.stringify(body)
    });
    lastSignalsFingerprint = built.fingerprint;
    if (res?.pack) {
      writeCachedPersonalizationPack(storage, res.pack);
    }
    patchYpeCloudPersonalizationSyncMeta(storage, {
      ingestAt: body.uploadedAt,
      ingestError: null,
      lastPackVersion:
        res?.pack && typeof res.pack.packVersion === 'number'
          ? res.pack.packVersion
          : undefined
    });
    return { ok: true, pack: res?.pack ?? null };
  } catch (err) {
    const msg =
      err && typeof err === 'object' && 'message' in err
        ? String(/** @type {{ message?: unknown }} */ (err).message || 'error')
        : 'error';
    patchYpeCloudPersonalizationSyncMeta(storage, {
      ingestError: msg.slice(0, 120)
    });
    return { ok: false, reason: msg };
  } finally {
    ingestInFlight = false;
  }
}

/**
 * @param {object} [opts]
 */
export async function flushYpePersonalizationDelete({
  storage = globalThis.localStorage,
  force = false,
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  now = () => new Date()
} = {}) {
  if (deleteInFlight) return { ok: false, reason: 'in_flight', skipped: true };
  const state = readYpeCloudPersonalizationConsentState(storage);
  const targetId = state.pendingDeleteProfileId;
  if (!targetId) {
    return { ok: true, reason: 'nothing_pending', skipped: true };
  }

  discardCachedPersonalizationPack(storage);

  if (!getBaseUrl()) {
    patchYpeCloudPersonalizationSyncMeta(storage, {
      deleteError: 'cloud_api_unconfigured'
    });
    return { ok: false, reason: 'cloud_api_unconfigured', skipped: true };
  }

  deleteInFlight = true;
  try {
    await postJson(YPE_PERSONALIZATION_DELETE_PATH, {
      body: JSON.stringify({
        schemaVersion: YPE_PERSONALIZATION_INGEST_SCHEMA_VERSION,
        ypeProfileId: targetId
      })
    });
    clearYpePendingDelete(storage, targetId);
    patchYpeCloudPersonalizationSyncMeta(storage, {
      deleteAt: now().toISOString(),
      deleteError: null
    });
    return { ok: true, deleted: true };
  } catch (err) {
    const msg =
      err && typeof err === 'object' && 'message' in err
        ? String(/** @type {{ message?: unknown }} */ (err).message || 'error')
        : 'error';
    patchYpeCloudPersonalizationSyncMeta(storage, {
      deleteError: msg.slice(0, 120)
    });
    return { ok: false, reason: msg };
  } finally {
    deleteInFlight = false;
  }
}

/**
 * Consent toggled OFF — discard cache and queue delete flush.
 * @param {Storage | null | undefined} storage
 */
export function onYpeCloudPersonalizationConsentDisabled(storage) {
  discardCachedPersonalizationPack(storage);
  lastSignalsFingerprint = null;
  void flushYpePersonalizationDelete({ storage, force: true });
}

/**
 * Consent toggled ON — schedule ingest (no immediate blocking).
 * @param {Storage | null | undefined} storage
 */
export function onYpeCloudPersonalizationConsentEnabled(storage) {
  scheduleYpePersonalizationIngest({
    storage,
    debounceMs: YPE_PERSONALIZATION_IDLE_FLUSH_MS,
    forceSoon: true
  });
}
