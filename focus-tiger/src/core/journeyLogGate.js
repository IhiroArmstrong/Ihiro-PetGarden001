/**
 * Journey Log · local practice trail (Tea Log pattern).
 *
 * In-app only — NOT HealthKit / Health Connect.
 * ZERO COUPLING with tipJarGate (do not import tip state).
 */

export const JOURNEY_LOG_STORAGE_KEY = 'focus-tiger.journey-log.v1';

/** Cap stored sittings (newest at the end). */
export const JOURNEY_LOG_MAX_ENTRIES = 30;

/**
 * @typedef {{
 *   at: string,
 *   minutes: number,
 *   arrive: boolean,
 *   reflect: boolean
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
    out.push({
      at,
      minutes: Math.min(90, Math.max(1, Math.floor(minutes))),
      arrive: Boolean(o.arrive),
      reflect: Boolean(o.reflect)
    });
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
 * @param {() => Date} [entry.now]
 * @returns {JourneyLogEntry | null}
 */
export function appendJourneyLogEntry(
  storage,
  { at, minutes, arrive = false, reflect = false, now = () => new Date() } = {}
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
  const prev = readJourneyLog(storage);
  const entries = normalizeJourneyLogEntries([...prev.entries, row]);
  writeJourneyLog(storage, { entries });
  return row;
}
