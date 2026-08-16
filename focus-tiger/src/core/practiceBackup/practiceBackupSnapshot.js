/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Practice-memory cloud backup · whitelist + snapshot helpers (client).
 */

export const PRACTICE_BACKUP_SCHEMA_VERSION = 1;

export const PRACTICE_BACKUP_STORE_KEYS = Object.freeze([
  'focus-tiger.journey-log.v1',
  'focus-tiger.practice-days.v1',
  'focus-tiger.milestone-glow.v1',
  'focus-tiger.entitlement-ownership.v1',
  'focus-tiger.ritual-completions.v1',
  'focus-tiger.mustard-seed-seal.v1'
]);

export const PRACTICE_BACKUP_OPT_IN_KEY = 'focus-tiger.practice-backup.v1';

/**
 * @typedef {{
 *   schemaVersion: number,
 *   savedAt: string,
 *   stores: Record<string, unknown | null>
 * }} PracticeBackupSnapshot
 */

/**
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 * @returns {PracticeBackupSnapshot}
 */
export function serializePracticeBackupSnapshot(
  storage,
  now = () => new Date()
) {
  /** @type {Record<string, unknown | null>} */
  const stores = {};
  for (const key of PRACTICE_BACKUP_STORE_KEYS) {
    if (!storage) {
      stores[key] = null;
      continue;
    }
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        stores[key] = null;
        continue;
      }
      stores[key] = JSON.parse(raw);
    } catch {
      stores[key] = null;
    }
  }
  return {
    schemaVersion: PRACTICE_BACKUP_SCHEMA_VERSION,
    savedAt: now().toISOString(),
    stores
  };
}

/**
 * Reject unknown keys; require exact whitelist.
 * @param {unknown} raw
 * @returns {{ ok: true, snapshot: PracticeBackupSnapshot } | { ok: false, reason: string }}
 */
export function parsePracticeBackupSnapshotClient(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'not_object' };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  if (o.schemaVersion !== PRACTICE_BACKUP_SCHEMA_VERSION) {
    return { ok: false, reason: 'schema' };
  }
  if (typeof o.savedAt !== 'string' || !o.savedAt) {
    return { ok: false, reason: 'savedAt' };
  }
  if (!o.stores || typeof o.stores !== 'object' || Array.isArray(o.stores)) {
    return { ok: false, reason: 'stores' };
  }
  const storesIn = /** @type {Record<string, unknown>} */ (o.stores);
  const keys = Object.keys(storesIn);
  if (keys.length !== PRACTICE_BACKUP_STORE_KEYS.length) {
    return { ok: false, reason: 'key_count' };
  }
  /** @type {Record<string, unknown | null>} */
  const stores = {};
  for (const key of PRACTICE_BACKUP_STORE_KEYS) {
    if (!(key in storesIn)) return { ok: false, reason: `missing:${key}` };
    stores[key] = storesIn[key] ?? null;
  }
  for (const key of keys) {
    if (!PRACTICE_BACKUP_STORE_KEYS.includes(key)) {
      return { ok: false, reason: `extra:${key}` };
    }
  }
  return {
    ok: true,
    snapshot: {
      schemaVersion: PRACTICE_BACKUP_SCHEMA_VERSION,
      savedAt: o.savedAt,
      stores
    }
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} key
 * @returns {boolean} true if empty / absent
 */
export function isPracticeBackupStoreEmpty(storage, key) {
  if (!storage) return true;
  let raw = null;
  try {
    raw = storage.getItem(key);
  } catch {
    return true;
  }
  if (!raw) return true;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return true;
  }
  if (!parsed || typeof parsed !== 'object') return true;

  switch (key) {
    case 'focus-tiger.journey-log.v1':
      return !Array.isArray(parsed.entries) || parsed.entries.length === 0;
    case 'focus-tiger.practice-days.v1':
      return !Array.isArray(parsed.days) || parsed.days.length === 0;
    case 'focus-tiger.milestone-glow.v1':
      return !Array.isArray(parsed.played) || parsed.played.length === 0;
    case 'focus-tiger.entitlement-ownership.v1': {
      const owned =
        parsed.owned && typeof parsed.owned === 'object' ? parsed.owned : {};
      return Object.keys(owned).length === 0;
    }
    case 'focus-tiger.ritual-completions.v1':
      return !Array.isArray(parsed.entries) || parsed.entries.length === 0;
    case 'focus-tiger.mustard-seed-seal.v1':
      return parsed.revealed !== true;
    default:
      return true;
  }
}

/**
 * Auto-restore only when ALL whitelist keys are empty.
 * @param {Storage | null | undefined} storage
 */
export function isPracticeBackupWhitelistCompletelyEmpty(storage) {
  return PRACTICE_BACKUP_STORE_KEYS.every((key) =>
    isPracticeBackupStoreEmpty(storage, key)
  );
}

/**
 * Write snapshot stores back (raw setItem after client-side parse gate).
 * Callers that need ownership normalize should pass pre-normalized values
 * or use applyPracticeBackupSnapshot.
 * @param {Storage | null | undefined} storage
 * @param {PracticeBackupSnapshot} snapshot
 */
export function writePracticeBackupStoresRaw(storage, snapshot) {
  if (!storage) return;
  for (const key of PRACTICE_BACKUP_STORE_KEYS) {
    const val = snapshot.stores[key];
    try {
      if (val == null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, JSON.stringify(val));
      }
    } catch {
      // ignore quota
    }
  }
}
