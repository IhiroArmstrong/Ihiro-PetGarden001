/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * YPE L2 cloud personalization · fourth independent consent (default off).
 * UI slice: consent + local ype_profile_id only — no ingest / Worker / network.
 * @see docs/task-briefs/task-l2-personalization-consent.md
 * @see docs/task-briefs/task-l2-personalization-identity.md
 */

export const YPE_CLOUD_PERSONALIZATION_CONSENT_STORAGE_KEY =
  'focus-tiger.ype-cloud-personalization-consent.v1';

/**
 * @typedef {{
 *   enabled: boolean,
 *   consentedAt: string | null,
 *   ypeProfileId: string | null,
 *   pendingDeleteProfileId: string | null,
 *   deleteQueuedAt: string | null,
 *   lastIngestAt: string | null,
 *   lastIngestError: string | null,
 *   lastDeleteAt: string | null,
 *   lastDeleteError: string | null,
 *   lastPackVersion: number | null
 * }} YpeCloudPersonalizationConsentState
 */

/**
 * @param {unknown} raw
 * @returns {YpeCloudPersonalizationConsentState}
 */
export function normalizeYpeCloudPersonalizationConsentState(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      enabled: false,
      consentedAt: null,
      ypeProfileId: null,
      pendingDeleteProfileId: null,
      deleteQueuedAt: null,
      lastIngestAt: null,
      lastIngestError: null,
      lastDeleteAt: null,
      lastDeleteError: null,
      lastPackVersion: null
    };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  return {
    enabled: o.enabled === true,
    consentedAt:
      typeof o.consentedAt === 'string' && o.consentedAt ? o.consentedAt : null,
    ypeProfileId:
      typeof o.ypeProfileId === 'string' && o.ypeProfileId.trim()
        ? o.ypeProfileId.trim()
        : null,
    pendingDeleteProfileId:
      typeof o.pendingDeleteProfileId === 'string' &&
      o.pendingDeleteProfileId.trim()
        ? o.pendingDeleteProfileId.trim()
        : null,
    deleteQueuedAt:
      typeof o.deleteQueuedAt === 'string' && o.deleteQueuedAt
        ? o.deleteQueuedAt
        : null,
    lastIngestAt:
      typeof o.lastIngestAt === 'string' && o.lastIngestAt ? o.lastIngestAt : null,
    lastIngestError:
      typeof o.lastIngestError === 'string' && o.lastIngestError
        ? o.lastIngestError
        : null,
    lastDeleteAt:
      typeof o.lastDeleteAt === 'string' && o.lastDeleteAt ? o.lastDeleteAt : null,
    lastDeleteError:
      typeof o.lastDeleteError === 'string' && o.lastDeleteError
        ? o.lastDeleteError
        : null,
    lastPackVersion:
      typeof o.lastPackVersion === 'number' && Number.isFinite(o.lastPackVersion)
        ? Math.floor(o.lastPackVersion)
        : null
  };
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
 * @returns {YpeCloudPersonalizationConsentState}
 */
export function readYpeCloudPersonalizationConsentState(storage) {
  if (!storage) return normalizeYpeCloudPersonalizationConsentState(null);
  try {
    const raw = storage.getItem(YPE_CLOUD_PERSONALIZATION_CONSENT_STORAGE_KEY);
    if (!raw) return normalizeYpeCloudPersonalizationConsentState(null);
    return normalizeYpeCloudPersonalizationConsentState(JSON.parse(raw));
  } catch {
    return normalizeYpeCloudPersonalizationConsentState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {YpeCloudPersonalizationConsentState} state
 */
export function writeYpeCloudPersonalizationConsentState(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(
      YPE_CLOUD_PERSONALIZATION_CONSENT_STORAGE_KEY,
      JSON.stringify(normalizeYpeCloudPersonalizationConsentState(state))
    );
  } catch {
    /* ignore */
  }
}

/**
 * @returns {string}
 */
export function createYpeProfileId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `ype-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Explicit consent on/off. Default off. Enabling mints a fresh ype_profile_id.
 * Disabling queues cloud delete for Worker (no network in UI slice).
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @param {() => Date} [now]
 * @returns {YpeCloudPersonalizationConsentState}
 */
export function setYpeCloudPersonalizationConsent(
  storage,
  enabled,
  now = () => new Date()
) {
  const prev = readYpeCloudPersonalizationConsentState(storage);
  if (enabled) {
    const next = {
      enabled: true,
      consentedAt: prev.consentedAt || now().toISOString(),
      ypeProfileId: createYpeProfileId(),
      pendingDeleteProfileId: prev.pendingDeleteProfileId,
      deleteQueuedAt: prev.deleteQueuedAt
    };
    writeYpeCloudPersonalizationConsentState(storage, next);
    return next;
  }

  const retiringId = prev.ypeProfileId;
  const next = {
    enabled: false,
    consentedAt: prev.consentedAt,
    ypeProfileId: null,
    pendingDeleteProfileId:
      retiringId || prev.pendingDeleteProfileId || null,
    deleteQueuedAt: retiringId
      ? now().toISOString()
      : prev.deleteQueuedAt
  };
  writeYpeCloudPersonalizationConsentState(storage, next);
  return next;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function isYpeCloudPersonalizationConsentEnabled(storage) {
  return readYpeCloudPersonalizationConsentState(storage).enabled === true;
}

/**
 * @param {Storage | null | undefined} [storage]
 * @returns {string | null}
 */
export function getActiveYpeProfileId(storage = getDefaultStorage()) {
  const state = readYpeCloudPersonalizationConsentState(storage);
  return state.enabled ? state.ypeProfileId : null;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ ingestAt?: string | null, ingestError?: string | null, deleteAt?: string | null, deleteError?: string | null, lastPackVersion?: number | null }} patch
 */
export function patchYpeCloudPersonalizationSyncMeta(storage, patch = {}) {
  const prev = readYpeCloudPersonalizationConsentState(storage);
  const next = {
    ...prev,
    lastIngestAt:
      patch.ingestAt === undefined ? prev.lastIngestAt : patch.ingestAt,
    lastIngestError:
      patch.ingestError === undefined
        ? prev.lastIngestError
        : patch.ingestError,
    lastDeleteAt:
      patch.deleteAt === undefined ? prev.lastDeleteAt : patch.deleteAt,
    lastDeleteError:
      patch.deleteError === undefined
        ? prev.lastDeleteError
        : patch.deleteError,
    lastPackVersion:
      patch.lastPackVersion === undefined
        ? prev.lastPackVersion
        : patch.lastPackVersion
  };
  writeYpeCloudPersonalizationConsentState(storage, next);
  return next;
}

/**
 * Clear pending delete after server confirms (only matching id).
 * @param {Storage | null | undefined} storage
 * @param {string} deletedProfileId
 */
export function clearYpePendingDelete(storage, deletedProfileId) {
  const prev = readYpeCloudPersonalizationConsentState(storage);
  if (prev.pendingDeleteProfileId !== deletedProfileId) return prev;
  const next = {
    ...prev,
    pendingDeleteProfileId: null,
    deleteQueuedAt: null
  };
  writeYpeCloudPersonalizationConsentState(storage, next);
  return next;
}
