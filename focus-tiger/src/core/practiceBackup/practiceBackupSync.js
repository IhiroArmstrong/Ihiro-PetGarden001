/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Practice-backup sync: debounce upload, boot restore, disable+delete.
 */

import { postCloudJson, getCloudApiBaseUrl } from '../cloudApiClient.js';
import {
  serializePracticeBackupSnapshot,
  parsePracticeBackupSnapshotClient,
  isPracticeBackupWhitelistCompletelyEmpty,
  writePracticeBackupStoresRaw,
  PRACTICE_BACKUP_STORE_KEYS
} from './practiceBackupSnapshot.js';
import {
  readPracticeBackupOptIn,
  writePracticeBackupOptIn,
  clearPracticeBackupOptIn,
  canPracticeBackupUpload,
  emptyPracticeBackupOptInState
} from './practiceBackupOptIn.js';
import { normalizeOwnershipState } from '../entitlement/entitlementOwnership.js';
import { normalizeJourneyLogState } from '../journeyLogGate.js';
import { normalizeRitualCompletionState } from '../RitualCompletionStore.js';

export const PRACTICE_BACKUP_DEBOUNCE_MS = 10 * 60 * 1000;
export const PRACTICE_BACKUP_MIN_UPLOAD_GAP_MS = 60 * 1000;

/** @type {ReturnType<typeof setTimeout> | null} */
let debounceTimer = null;
let lastFlushAttemptMs = 0;
let inFlight = false;

/**
 * @param {object} [opts]
 * @param {() => boolean} [opts.isBusy]
 * Busy = Focusing / Arrival / Reflection / micro-ritual — skip network.
 */
let busyProbe = () => false;

/**
 * @param {() => boolean} fn
 */
export function setPracticeBackupBusyProbe(fn) {
  busyProbe = typeof fn === 'function' ? fn : () => false;
}

export function resetPracticeBackupSyncForTests() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
  lastFlushAttemptMs = 0;
  inFlight = false;
  busyProbe = () => false;
}

/**
 * Normalize each store before write (esp. ownership persistent filter).
 * @param {import('./practiceBackupSnapshot.js').PracticeBackupSnapshot} snapshot
 */
export function normalizeSnapshotStoresForApply(snapshot) {
  /** @type {Record<string, unknown | null>} */
  const stores = {};
  for (const key of PRACTICE_BACKUP_STORE_KEYS) {
    const val = snapshot.stores[key];
    if (val == null) {
      stores[key] = null;
      continue;
    }
    try {
      if (key === 'focus-tiger.journey-log.v1') {
        stores[key] = normalizeJourneyLogState(val);
      } else if (key === 'focus-tiger.entitlement-ownership.v1') {
        stores[key] = normalizeOwnershipState(val);
      } else if (key === 'focus-tiger.ritual-completions.v1') {
        stores[key] = normalizeRitualCompletionState(val);
      } else if (key === 'focus-tiger.milestone-glow.v1') {
        const played = Array.isArray(
          /** @type {{ played?: unknown }} */ (val).played
        )
          ? /** @type {{ played: unknown[] }} */ (val).played.filter(
              (x) => typeof x === 'string' && x
            )
          : [];
        stores[key] = { played };
      } else if (key === 'focus-tiger.practice-days.v1') {
        stores[key] = val;
      } else if (key === 'focus-tiger.mustard-seed-seal.v1') {
        stores[key] = val;
      } else {
        stores[key] = val;
      }
    } catch {
      stores[key] = null;
    }
  }
  return { ...snapshot, stores };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {import('./practiceBackupSnapshot.js').PracticeBackupSnapshot} snapshot
 */
export function applyPracticeBackupSnapshot(storage, snapshot) {
  const normalized = normalizeSnapshotStoresForApply(snapshot);
  writePracticeBackupStoresRaw(storage, normalized);
}

/**
 * Schedule a debounced whole-snapshot upload after local whitelist mutation.
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {number} [opts.debounceMs]
 * @param {boolean} [opts.forceSoon] Idle flush — still respects min gap unless force
 */
export function schedulePracticeBackupUpload(opts = {}) {
  const storage =
    opts.storage ??
    (typeof localStorage !== 'undefined' ? localStorage : null);
  const debounceMs = opts.debounceMs ?? PRACTICE_BACKUP_DEBOUNCE_MS;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void flushPracticeBackupUpload({ storage, force: Boolean(opts.forceSoon) });
  }, debounceMs);
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {boolean} [opts.force]
 * @param {number} [opts.minGapMs]
 * @param {typeof postCloudJson} [opts.postJson]
 * @returns {Promise<{ ok: boolean, reason?: string, skipped?: boolean }>}
 */
export async function flushPracticeBackupUpload(opts = {}) {
  const storage =
    opts.storage ??
    (typeof localStorage !== 'undefined' ? localStorage : null);
  const postJson = opts.postJson ?? postCloudJson;
  const minGapMs = opts.minGapMs ?? PRACTICE_BACKUP_MIN_UPLOAD_GAP_MS;
  const state = readPracticeBackupOptIn(storage);

  if (!canPracticeBackupUpload(state)) {
    return { ok: false, reason: 'not_consented', skipped: true };
  }
  const usingDefaultClient = postJson === postCloudJson;
  if (usingDefaultClient && !getCloudApiBaseUrl()) {
    return { ok: false, reason: 'cloud_unconfigured', skipped: true };
  }
  if (busyProbe()) {
    return { ok: false, reason: 'busy', skipped: true };
  }
  const now = Date.now();
  if (!opts.force && now - lastFlushAttemptMs < minGapMs) {
    return { ok: false, reason: 'throttled', skipped: true };
  }
  if (inFlight) {
    return { ok: false, reason: 'in_flight', skipped: true };
  }

  inFlight = true;
  lastFlushAttemptMs = now;
  const snapshot = serializePracticeBackupSnapshot(storage);
  try {
    await postJson('/api/practice-backup/put', {
      body: JSON.stringify({
        email: state.email,
        deviceToken: state.deviceToken,
        snapshot
      })
    });
    writePracticeBackupOptIn(storage, {
      ...state,
      lastUploadAt: new Date().toISOString(),
      lastUploadError: null
    });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'upload_failed';
    writePracticeBackupOptIn(storage, {
      ...state,
      lastUploadError: msg
    });
    return { ok: false, reason: msg };
  } finally {
    inFlight = false;
  }
}

/**
 * Boot: restore only if whitelist completely empty.
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {typeof postCloudJson} [opts.postJson]
 */
export async function maybeRestorePracticeBackupOnBoot(opts = {}) {
  const storage =
    opts.storage ??
    (typeof localStorage !== 'undefined' ? localStorage : null);
  const postJson = opts.postJson ?? postCloudJson;
  const state = readPracticeBackupOptIn(storage);
  if (!canPracticeBackupUpload(state)) {
    return { ok: false, reason: 'not_consented', skipped: true };
  }
  if (!isPracticeBackupWhitelistCompletelyEmpty(storage)) {
    return { ok: false, reason: 'local_not_empty', skipped: true };
  }
  try {
    const body = await postJson('/api/practice-backup/get', {
      body: JSON.stringify({
        email: state.email,
        deviceToken: state.deviceToken
      })
    });
    const snapRaw = body && typeof body === 'object' ? body.snapshot : null;
    if (!snapRaw) {
      return { ok: false, reason: 'no_snapshot', skipped: true };
    }
    const parsed = parsePracticeBackupSnapshotClient(snapRaw);
    if (!parsed.ok) {
      return { ok: false, reason: parsed.reason };
    }
    // Re-check emptiness in case something wrote during await
    if (!isPracticeBackupWhitelistCompletelyEmpty(storage)) {
      return { ok: false, reason: 'local_not_empty_race', skipped: true };
    }
    applyPracticeBackupSnapshot(storage, parsed.snapshot);
    writePracticeBackupOptIn(storage, {
      ...state,
      lastRestoreAt: new Date().toISOString()
    });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'restore_failed';
    return { ok: false, reason: msg };
  }
}

/**
 * Disable backup: OTP delete cloud snapshot, then clear local opt-in.
 * @param {object} opts
 * @param {Storage | null} [opts.storage]
 * @param {string} opts.code
 * @param {typeof postCloudJson} [opts.postJson]
 */
export async function disablePracticeBackupAndDeleteCloud(opts) {
  const storage =
    opts.storage ??
    (typeof localStorage !== 'undefined' ? localStorage : null);
  const postJson = opts.postJson ?? postCloudJson;
  const state = readPracticeBackupOptIn(storage);
  if (!state.email) {
    clearPracticeBackupOptIn(storage);
    return { ok: false, reason: 'no_email' };
  }
  try {
    await postJson('/api/practice-backup/delete', {
      body: JSON.stringify({
        email: state.email,
        code: opts.code,
        deviceToken: state.deviceToken || undefined
      })
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'delete_failed';
    return { ok: false, reason: msg };
  }
  clearPracticeBackupOptIn(storage);
  return { ok: true };
}

/**
 * After successful verify — persist opt-in.
 * @param {Storage | null | undefined} storage
 * @param {{ email: string, deviceToken: string, consentedAt?: string }} creds
 */
export function enablePracticeBackupOptIn(storage, creds) {
  const prev = readPracticeBackupOptIn(storage);
  writePracticeBackupOptIn(storage, {
    ...emptyPracticeBackupOptInState(),
    ...prev,
    enabled: true,
    consentedAt: creds.consentedAt || new Date().toISOString(),
    email: creds.email,
    deviceToken: creds.deviceToken,
    lastUploadError: null
  });
}

export async function requestPracticeBackupOtp(email, postJson = postCloudJson) {
  return postJson('/api/practice-backup/request-otp', {
    body: JSON.stringify({ email })
  });
}

export async function verifyPracticeBackupOtp(
  email,
  code,
  postJson = postCloudJson
) {
  return postJson('/api/practice-backup/verify', {
    body: JSON.stringify({ email, code })
  });
}
