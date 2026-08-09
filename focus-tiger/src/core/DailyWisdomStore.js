/**
 * Daily wisdom rotation memory — same day locks one id; recentIds avoids near-term repeats.
 * Lightweight localStorage (MilestoneGlow-style I/O only; schema is day-rotation, not once-forever).
 */

export const DAILY_WISDOM_STORAGE_KEY = 'focus-tiger.daily-wisdom.v1';

/** Sliding window of recently shown quote ids (capped further by pool size − 1). */
export const DAILY_WISDOM_RECENT_WINDOW = 7;

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {number} poolSize
 * @param {number} [preferred]
 * @returns {number}
 */
export function dailyWisdomRecentWindow(poolSize, preferred = DAILY_WISDOM_RECENT_WINDOW) {
  const size = Math.floor(Number(poolSize));
  if (!Number.isFinite(size) || size <= 1) return 0;
  const want = Math.floor(Number(preferred));
  const cap = Math.max(0, size - 1);
  if (!Number.isFinite(want) || want <= 0) return cap;
  return Math.min(want, cap);
}

/**
 * Stable non-crypto hash for YYYY-MM-DD → deterministic index.
 * @param {string} dateKey
 * @returns {number}
 */
export function hashDateKey(dateKey) {
  const s = String(dateKey || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * @param {string} dateKey
 * @param {readonly string[]} candidateIds
 * @returns {string | null}
 */
export function selectWisdomId(dateKey, candidateIds) {
  const list = (candidateIds || []).filter((id) => typeof id === 'string' && id);
  if (!list.length) return null;
  return list[hashDateKey(dateKey) % list.length];
}

/**
 * @param {string} dateKey
 * @param {readonly string[]} poolIds
 * @param {readonly string[]} recentIds
 * @param {number} [windowSize]
 * @returns {string | null}
 */
export function pickDailyWisdomId(
  dateKey,
  poolIds,
  recentIds = [],
  windowSize = DAILY_WISDOM_RECENT_WINDOW
) {
  const ids = (poolIds || []).filter((id) => typeof id === 'string' && id);
  if (!ids.length) return null;
  const win = dailyWisdomRecentWindow(ids.length, windowSize);
  const recent = (recentIds || [])
    .filter((id) => typeof id === 'string' && id)
    .slice(-win);
  const banned = new Set(recent);
  let candidates = ids.filter((id) => !banned.has(id));
  if (!candidates.length) candidates = ids.slice();
  return selectWisdomId(dateKey, candidates);
}

export class DailyWisdomStore {
  /**
   * @param {{ storage?: Storage | null, storageKey?: string }} [opts]
   */
  constructor(opts = {}) {
    this.storage =
      opts.storage === undefined ? getDefaultStorage() : opts.storage;
    this.storageKey = opts.storageKey ?? DAILY_WISDOM_STORAGE_KEY;
    /** @type {{ dateKey: string, quoteId: string, recentIds: string[] }} */
    this._memoryState = { dateKey: '', quoteId: '', recentIds: [] };
  }

  /**
   * @returns {{ dateKey: string, quoteId: string, recentIds: string[] }}
   */
  getState() {
    const s = this._read();
    return {
      dateKey: s.dateKey,
      quoteId: s.quoteId,
      recentIds: s.recentIds.slice()
    };
  }

  /**
   * Same calendar day → same id; new day → pick excluding recent window, then persist.
   * @param {string} dateKey YYYY-MM-DD
   * @param {readonly { id: string }[]} pool
   * @returns {string | null}
   */
  resolveQuoteId(dateKey, pool) {
    const day = String(dateKey || '');
    const entries = Array.isArray(pool) ? pool : [];
    const poolIds = entries
      .map((e) => (e && typeof e.id === 'string' ? e.id : ''))
      .filter(Boolean);
    if (!day || !poolIds.length) return null;

    const state = this._read();
    if (state.dateKey === day && poolIds.includes(state.quoteId)) {
      return state.quoteId;
    }

    const win = dailyWisdomRecentWindow(poolIds.length);
    const recent = state.recentIds.filter((id) => poolIds.includes(id));
    const quoteId = pickDailyWisdomId(day, poolIds, recent, win);
    if (!quoteId) return null;

    const nextRecent = [...recent.filter((id) => id !== quoteId), quoteId].slice(
      -win
    );
    this._write({ dateKey: day, quoteId, recentIds: nextRecent });
    return quoteId;
  }

  _read() {
    if (!this.storage) return this._memoryState;
    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      if (parsed && typeof parsed === 'object') {
        const dateKey =
          typeof parsed.dateKey === 'string' ? parsed.dateKey : '';
        const quoteId =
          typeof parsed.quoteId === 'string' ? parsed.quoteId : '';
        const recentIds = Array.isArray(parsed.recentIds)
          ? parsed.recentIds.filter((x) => typeof x === 'string' && x)
          : [];
        this._memoryState = { dateKey, quoteId, recentIds };
        return this._memoryState;
      }
    } catch {
      /* ignore */
    }
    return this._memoryState;
  }

  /** @param {{ dateKey: string, quoteId: string, recentIds: string[] }} state */
  _write(state) {
    this._memoryState = {
      dateKey: state.dateKey,
      quoteId: state.quoteId,
      recentIds: state.recentIds.slice()
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      /* ignore */
    }
  }
}
