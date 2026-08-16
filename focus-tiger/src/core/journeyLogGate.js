/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Journey Log · local practice trail (Tea Log pattern).
 *
 * In-app only — NOT HealthKit / Health Connect.
 * ZERO COUPLING with tipJarGate / sanctuary / practiceBadgeAward
 * (do not import those modules). insightSpark is a local Quiet Line mark only.
 */

export const JOURNEY_LOG_STORAGE_KEY = 'focus-tiger.journey-log.v1';

/** Cap stored sittings (newest at the end). */
export const JOURNEY_LOG_MAX_ENTRIES = 30;

/**
 * @typedef {{
 *   at: string,
 *   minutes: number,
 *   arrive: boolean,
 *   reflect: boolean,
 *   insightSpark?: boolean
 * }} JourneyLogEntry
 *
 * @typedef {{ entries: JourneyLogEntry[] }} JourneyLogState
 */

/**
 * @param {unknown} raw
 * @returns {JourneyLogEntry[]}
 */
export function normalizeJourneyLogEntries(raw) {
  if (!Array.isArray(raw)) return [];
  /** @type {JourneyLogEntry[]} */
  const out = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const o = /** @type {Record<string, unknown>} */ (row);
    const at = typeof o.at === 'string' && o.at ? o.at : null;
    const minutes = Number(o.minutes);
    if (!at || !Number.isFinite(minutes) || minutes < 1) continue;
    /** @type {JourneyLogEntry} */
    const entry = {
      at,
      minutes: Math.min(90, Math.max(1, Math.floor(minutes))),
      arrive: Boolean(o.arrive),
      reflect: Boolean(o.reflect)
    };
    if (o.insightSpark === true) entry.insightSpark = true;
    out.push(entry);
  }
  return out.slice(-JOURNEY_LOG_MAX_ENTRIES);
}

/**
 * @param {unknown} raw
 * @returns {JourneyLogState}
 */
export function normalizeJourneyLogState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { entries: [] };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  return { entries: normalizeJourneyLogEntries(o.entries) };
}

/**
 * Local calendar date YYYY-MM-DD from an ISO timestamp.
 * @param {string} iso
 * @returns {string}
 */
export function journeyLogDateKey(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || '').slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Minutes for a Journey Log row after Focus ends.
 * Completed → target; early Rise → wall-clock minutes (min 1).
 *
 * @param {object} opts
 * @param {boolean} [opts.completed]
 * @param {number} [opts.targetMinutes]
 * @param {number} [opts.elapsedSeconds]
 * @returns {number}
 */
export function resolveJourneyMinutes({
  completed = false,
  targetMinutes = 1,
  elapsedSeconds = 0
} = {}) {
  if (completed) {
    const t = Math.round(Number(targetMinutes) || 0);
    return Math.max(1, Math.min(90, t));
  }
  const secs = Math.max(0, Number(elapsedSeconds) || 0);
  return Math.max(1, Math.min(90, Math.round(secs / 60)));
}

/**
 * Breath practice is a product-equivalent sitting: chip minutes, never Arrival.
 * Leave / Honesty / RitualFlow must not call this.
 *
 * @param {number} minutes selected chip minutes
 * @returns {{ minutes: number, arrive: false } | null}
 */
export function microRitualJourneyDraft(minutes) {
  const raw = Math.round(Number(minutes) || 0);
  if (!Number.isFinite(raw) || raw < 1) return null;
  return {
    minutes: resolveJourneyMinutes({
      completed: true,
      targetMinutes: raw,
      elapsedSeconds: 0
    }),
    arrive: false
  };
}

/**
 * Locale key suffix for observational line copy.
 * @param {Pick<JourneyLogEntry, 'arrive' | 'reflect'>} entry
 * @returns {'FULL' | 'ARRIVE' | 'REFLECT' | 'FOCUS'}
 */
export function journeyLogLineKind(entry) {
  const arrive = Boolean(entry?.arrive);
  const reflect = Boolean(entry?.reflect);
  if (arrive && reflect) return 'FULL';
  if (arrive) return 'ARRIVE';
  if (reflect) return 'REFLECT';
  return 'FOCUS';
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {JourneyLogState}
 */
export function readJourneyLog(storage) {
  if (!storage) return normalizeJourneyLogState(null);
  try {
    const raw = storage.getItem(JOURNEY_LOG_STORAGE_KEY);
    if (!raw) return normalizeJourneyLogState(null);
    return normalizeJourneyLogState(JSON.parse(raw));
  } catch {
    return normalizeJourneyLogState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {JourneyLogState} state
 */
export function writeJourneyLog(storage, state) {
  if (!storage) return;
  try {
    const normalized = normalizeJourneyLogState(state);
    storage.setItem(
      JOURNEY_LOG_STORAGE_KEY,
      JSON.stringify({ entries: normalized.entries })
    );
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Append one sitting after Reflection closes (incl. skip).
 *
 * @param {Storage | null | undefined} storage
 * @param {object} entry
 * @param {string} [entry.at]
 * @param {number} entry.minutes
 * @param {boolean} [entry.arrive]
 * @param {boolean} [entry.reflect]
 * @param {boolean} [entry.insightSpark]
 * @param {() => Date} [entry.now]
 * @returns {JourneyLogEntry | null}
 */
export function appendJourneyLogEntry(
  storage,
  {
    at,
    minutes,
    arrive = false,
    reflect = false,
    insightSpark = false,
    now = () => new Date()
  } = {}
) {
  const mins = Math.round(Number(minutes) || 0);
  if (!Number.isFinite(mins) || mins < 1) return null;
  const iso =
    typeof at === 'string' && at
      ? at
      : now().toISOString();
  /** @type {JourneyLogEntry} */
  const row = {
    at: iso,
    minutes: Math.min(90, Math.max(1, mins)),
    arrive: Boolean(arrive),
    reflect: Boolean(reflect)
  };
  if (insightSpark === true) row.insightSpark = true;
  const prev = readJourneyLog(storage);
  const entries = normalizeJourneyLogEntries([...prev.entries, row]);
  writeJourneyLog(storage, { entries });
  return row;
}

/**
 * Mark today’s existing sittings after Quiet Line insight content was opened.
 * Missing / false fields stay omitted (degrade to unmarked).
 *
 * @param {Storage | null | undefined} storage
 * @param {string} dateKey YYYY-MM-DD
 * @returns {boolean} whether any row changed
 */
export function stampJourneyLogInsightSparkForDate(storage, dateKey) {
  const want = String(dateKey || '');
  if (!want) return false;
  const prev = readJourneyLog(storage);
  let changed = false;
  const entries = prev.entries.map((row) => {
    if (journeyLogDateKey(row.at) !== want) return row;
    if (row.insightSpark === true) return row;
    changed = true;
    return { ...row, insightSpark: true };
  });
  if (changed) writeJourneyLog(storage, { entries });
  return changed;
}
