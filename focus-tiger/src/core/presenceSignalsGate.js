/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Presence Signals · structured companion observations (not clinical scores).
 *
 * SSOT for trend / tag queries (Confide presence_facts). Journey Log and
 * reflections.v1 serve other purposes; when both exist, trend answers read
 * from this ledger only.
 *
 * Web + Electron: localStorage. Not in practice cloud backup. Not Yin Memory.
 */

export const PRESENCE_SIGNALS_STORAGE_KEY = 'focus-tiger.presence-signals.v1';

/** Cap stored events (newest at the end). */
export const PRESENCE_SIGNALS_MAX_ENTRIES = 240;

/** freeText stripped after this many local-calendar days (emotionTag kept). */
export const PRESENCE_SIGNALS_FREE_TEXT_RETENTION_DAYS = 90;

/** Below this count in a window, Confide must not describe a trend. */
export const PRESENCE_SIGNALS_MIN_TREND_COUNT = 3;

/** Default Confide window for “past two weeks” style questions. */
export const PRESENCE_SIGNALS_DEFAULT_WINDOW_DAYS = 14;

/** Closed vocabulary ids (Arrival Notice + future ritual chips). */
export const PRESENCE_EMOTION_TAG_IDS = Object.freeze([
  'calm',
  'okay',
  'busyMind',
  'stressed',
  'lowEnergy',
  'notSure',
  'anxious',
  'frustrated',
  'tired',
  'busy',
  'heavy',
  'focus',
  'patience',
  'creativity',
  'kindness'
]);

/**
 * @typedef {'arrival_notice' | 'reflection_q1' | 'reflection_q2' | 'reflection_q3' | 'ritual_chip'} PresenceSignalSource
 *
 * @typedef {{
 *   id: string,
 *   at: string,
 *   source: PresenceSignalSource,
 *   emotionTag?: string,
 *   freeText?: string,
 *   ritualId?: string,
 *   field?: string
 * }} PresenceSignalEntry
 *
 * @typedef {{ entries: PresenceSignalEntry[] }} PresenceSignalsState
 */

/**
 * Local calendar date YYYY-MM-DD from an ISO timestamp (device timezone).
 * @param {string} iso
 * @returns {string}
 */
export function presenceSignalDateKey(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || '').slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Inclusive local-day window: today and the prior (windowDays - 1) days.
 * @param {Date} reference
 * @param {number} windowDays
 * @returns {{ startMs: number, endMs: number }}
 */
export function presenceSignalWindowBounds(reference, windowDays) {
  const days = Math.max(1, Math.floor(Number(windowDays) || 1));
  const end = new Date(reference);
  end.setHours(23, 59, 59, 999);
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return { startMs: start.getTime(), endMs: end.getTime() };
}

/**
 * @param {string} iso
 * @param {{ startMs: number, endMs: number }} bounds
 * @returns {boolean}
 */
export function isPresenceSignalInWindow(iso, bounds) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t >= bounds.startMs && t <= bounds.endMs;
}

/**
 * @param {unknown} tag
 * @returns {string | null}
 */
export function normalizePresenceEmotionTag(tag) {
  const id = typeof tag === 'string' ? tag.trim() : '';
  if (!id) return null;
  return PRESENCE_EMOTION_TAG_IDS.includes(id) ? id : null;
}

/**
 * @param {unknown} raw
 * @returns {PresenceSignalEntry[]}
 */
export function normalizePresenceSignalEntries(raw) {
  if (!Array.isArray(raw)) return [];
  /** @type {PresenceSignalEntry[]} */
  const out = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const o = /** @type {Record<string, unknown>} */ (row);
    const id = typeof o.id === 'string' && o.id ? o.id : null;
    const at = typeof o.at === 'string' && o.at ? o.at : null;
    const source = typeof o.source === 'string' ? o.source : '';
    if (!id || !at) continue;
    if (
      source !== 'arrival_notice' &&
      source !== 'reflection_q1' &&
      source !== 'reflection_q2' &&
      source !== 'reflection_q3' &&
      source !== 'ritual_chip'
    ) {
      continue;
    }
    /** @type {PresenceSignalEntry} */
    const entry = { id, at, source: /** @type {PresenceSignalSource} */ (source) };
    const tag = normalizePresenceEmotionTag(o.emotionTag);
    if (tag) entry.emotionTag = tag;
    if (typeof o.freeText === 'string' && o.freeText.trim()) {
      entry.freeText = o.freeText.trim().slice(0, 500);
    }
    if (typeof o.ritualId === 'string' && o.ritualId) entry.ritualId = o.ritualId;
    if (typeof o.field === 'string' && o.field) entry.field = o.field;
    if (!entry.emotionTag && !entry.freeText) continue;
    out.push(entry);
  }
  return out.slice(-PRESENCE_SIGNALS_MAX_ENTRIES);
}

/**
 * Drop freeText past retention; emotionTag rows stay.
 * @param {PresenceSignalEntry[]} entries
 * @param {Date} [reference]
 * @returns {PresenceSignalEntry[]}
 */
export function pruneExpiredPresenceFreeText(
  entries,
  reference = new Date()
) {
  const refKey = presenceSignalDateKey(reference.toISOString());
  const refParts = refKey.split('-').map(Number);
  const refDate = new Date(refParts[0], refParts[1] - 1, refParts[2]);
  const cutoff = new Date(refDate);
  cutoff.setDate(cutoff.getDate() - PRESENCE_SIGNALS_FREE_TEXT_RETENTION_DAYS);
  const cutoffMs = cutoff.getTime();
  return entries.map((row) => {
    if (!row.freeText) return row;
    const t = new Date(row.at).getTime();
    if (Number.isNaN(t) || t >= cutoffMs) return row;
    const { freeText: _drop, ...rest } = row;
    return rest;
  });
}

/**
 * @param {unknown} raw
 * @returns {PresenceSignalsState}
 */
export function normalizePresenceSignalsState(raw) {
  if (!raw || typeof raw !== 'object') return { entries: [] };
  const o = /** @type {Record<string, unknown>} */ (raw);
  const entries = pruneExpiredPresenceFreeText(
    normalizePresenceSignalEntries(o.entries)
  );
  return { entries };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {PresenceSignalsState}
 */
export function readPresenceSignals(storage) {
  if (!storage) return normalizePresenceSignalsState(null);
  try {
    const raw = storage.getItem(PRESENCE_SIGNALS_STORAGE_KEY);
    if (!raw) return normalizePresenceSignalsState(null);
    return normalizePresenceSignalsState(JSON.parse(raw));
  } catch {
    return normalizePresenceSignalsState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {PresenceSignalsState} state
 */
export function writePresenceSignals(storage, state) {
  if (!storage) return;
  try {
    const normalized = normalizePresenceSignalsState(state);
    storage.setItem(
      PRESENCE_SIGNALS_STORAGE_KEY,
      JSON.stringify(normalized)
    );
  } catch {
    // ignore quota / privacy mode
  }
}

/**
 * @param {() => string} [idFn]
 * @returns {string}
 */
function nextPresenceSignalId(idFn = () => crypto.randomUUID()) {
  try {
    return idFn();
  } catch {
    return `ps-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {Omit<PresenceSignalEntry, 'id' | 'at'> & { at?: string, id?: string }} partial
 * @param {{ now?: () => Date, idFn?: () => string }} [opts]
 * @returns {PresenceSignalEntry | null}
 */
export function appendPresenceSignal(storage, partial, opts = {}) {
  const now = opts.now ?? (() => new Date());
  const tag = normalizePresenceEmotionTag(partial.emotionTag);
  const freeText =
    typeof partial.freeText === 'string' ? partial.freeText.trim() : '';
  if (!tag && !freeText) return null;

  /** @type {PresenceSignalEntry} */
  const row = {
    id: partial.id || nextPresenceSignalId(opts.idFn),
    at: partial.at || now().toISOString(),
    source: partial.source
  };
  if (tag) row.emotionTag = tag;
  if (freeText) row.freeText = freeText.slice(0, 500);
  if (partial.ritualId) row.ritualId = partial.ritualId;
  if (partial.field) row.field = partial.field;

  const prev = readPresenceSignals(storage);
  const entries = normalizePresenceSignalEntries([...prev.entries, row]);
  writePresenceSignals(storage, { entries });
  return row;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} noticeId
 * @param {{ now?: () => Date, idFn?: () => string }} [opts]
 * @returns {PresenceSignalEntry | null}
 */
export function appendArrivalNoticeSignal(storage, noticeId, opts = {}) {
  const tag = normalizePresenceEmotionTag(noticeId);
  if (!tag) return null;
  return appendPresenceSignal(
    storage,
    { source: 'arrival_notice', emotionTag: tag },
    opts
  );
}

/**
 * @param {PresenceSignalEntry[]} entries
 * @param {{ windowDays?: number, reference?: Date }} [opts]
 * @returns {PresenceSignalEntry[]}
 */
export function filterPresenceSignalsInWindow(entries, opts = {}) {
  const reference = opts.reference ?? new Date();
  const windowDays =
    opts.windowDays ?? PRESENCE_SIGNALS_DEFAULT_WINDOW_DAYS;
  const bounds = presenceSignalWindowBounds(reference, windowDays);
  return (entries || []).filter((row) => isPresenceSignalInWindow(row.at, bounds));
}

/**
 * Count emotionTag rows in window (freeText-only rows excluded from tag tallies).
 * Trend sample size uses totalTagged only — never freeText-only rows.
 * @param {PresenceSignalEntry[]} entries
 * @returns {{ totalTagged: number, counts: Record<string, number> }}
 */
export function summarizePresenceEmotionTags(entries) {
  /** @type {Record<string, number>} */
  const counts = {};
  let totalTagged = 0;
  for (const row of entries || []) {
    if (!row.emotionTag) continue;
    totalTagged += 1;
    counts[row.emotionTag] = (counts[row.emotionTag] || 0) + 1;
  }
  return { totalTagged, counts };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ windowDays?: number, reference?: Date }} [opts]
 */
export function summarizePresenceSignalsForWindow(storage, opts = {}) {
  const state = readPresenceSignals(storage);
  const inWindow = filterPresenceSignalsInWindow(state.entries, opts);
  return {
    windowDays: opts.windowDays ?? PRESENCE_SIGNALS_DEFAULT_WINDOW_DAYS,
    ...summarizePresenceEmotionTags(inWindow)
  };
}
