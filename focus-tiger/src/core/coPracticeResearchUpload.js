/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T81 S4(c)(d) — weekly POST only after consent; revoke clears studyId and stops traffic.
 * S5 scheduling calls into this module — no network without canUpload.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import { isDesktopShellRuntime } from './desktopShell.js';
import {
  grantCoPracticeResearchConsent,
  hasCoPracticeResearchConsent,
  readCoPracticeResearchConsent,
  revokeCoPracticeResearchConsent
} from './coPracticeResearchConsent.js';
import {
  canUploadCoPracticeResearchPayload,
  CO_PRACTICE_RESEARCH_INGEST_PATH,
  isCoPracticeResearchLabUploadQuery
} from './coPracticeResearchReceive.js';
import { buildWeeklyPayload } from './coPracticeResearchWeeklyPayload.js';
import { serializeCoPracticeResearchPayload } from './coPracticeResearchSerialize.js';
import { clearCoPracticeResearchWeeklySchedule } from './coPracticeResearchWeeklySchedule.js';

export const CO_PRACTICE_RESEARCH_LAST_POST_KEY =
  'focus-tiger.co-practice-research-last-post.v1';

/**
 * @param {Storage | null | undefined} storage
 * @param {'en' | 'ja' | 'zh'} [locale]
 */
function resolveLocale(storage, locale) {
  if (locale) return locale;
  const store = storage;
  if (store) {
    try {
      const raw = store.getItem('focus-tiger.locale.v1');
      if (raw === 'ja' || raw === 'zh' || raw === 'en') return raw;
    } catch {
      /* ignore */
    }
  }
  return 'en';
}

/**
 * @param {'web' | 'mac' | 'win'} [platform]
 */
function resolvePlatform(platform) {
  if (platform) return platform;
  if (isDesktopShellRuntime()) {
    try {
      const ua = String(globalThis.navigator?.userAgent || '');
      if (/Windows/i.test(ua)) return 'win';
    } catch {
      /* ignore */
    }
    return 'mac';
  }
  return 'web';
}

/**
 * Shared builder for consent preview (T82) and upload POST (T81).
 *
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {'en' | 'ja' | 'zh'} [opts.locale]
 * @param {'web' | 'mac' | 'win'} [opts.platform]
 * @param {() => Date} [opts.now]
 * @param {string} [opts.week]
 * @param {boolean} [opts.previewOnly] when true, skip consent gate (preview before enroll uses caller studyId)
 * @param {string} [opts.previewStudyId]
 * @param {string | null} [opts.consentedAt]
 * @param {number} [opts.consentVersion]
 * @param {boolean} [opts.tier2]
 */
export function buildCoPracticeResearchPayloadObject(opts = {}) {
  const storage = opts.storage ?? null;
  const consent = readCoPracticeResearchConsent(storage);
  const forUpload = opts.previewOnly !== true;
  if (forUpload && !hasCoPracticeResearchConsent(storage)) return null;
  const studyId = forUpload
    ? consent.studyId
    : opts.previewStudyId || consent.studyId;
  if (!studyId) return null;
  const consentMeta = forUpload
    ? { v: consent.consentVersion, tier2: consent.tier2 }
    : {
        v: opts.consentVersion ?? consent.consentVersion,
        tier2: opts.tier2 === true
      };
  const consentedAt = forUpload
    ? consent.consentedAt
    : opts.consentedAt ?? consent.consentedAt;
  return buildWeeklyPayload({
    studyId,
    consent: { v: consentMeta.v, tier2: consentMeta.tier2 },
    consentedAt,
    locale: resolveLocale(storage, opts.locale),
    platform: resolvePlatform(opts.platform),
    storage,
    now: opts.now,
    week: opts.week
  });
}

/**
 * @param {object} [opts]
 */
export function buildCoPracticeResearchConsentPreviewJson(opts = {}) {
  const payload = buildCoPracticeResearchPayloadObject({
    ...opts,
    previewOnly: opts.previewOnly ?? true
  });
  if (!payload) return null;
  return serializeCoPracticeResearchPayload(payload);
}

/**
 * @param {object} [opts]
 */
export function buildCoPracticeResearchUploadPayload(opts = {}) {
  return buildCoPracticeResearchPayloadObject({
    ...opts,
    previewOnly: false
  });
}

/**
 * @param {string} [search]
 * @param {boolean} [receiveConfigured]
 * @param {Storage | null} [storage]
 */
export function shouldPostCoPracticeResearchIngest({
  storage,
  search,
  receiveConfigured
} = {}) {
  const consented = hasCoPracticeResearchConsent(storage);
  const configured =
    receiveConfigured ?? Boolean(getCloudApiBaseUrl());
  return canUploadCoPracticeResearchPayload({
    consented,
    receiveConfigured: configured,
    labUploadEnabled: isCoPracticeResearchLabUploadQuery(search)
  });
}

/**
 * Preflight / heartbeat — must not open network without consent (S4(c)).
 *
 * @param {object} [opts]
 */
export function probeCoPracticeResearchReceive(opts = {}) {
  const storage = opts.storage ?? null;
  if (!shouldPostCoPracticeResearchIngest(opts)) {
    return { ok: true, skipped: true, reason: 'not_allowed' };
  }
  void storage;
  return { ok: true, ready: true, reason: 'allowed_local_only' };
}

/**
 * @param {object} [opts]
 */
export async function flushCoPracticeResearchIngest({
  storage = globalThis.localStorage,
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  search = ''
} = {}) {
  if (!shouldPostCoPracticeResearchIngest({ storage, search, receiveConfigured: Boolean(getBaseUrl()) })) {
    return { ok: false, reason: 'not_consented', skipped: true };
  }
  const payload = buildCoPracticeResearchUploadPayload({ storage });
  if (!payload) return { ok: false, reason: 'no_payload', skipped: true };
  const body = serializeCoPracticeResearchPayload(payload);
  try {
    if (storage?.getItem(CO_PRACTICE_RESEARCH_LAST_POST_KEY) === body) {
      return { ok: true, skipped: true, reason: 'unchanged' };
    }
  } catch {
    /* ignore */
  }
  try {
    await postJson(CO_PRACTICE_RESEARCH_INGEST_PATH, { body });
    try {
      storage?.setItem(CO_PRACTICE_RESEARCH_LAST_POST_KEY, body);
    } catch {
      /* ignore */
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'post_failed' };
  }
}

/**
 * @param {object} opts
 * @param {string} opts.studyId
 * @param {typeof fetch} [opts.fetchFn]
 * @param {typeof getCloudApiBaseUrl} [opts.getBaseUrl]
 */
export async function deleteCoPracticeResearchIngest({
  studyId,
  fetchFn = globalThis.fetch,
  getBaseUrl = getCloudApiBaseUrl
}) {
  if (!studyId) {
    return { ok: false, reason: 'no_study_id', skipped: true };
  }
  const base = getBaseUrl();
  if (!base) {
    return { ok: false, reason: 'cloud_api_unconfigured', skipped: true };
  }
  if (typeof fetchFn !== 'function') {
    return { ok: false, reason: 'fetch_unavailable' };
  }
  try {
    const res = await fetchFn(`${base}${CO_PRACTICE_RESEARCH_INGEST_PATH}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studyId}` }
    });
    if (!res.ok) {
      return { ok: false, reason: `http_${res.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'delete_failed' };
  }
}

/**
 * @param {object} [opts]
 */
export async function revokeCoPracticeResearchAndDeleteRemote(opts = {}) {
  const storage = opts.storage ?? globalThis.localStorage;
  const { studyId } = revokeCoPracticeResearchConsent(storage);
  let deleteResult = { ok: true, skipped: true, reason: 'no_study_id' };
  if (studyId) {
    deleteResult = await deleteCoPracticeResearchIngest({
      studyId,
      fetchFn: opts.fetchFn,
      getBaseUrl: opts.getBaseUrl
    });
  }
  try {
    storage?.removeItem(CO_PRACTICE_RESEARCH_LAST_POST_KEY);
  } catch {
    /* ignore */
  }
  clearCoPracticeResearchWeeklySchedule(storage);
  return { studyId, localCleared: true, deleteResult };
}

export {
  grantCoPracticeResearchConsent,
  CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY,
  CO_PRACTICE_RESEARCH_DEV_FIXTURE_KEY
} from './coPracticeResearchConsent.js';
