/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Local export/import for practice-memory snapshot (same schema as cloud backup).
 */

import {
  serializePracticeBackupSnapshot,
  parsePracticeBackupSnapshotClient,
  isPracticeBackupWhitelistCompletelyEmpty,
  isPracticeBackupStoreEmpty,
  PRACTICE_BACKUP_SCHEMA_VERSION,
  PRACTICE_BACKUP_STORE_KEYS,
  PRACTICE_BACKUP_V1_STORE_KEYS,
  practiceBackupStoreKeysForSchemaVersion,
  stringifyPracticeBackupStorageValue,
  parsePracticeBackupStorageRaw
} from './practiceBackupSnapshot.js';
import {
  readCompanionBackupBundle,
  writeCompanionBackupBundle
} from './practiceBackupCompanionIo.js';
import { reconcileDailyCompletionAfterRestore } from './practiceBackupDailyCompletionReconcile.js';
import { normalizeSnapshotStoresForApply } from './practiceBackupSync.js';

/** Dispatched after a successful local import (Preferences backup panel). */
export const PRACTICE_DATA_IMPORTED_EVENT = 'ft:practice-data-imported';

/**
 * @param {EventTarget | undefined} [target]
 */
export function dispatchPracticeDataImported(target = globalThis) {
  target?.dispatchEvent?.(new Event(PRACTICE_DATA_IMPORTED_EVENT));
}

/**
 * @param {EventListener} handler
 * @param {EventTarget | undefined} [target]
 * @returns {() => void} unsubscribe
 */
export function subscribePracticeDataImported(handler, target = globalThis) {
  if (!target?.addEventListener) return () => {};
  target.addEventListener(PRACTICE_DATA_IMPORTED_EVENT, handler);
  return () => {
    target.removeEventListener(PRACTICE_DATA_IMPORTED_EVENT, handler);
  };
}

/**
 * Friendly local time for import preview (no extra date lib).
 * @param {string} iso
 * @param {() => Date} [now]
 * @param {(key: string) => string} [translate]
 */
export function formatPracticeImportSavedAt(
  iso,
  now = () => new Date(),
  translate = (key) => key
) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || '');
  const pad = (n) => String(n).padStart(2, '0');
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const n = now();
  const sameDay =
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate();
  if (sameDay) {
    return translate('LOCAL_DATA_IMPORT_SAVED_TODAY').replace('{time}', hm);
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hm}`;
}

/** @typedef {string} PracticeDataCategoryId */

/** @type {readonly { id: PracticeDataCategoryId, storeKey?: string, companionField?: string }[]} */
export const PRACTICE_DATA_CATEGORY_DEFS = Object.freeze([
  { id: 'journey_log', storeKey: 'focus-tiger.journey-log.v1' },
  { id: 'practice_days', storeKey: 'focus-tiger.practice-days.v1' },
  { id: 'milestone_glow', storeKey: 'focus-tiger.milestone-glow.v1' },
  { id: 'entitlement_ownership', storeKey: 'focus-tiger.entitlement-ownership.v1' },
  { id: 'ritual_completions', storeKey: 'focus-tiger.ritual-completions.v1' },
  { id: 'mustard_seed_seal', storeKey: 'focus-tiger.mustard-seed-seal.v1' },
  { id: 'presence_signals', storeKey: 'focus-tiger.presence-signals.v1' },
  { id: 'reflections', storeKey: 'focus-tiger.reflections.v1' },
  { id: 'yin_memory', companionField: 'yinPersonalMemory' },
  { id: 'confide_turns', companionField: 'confideTurnsJsonl' },
  { id: 'locale_pref', storeKey: 'focus-tiger.locale.v1' },
  { id: 'reminder_pref', storeKey: 'focus-tiger.reminder-preference.v1' },
  { id: 'companion_mode', storeKey: 'focus-tiger.companion-mode.v1' },
  { id: 'ambient_pref', storeKey: 'focus-tiger.ambient-pref.v1' },
  { id: 'session_cues', storeKey: 'focus-tiger.session-cues.v1' }
]);

/**
 * @param {Date} [now]
 */
export function buildPracticeExportFilename(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `focus-tiger-backup-${y}-${m}-${d}-${hh}${mm}${ss}.json`;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 */
export async function createPracticeExportPayload(storage, now = () => new Date()) {
  const snapshot = serializePracticeBackupSnapshot(storage, now);
  const companionFiles = await readCompanionBackupBundle();
  if (companionFiles) {
    snapshot.companionFiles = companionFiles;
  }
  return {
    snapshot,
    json: JSON.stringify(snapshot, null, 2),
    filename: buildPracticeExportFilename(now())
  };
}

/**
 * @param {unknown} raw
 * @returns {{ ok: true, snapshot: import('./practiceBackupSnapshot.js').PracticeBackupSnapshot } | { ok: false, reason: string, messageKey: string }}
 */
export function validatePracticeImportPayload(raw) {
  let parsed;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return { ok: false, reason: 'invalid_json', messageKey: 'LOCAL_DATA_IMPORT_ERR_JSON' };
  }
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, reason: 'not_object', messageKey: 'LOCAL_DATA_IMPORT_ERR_FORMAT' };
  }
  const version = /** @type {{ schemaVersion?: unknown }} */ (parsed).schemaVersion;
  if (typeof version !== 'number') {
    return { ok: false, reason: 'missing_version', messageKey: 'LOCAL_DATA_IMPORT_ERR_FORMAT' };
  }
  if (version > PRACTICE_BACKUP_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: 'version_too_new',
      messageKey: 'LOCAL_DATA_IMPORT_ERR_VERSION_NEW'
    };
  }
  let working = parsed;
  if (version < PRACTICE_BACKUP_SCHEMA_VERSION) {
    const migrated = migratePracticeSnapshot(working, version, PRACTICE_BACKUP_SCHEMA_VERSION);
    if (!migrated.ok) {
      return {
        ok: false,
        reason: migrated.reason,
        messageKey: 'LOCAL_DATA_IMPORT_ERR_VERSION_OLD'
      };
    }
    working = migrated.snapshot;
  }
  const check = parsePracticeBackupSnapshotClient(working);
  if (!check.ok) {
    return { ok: false, reason: check.reason, messageKey: 'LOCAL_DATA_IMPORT_ERR_FORMAT' };
  }
  return { ok: true, snapshot: check.snapshot };
}

/**
 * @param {unknown} snapshot
 * @param {number} fromVersion
 * @param {number} toVersion
 */
export function migratePracticeSnapshot(snapshot, fromVersion, toVersion) {
  if (fromVersion === toVersion) {
    return { ok: true, snapshot };
  }
  if (fromVersion === 1 && toVersion === 2) {
    if (!snapshot || typeof snapshot !== 'object') {
      return { ok: false, reason: 'not_object' };
    }
    const o = /** @type {Record<string, unknown>} */ (snapshot);
    const storesIn =
      o.stores && typeof o.stores === 'object' && !Array.isArray(o.stores)
        ? /** @type {Record<string, unknown>} */ (o.stores)
        : {};
    /** @type {Record<string, unknown | null>} */
    const stores = {};
    for (const key of PRACTICE_BACKUP_STORE_KEYS) {
      if (key in storesIn) {
        stores[key] = storesIn[key] ?? null;
      } else if (PRACTICE_BACKUP_V1_STORE_KEYS.includes(key)) {
        stores[key] = storesIn[key] ?? null;
      } else {
        stores[key] = null;
      }
    }
    return {
      ok: true,
      snapshot: {
        schemaVersion: 2,
        savedAt: typeof o.savedAt === 'string' ? o.savedAt : new Date().toISOString(),
        stores,
        companionFiles: null
      }
    };
  }
  return { ok: false, reason: `no_migration_${fromVersion}_to_${toVersion}` };
}

/**
 * @param {string} storeKey
 * @param {unknown | null} val
 * @returns {number | null} null = cannot count; show "included" in UI
 */
export function countPracticeStoreEntries(storeKey, val) {
  if (val == null) return 0;
  if (typeof val === 'string') {
    if (
      storeKey === 'focus-tiger.locale.v1' ||
      storeKey === 'focus-tiger.companion-mode.v1'
    ) {
      return val.trim() ? 1 : 0;
    }
    if (storeKey === 'focus-tiger.presence-freetext-l3-consent.v1') {
      return val === 'granted' || val === 'denied' ? 1 : 0;
    }
    return val.trim() ? 1 : 0;
  }
  if (typeof val !== 'object') return null;
  switch (storeKey) {
    case 'focus-tiger.journey-log.v1': {
      const entries = /** @type {{ entries?: unknown }} */ (val).entries;
      return Array.isArray(entries) ? entries.length : 0;
    }
    case 'focus-tiger.practice-days.v1': {
      const days = /** @type {{ days?: unknown }} */ (val).days;
      return Array.isArray(days) ? days.length : 0;
    }
    case 'focus-tiger.milestone-glow.v1': {
      const played = /** @type {{ played?: unknown }} */ (val).played;
      return Array.isArray(played) ? played.length : 0;
    }
    case 'focus-tiger.entitlement-ownership.v1': {
      const owned = /** @type {{ owned?: unknown }} */ (val).owned;
      if (!owned || typeof owned !== 'object') return 0;
      return Object.keys(owned).length;
    }
    case 'focus-tiger.ritual-completions.v1': {
      const entries = /** @type {{ entries?: unknown }} */ (val).entries;
      return Array.isArray(entries) ? entries.length : 0;
    }
    case 'focus-tiger.mustard-seed-seal.v1':
      return /** @type {{ revealed?: unknown }} */ (val).revealed === true ? 1 : 0;
    case 'focus-tiger.presence-signals.v1': {
      const entries = /** @type {{ entries?: unknown }} */ (val).entries;
      return Array.isArray(entries) ? entries.length : 0;
    }
    case 'focus-tiger.reflections.v1':
      return Array.isArray(val) ? val.length : 0;
    case 'focus-tiger.reminder-preference.v1':
      return typeof val.hour === 'number' && typeof val.minute === 'number' ? 1 : 0;
    case 'focus-tiger.ambient-pref.v1':
    case 'focus-tiger.session-cues.v1':
      return Object.keys(val).length > 0 ? 1 : 0;
    default:
      return null;
  }
}

/**
 * @param {string} companionField
 * @param {unknown} val
 * @returns {number | null}
 */
export function countCompanionBackupEntries(companionField, val) {
  if (companionField === 'yinPersonalMemory') {
    if (!val || typeof val !== 'object') return 0;
    const memories = /** @type {{ memories?: unknown }} */ (val).memories;
    return Array.isArray(memories) ? memories.length : 0;
  }
  if (companionField === 'confideTurnsJsonl') {
    if (val == null || val === '') return 0;
    if (typeof val !== 'string') return null;
    const trimmed = val.trim();
    if (!trimmed) return 0;
    return trimmed.split('\n').filter((line) => line.trim()).length;
  }
  return null;
}

/**
 * @param {import('./practiceBackupSnapshot.js').PracticeBackupSnapshot} snapshot
 */
export function summarizePracticeSnapshot(snapshot) {
  return PRACTICE_DATA_CATEGORY_DEFS.map((def) => {
    if (def.storeKey) {
      return {
        id: def.id,
        storeKey: def.storeKey,
        count: countPracticeStoreEntries(
          def.storeKey,
          snapshot.stores[def.storeKey] ?? null
        )
      };
    }
    const companionVal = def.companionField
      ? snapshot.companionFiles?.[def.companionField] ?? null
      : null;
    return {
      id: def.id,
      storeKey: def.companionField ?? '',
      count: def.companionField
        ? countCompanionBackupEntries(def.companionField, companionVal)
        : null
    };
  });
}

/**
 * @param {Storage | null | undefined} storage
 */
export function summarizeLocalPracticeSnapshot(storage) {
  const snapshot = serializePracticeBackupSnapshot(storage);
  return {
    savedAt: snapshot.savedAt,
    categories: summarizePracticeSnapshot(snapshot)
  };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function hasLocalPracticeData(storage) {
  return !isPracticeBackupWhitelistCompletelyEmpty(storage);
}

/**
 * Compare local vs import counts for overwrite UI.
 * @param {Storage | null | undefined} storage
 * @param {import('./practiceBackupSnapshot.js').PracticeBackupSnapshot} importSnapshot
 */
export function comparePracticeImportCounts(storage, importSnapshot) {
  const localSnapshot = serializePracticeBackupSnapshot(storage);
  const local = summarizePracticeSnapshot(localSnapshot);
  const imported = summarizePracticeSnapshot(importSnapshot);
  return PRACTICE_DATA_CATEGORY_DEFS.map((def, i) => ({
    id: def.id,
    localCount: local[i].count,
    importCount: imported[i].count
  }));
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {Record<string, string | null>}
 */
function backupLocalStoreRaw(storage) {
  /** @type {Record<string, string | null>} */
  const backup = {};
  if (!storage) return backup;
  for (const key of PRACTICE_BACKUP_STORE_KEYS) {
    try {
      backup[key] = storage.getItem(key);
    } catch {
      backup[key] = null;
    }
  }
  return backup;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {Record<string, string | null>} backup
 */
function restoreLocalStoreRaw(storage, backup) {
  if (!storage) return;
  for (const key of PRACTICE_BACKUP_STORE_KEYS) {
    try {
      const val = backup[key];
      if (val == null) storage.removeItem(key);
      else storage.setItem(key, val);
    } catch {
      // ignore quota
    }
  }
}

/**
 * Atomic import with rollback on failure.
 * @param {Storage | null | undefined} storage
 * @param {import('./practiceBackupSnapshot.js').PracticeBackupSnapshot} snapshot
 */
export async function importPracticeSnapshotAtomic(storage, snapshot) {
  if (!storage) {
    return { ok: false, reason: 'no_storage' };
  }
  const priorRaw = backupLocalStoreRaw(storage);
  const priorCompanion = await readCompanionBackupBundle();
  const normalized = normalizeSnapshotStoresForApply(snapshot);
  const storeKeys =
    practiceBackupStoreKeysForSchemaVersion(normalized.schemaVersion) ??
    PRACTICE_BACKUP_STORE_KEYS;
  try {
    for (const key of storeKeys) {
      const val = normalized.stores[key];
      if (val == null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, stringifyPracticeBackupStorageValue(val));
      }
    }
    reconcileDailyCompletionAfterRestore(storage, new Date());
    const companionResult = await writeCompanionBackupBundle(
      snapshot.companionFiles ?? null
    );
    if (!companionResult.ok) {
      throw new Error(companionResult.reason || 'companion_import_failed');
    }
    return { ok: true };
  } catch (err) {
    restoreLocalStoreRaw(storage, priorRaw);
    if (priorCompanion) {
      await writeCompanionBackupBundle(priorCompanion);
    }
    const msg = err instanceof Error ? err.message : 'import_failed';
    return { ok: false, reason: msg };
  }
}

/**
 * Trigger browser download of export JSON.
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 */
export async function downloadPracticeExport(storage, now = () => new Date()) {
  const { json, filename } = await createPracticeExportPayload(storage, now);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { filename };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} storeKey
 */
export function readLocalStoreCount(storage, storeKey) {
  if (!storage) return 0;
  let raw = null;
  try {
    raw = storage.getItem(storeKey);
  } catch {
    return 0;
  }
  if (!raw) return 0;
  return countPracticeStoreEntries(storeKey, parsePracticeBackupStorageRaw(raw)) ?? 0;
}

/**
 * Whether import file has fewer entries than local for any category.
 * @param {Storage | null | undefined} storage
 * @param {import('./practiceBackupSnapshot.js').PracticeBackupSnapshot} importSnapshot
 */
export function importHasDataLossRisk(storage, importSnapshot) {
  const rows = comparePracticeImportCounts(storage, importSnapshot);
  return rows.some((row) => {
    if (row.localCount == null || row.importCount == null) return false;
    return row.importCount < row.localCount;
  });
}

/**
 * Whether import file has more entries than local for any category.
 * @param {Storage | null | undefined} storage
 * @param {import('./practiceBackupSnapshot.js').PracticeBackupSnapshot} importSnapshot
 */
export function importHasDataGain(storage, importSnapshot) {
  const rows = comparePracticeImportCounts(storage, importSnapshot);
  return rows.some((row) => {
    if (row.localCount == null || row.importCount == null) return false;
    return row.importCount > row.localCount;
  });
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} storeKey
 */
export function isLocalCategoryEmpty(storage, storeKey) {
  return isPracticeBackupStoreEmpty(storage, storeKey);
}
