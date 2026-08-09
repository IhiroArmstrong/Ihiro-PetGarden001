/**
 * Advanced RitualFlow completion log (independent of MicroRitual / Focus / journey).
 * MilestoneGlowStore-style: local only-add records; no Reflection handoff.
 */

import { isRitualId } from './RitualFlow.js';

export const RITUAL_COMPLETION_STORAGE_KEY =
  'focus-tiger.ritual-completions.v1';

/** Keep a short trail; older entries drop off the front. */
export const RITUAL_COMPLETION_MAX_ENTRIES = 40;

/**
 * @typedef {{
 *   ritualId: string,
 *   at: string,
 *   selections: Record<string, string>
 * }} RitualCompletionEntry
 *
 * @typedef {{ entries: RitualCompletionEntry[] }} RitualCompletionState
 */

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} raw
 * @returns {RitualCompletionState}
 */
export function normalizeRitualCompletionState(raw) {
  if (!raw || typeof raw !== 'object') return { entries: [] };
  const o = /** @type {Record<string, unknown>} */ (raw);
  const list = Array.isArray(o.entries) ? o.entries : [];
  /** @type {RitualCompletionEntry[]} */
  const entries = [];
  for (const row of list) {
    if (!row || typeof row !== 'object') continue;
    const r = /** @type {Record<string, unknown>} */ (row);
    const ritualId = typeof r.ritualId === 'string' ? r.ritualId : '';
    if (!isRitualId(ritualId)) continue;
    const at = typeof r.at === 'string' && r.at ? r.at : '';
    const selections =
      r.selections && typeof r.selections === 'object'
        ? Object.fromEntries(
            Object.entries(
              /** @type {Record<string, unknown>} */ (r.selections)
            ).filter(([, v]) => typeof v === 'string')
          )
        : {};
    entries.push({ ritualId, at, selections });
  }
  return { entries };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} [storageKey]
 * @returns {RitualCompletionState}
 */
export function readRitualCompletionState(
  storage,
  storageKey = RITUAL_COMPLETION_STORAGE_KEY
) {
  if (!storage) return normalizeRitualCompletionState(null);
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return normalizeRitualCompletionState(null);
    return normalizeRitualCompletionState(JSON.parse(raw));
  } catch {
    return normalizeRitualCompletionState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {RitualCompletionState} state
 * @param {string} [storageKey]
 */
export function writeRitualCompletionState(
  storage,
  state,
  storageKey = RITUAL_COMPLETION_STORAGE_KEY
) {
  if (!storage) return;
  try {
    const n = normalizeRitualCompletionState(state);
    storage.setItem(storageKey, JSON.stringify({ entries: n.entries }));
  } catch {
    // ignore
  }
}

export class RitualCompletionStore {
  /**
   * @param {{
   *   storage?: Storage | null,
   *   storageKey?: string,
   *   now?: () => Date,
   *   maxEntries?: number
   * }} [opts]
   */
  constructor(opts = {}) {
    this.storage =
      opts.storage === undefined ? getDefaultStorage() : opts.storage;
    this.storageKey = opts.storageKey ?? RITUAL_COMPLETION_STORAGE_KEY;
    this.now = opts.now ?? (() => new Date());
    this.maxEntries = opts.maxEntries ?? RITUAL_COMPLETION_MAX_ENTRIES;
    /** @type {RitualCompletionState} */
    this._memoryState = { entries: [] };
  }

  /** @returns {RitualCompletionEntry[]} */
  getEntries() {
    return this._read().entries.slice();
  }

  /**
   * @param {string} ritualId
   * @returns {RitualCompletionEntry[]}
   */
  getEntriesFor(ritualId) {
    return this.getEntries().filter((e) => e.ritualId === ritualId);
  }

  /**
   * @param {string} ritualId
   * @param {{
   *   selections?: Record<string, string>,
   *   at?: string
   * }} [meta]
   * @returns {RitualCompletionEntry | null}
   */
  recordCompletion(ritualId, meta = {}) {
    if (!isRitualId(ritualId)) return null;
    const entry = {
      ritualId,
      at: meta.at || this.now().toISOString(),
      selections: { ...(meta.selections || {}) }
    };
    const prev = this._read().entries.slice();
    prev.push(entry);
    const trimmed =
      prev.length > this.maxEntries
        ? prev.slice(prev.length - this.maxEntries)
        : prev;
    this._write({ entries: trimmed });
    return entry;
  }

  _read() {
    if (!this.storage) return this._memoryState;
    const state = readRitualCompletionState(this.storage, this.storageKey);
    this._memoryState = state;
    return this._memoryState;
  }

  /** @param {RitualCompletionState} state */
  _write(state) {
    this._memoryState = normalizeRitualCompletionState(state);
    writeRitualCompletionState(
      this.storage,
      this._memoryState,
      this.storageKey
    );
  }
}
