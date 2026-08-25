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
 *   deleteQueuedAt: string | null
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
      deleteQueuedAt: null
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
