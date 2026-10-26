/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Product-improve ingest. POST only after consent + configured receive.
 * Does not run during Arrival / Honesty / Reflection overlay windows.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import {
  hasT54ResearchConsent,
  readT54ResearchConsent,
  T54_RESEARCH_CONSENT_STORAGE_KEY
} from './t54ResearchLedger.js';
import {
  pickT54ResearchReceiveFields,
  T54_OBSERVATION_STATUS,
  T54_RESEARCH_INGEST_PATH
} from './t54ResearchReceive.js';

export const T54_RESEARCH_STUDY_ID = 't54-product-improve';
export const T54_RESEARCH_INGEST_DELAY_MS = 2500;

const LAST_POST_FINGERPRINT_KEY = 'focus-tiger.t54-research-last-post.v1';

/** @type {ReturnType<typeof setTimeout> | null} */
let pendingTimer = null;

/**
 * @param {Storage | null | undefined} storage
 */
export function buildT54ResearchUploadPayload(storage) {
  if (!hasT54ResearchConsent(storage)) return null;
  const consent = readT54ResearchConsent(storage);
  if (!consent.localResearchCode) return null;
  const body = {
    studyId: T54_RESEARCH_STUDY_ID,
    localResearchCode: consent.localResearchCode,
    enrolledAt: consent.consentedAt,
    firstEligibleSilence: false,
    observationStatus: T54_OBSERVATION_STATUS.OBSERVING,
    returnedWithin14d: null,
    daysUntilReturn: null,
    satWithin6h: null,
    exited: false
  };
  const picked = pickT54ResearchReceiveFields(body);
  if (!picked.ok || picked.dropped.length > 0) return null;
  return picked.accepted;
}

function fingerprintPayload(payload) {
  return JSON.stringify(payload);
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {typeof getCloudApiBaseUrl} [opts.getBaseUrl]
 * @returns {Promise<{ ok: boolean, reason?: string, skipped?: boolean }>}
 */
export async function flushT54ResearchIngest({
  storage = globalThis.localStorage,
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl
} = {}) {
  if (!hasT54ResearchConsent(storage)) {
    return { ok: false, reason: 'not_consented', skipped: true };
  }
  if (!getBaseUrl()) {
    return { ok: false, reason: 'cloud_api_unconfigured', skipped: true };
  }
  const payload = buildT54ResearchUploadPayload(storage);
  if (!payload) return { ok: false, reason: 'no_payload', skipped: true };
  const fp = fingerprintPayload(payload);
  try {
    if (storage?.getItem(LAST_POST_FINGERPRINT_KEY) === fp) {
      return { ok: true, skipped: true, reason: 'unchanged' };
    }
  } catch {
    /* ignore */
  }
  try {
    await postJson(T54_RESEARCH_INGEST_PATH, {
      body: JSON.stringify(payload)
    });
    try {
      storage?.setItem(LAST_POST_FINGERPRINT_KEY, fp);
    } catch {
      /* ignore */
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'post_failed' };
  }
}

/**
 * Fire-and-forget after timed-focus end. Delay skips overlay windows.
 *
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {number} [opts.delayMs]
 */
export function scheduleT54ResearchIngest({
  storage = globalThis.localStorage,
  delayMs = T54_RESEARCH_INGEST_DELAY_MS
} = {}) {
  if (!hasT54ResearchConsent(storage)) return;
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    void flushT54ResearchIngest({ storage });
  }, delayMs);
}

export function resetT54ResearchIngestScheduleForTests() {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
}

export { LAST_POST_FINGERPRINT_KEY, T54_RESEARCH_CONSENT_STORAGE_KEY };
