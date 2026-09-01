/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Local export/import + cloud backup · whitelist + snapshot helpers (client).
 */

export const PRACTICE_BACKUP_SCHEMA_VERSION = 2;

/** Legacy cloud snapshot (6 keys). Import still accepted via migration. */
export const PRACTICE_BACKUP_V1_STORE_KEYS = Object.freeze([
  'focus-tiger.journey-log.v1',
  'focus-tiger.practice-days.v1',
  'focus-tiger.milestone-glow.v1',
  'focus-tiger.entitlement-ownership.v1',
  'focus-tiger.ritual-completions.v1',
  'focus-tiger.mustard-seed-seal.v1'
]);

export const PRACTICE_BACKUP_STORE_KEYS = Object.freeze([
  ...PRACTICE_BACKUP_V1_STORE_KEYS,
  'focus-tiger.presence-signals.v1',
  'focus-tiger.presence-freetext-l3-consent.v1',
  'focus-tiger.reflections.v1',
  'focus-tiger.locale.v1',
  'focus-tiger.reminder-preference.v1',
  'focus-tiger.companion-mode.v1',
  'focus-tiger.ambient-pref.v1',
  'focus-tiger.session-cues.v1'
]);

export const PRACTICE_BACKUP_OPT_IN_KEY = 'focus-tiger.practice-backup.v1';

/**
 * @typedef {{
 *   yinPersonalMemory?: unknown | null,
 *   confideTurnsJsonl?: string | null
 * }} PracticeBackupCompanionFiles
 */

/**
 * @typedef {{
 *   schemaVersion: number,
 *   savedAt: string,
 *   stores: Record<string, unknown | null>,
 *   companionFiles?: PracticeBackupCompanionFiles | null
 * }} PracticeBackupSnapshot
 */

/**
 * @param {number} schemaVersion
 * @returns {readonly string[] | null}
 */
export function practiceBackupStoreKeysForSchemaVersion(schemaVersion) {
  if (schemaVersion === 1) return PRACTICE_BACKUP_V1_STORE_KEYS;
  if (schemaVersion === PRACTICE_BACKUP_SCHEMA_VERSION) {
    return PRACTICE_BACKUP_STORE_KEYS;
  }
  return null;
}

/**
 * @param {string | null} raw
 * @returns {unknown | null}
 */
export function parsePracticeBackupStorageRaw(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/**
 * @param {unknown | null} val
 * @returns {string}
 */
export function stringifyPracticeBackupStorageValue(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  return JSON.stringify(val);
}

/**
 * @param {unknown} companionFiles
 * @returns {PracticeBackupCompanionFiles | undefined}
 */
export function normalizePracticeBackupCompanionFiles(companionFiles) {
  if (!companionFiles || typeof companionFiles !== 'object') return undefined;
  const o = /** @type {Record<string, unknown>} */ (companionFiles);
  /** @type {PracticeBackupCompanionFiles} */
  const out = {};
  if ('yinPersonalMemory' in o) {
    out.yinPersonalMemory = o.yinPersonalMemory ?? null;
  }
  if ('confideTurnsJsonl' in o) {
    const turns = o.confideTurnsJsonl;
    out.confideTurnsJsonl =
      turns == null ? null : typeof turns === 'string' ? turns : null;
  }
  if (
    out.yinPersonalMemory == null &&
    out.confideTurnsJsonl == null &&
    !('yinPersonalMemory' in o) &&
    !('confideTurnsJsonl' in o)
  ) {
    return undefined;
  }
  return out;
}

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
      stores[key] = parsePracticeBackupStorageRaw(raw);
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
 * Reject unknown keys; require exact whitelist for schema version.
 * @param {unknown} raw
 * @returns {{ ok: true, snapshot: PracticeBackupSnapshot } | { ok: false, reason: string }}
 */
export function parsePracticeBackupSnapshotClient(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'not_object' };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const schemaVersion = o.schemaVersion;
  if (typeof schemaVersion !== 'number') {
    return { ok: false, reason: 'schema' };
  }
  const expectedKeys = practiceBackupStoreKeysForSchemaVersion(schemaVersion);
  if (!expectedKeys) {
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
  if (keys.length !== expectedKeys.length) {
    return { ok: false, reason: 'key_count' };
  }
  /** @type {Record<string, unknown | null>} */
  const stores = {};
  for (const key of expectedKeys) {
    if (!(key in storesIn)) return { ok: false, reason: `missing:${key}` };
    stores[key] = storesIn[key] ?? null;
  }
  for (const key of keys) {
    if (!expectedKeys.includes(key)) {
      return { ok: false, reason: `extra:${key}` };
    }
  }
  const companionFiles =
    schemaVersion >= 2
      ? normalizePracticeBackupCompanionFiles(o.companionFiles)
      : undefined;
  return {
    ok: true,
    snapshot: {
      schemaVersion,
      savedAt: o.savedAt,
      stores,
      ...(companionFiles ? { companionFiles } : {})
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

  if (key === 'focus-tiger.presence-freetext-l3-consent.v1') {
    return raw !== 'granted' && raw !== 'denied';
  }
  if (key === 'focus-tiger.locale.v1' || key === 'focus-tiger.companion-mode.v1') {
    return !String(raw).trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return !String(raw).trim();
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
    case 'focus-tiger.presence-signals.v1':
      return !Array.isArray(parsed.entries) || parsed.entries.length === 0;
    case 'focus-tiger.reflections.v1':
      return !Array.isArray(parsed) || parsed.length === 0;
    case 'focus-tiger.reminder-preference.v1':
      return (
        typeof parsed.hour !== 'number' ||
        typeof parsed.minute !== 'number'
      );
    case 'focus-tiger.ambient-pref.v1':
    case 'focus-tiger.session-cues.v1':
      return Object.keys(parsed).length === 0;
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
 * Stable fingerprint of whitelist stores (ignores savedAt).
 * @param {PracticeBackupSnapshot | null | undefined} snapshot
 */
export function practiceBackupStoresFingerprint(snapshot) {
  try {
    return JSON.stringify({
      stores: snapshot?.stores ?? null,
      companionFiles: snapshot?.companionFiles ?? null
    });
  } catch {
    return '';
  }
}

/**
 * @param {string | null} prev
 * @param {string} next
 */
function storageTextUnchanged(prev, next) {
  if (prev === next) return true;
  if (prev == null) return false;
  try {
    return JSON.stringify(JSON.parse(prev)) === JSON.stringify(JSON.parse(next));
  } catch {
    return prev === next;
  }
}

export function writePracticeBackupStoresRaw(storage, snapshot) {
  if (!storage) return { wrote: 0, skipped: 0 };
  let wrote = 0;
  let skipped = 0;
  const keys =
    practiceBackupStoreKeysForSchemaVersion(snapshot.schemaVersion) ??
    PRACTICE_BACKUP_STORE_KEYS;
  for (const key of keys) {
    const val = snapshot.stores[key];
    try {
      if (val == null) {
        if (storage.getItem(key) == null) {
          skipped += 1;
        } else {
          storage.removeItem(key);
          wrote += 1;
        }
      } else {
        const next = stringifyPracticeBackupStorageValue(val);
        if (storageTextUnchanged(storage.getItem(key), next)) {
          skipped += 1;
        } else {
          storage.setItem(key, next);
          wrote += 1;
        }
      }
    } catch {
      // ignore quota
    }
  }
  return { wrote, skipped };
}
