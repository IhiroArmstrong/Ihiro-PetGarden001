/**
 * Soft practice-day presence for streak-meter (7-dot ring) + weekly heatmap reads.
 * No fail state / no “broken streak” copy — fewer lit dots when quiet days pass.
 *
 * Persist shape (v1 key, migrated in place):
 * `{ days: [{ date: 'YYYY-MM-DD', totalMinutes: number | null }] }`
 * - `totalMinutes` number ≥ 0: known sum of timed + Honesty minutes that day
 * - `totalMinutes` null: practiced day from legacy string[] migration (duration unknown)
 * Legacy `{ days: string[] }` is normalized on read (null minutes) and rewritten.
 */

import { getLocalDateKey } from '../utils/localDate.js';

export const PRACTICE_DAYS_STORAGE_KEY = 'focus-tiger.practice-days.v1';
export const PRACTICE_STREAK_RING_TOTAL = 7;
/** Keep at most this many calendar-day entries (unchanged from prior store). */
export const PRACTICE_DAYS_MAX_ENTRIES = 90;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {string} dateKey YYYY-MM-DD local
 * @param {number} deltaDays
 */
export function shiftLocalDateKey(dateKey, deltaDays) {
  const parts = String(dateKey).split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return getLocalDateKey(new Date());
  }
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return getLocalDateKey(dt);
}

/**
 * Consecutive practiced days ending today (or yesterday if today quiet).
 * @param {Iterable<string>} dayKeys
 * @param {string} todayKey
 */
export function countRecentPracticeStreak(dayKeys, todayKey) {
  const set = new Set(dayKeys);
  let cursor = todayKey;
  if (!set.has(todayKey)) {
    cursor = shiftLocalDateKey(todayKey, -1);
  }
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftLocalDateKey(cursor, -1);
  }
  return streak;
}

/**
 * @typedef {{ date: string, totalMinutes: number | null }} PracticeDayEntry
 * @typedef {{ days: PracticeDayEntry[] }} PracticeDaysState
 */

/**
 * Normalize legacy `string[]` or mixed rows into `{ date, totalMinutes }[]`.
 * Legacy string dates → `totalMinutes: null` (unknown; do not crash).
 * Invalid rows skipped. Sorted by date ascending.
 *
 * @param {unknown} rawDays
 * @returns {{ days: PracticeDayEntry[], migratedFromLegacy: boolean }}
 */
export function migratePracticeDaysEntries(rawDays) {
  if (!Array.isArray(rawDays)) {
    return { days: [], migratedFromLegacy: false };
  }

  /** @type {Map<string, number | null>} */
  const byDate = new Map();
  let migratedFromLegacy = false;

  for (const row of rawDays) {
    if (typeof row === 'string' && DATE_KEY_RE.test(row)) {
      migratedFromLegacy = true;
      if (!byDate.has(row)) byDate.set(row, null);
      continue;
    }
    if (!row || typeof row !== 'object') continue;
    const date = /** @type {{ date?: unknown }} */ (row).date;
    if (typeof date !== 'string' || !DATE_KEY_RE.test(date)) continue;

    const rawMinutes = /** @type {{ totalMinutes?: unknown }} */ (row).totalMinutes;
    /** @type {number | null} */
    let totalMinutes = null;
    if (rawMinutes === null || rawMinutes === undefined) {
      totalMinutes = null;
    } else {
      const n = Number(rawMinutes);
      totalMinutes = Number.isFinite(n) && n >= 0 ? n : null;
    }

    if (!byDate.has(date)) {
      byDate.set(date, totalMinutes);
      continue;
    }
    const prev = byDate.get(date);
    if (prev == null && totalMinutes == null) continue;
    if (prev == null) {
      byDate.set(date, totalMinutes);
      continue;
    }
    if (totalMinutes == null) continue;
    byDate.set(date, prev + totalMinutes);
  }

  const days = [...byDate.entries()]
    .map(([date, totalMinutes]) => ({ date, totalMinutes }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { days, migratedFromLegacy };
}

export class PracticeDaysStore {
  /**
   * @param {object} [options]
   * @param {Storage | null} [options.storage]
   * @param {string} [options.storageKey]
   * @param {() => Date} [options.now]
   */
  constructor({
    storage = getDefaultStorage(),
    storageKey = PRACTICE_DAYS_STORAGE_KEY,
    now = () => new Date()
  } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.now = now;
    /** @type {PracticeDaysState} */
    this._memoryState = { days: [] };
  }

  /**
   * Mark today as practiced; add `durationMinutes` into that day's `totalMinutes`.
   * Same trigger path as before (timed complete / Honesty); minutes are optional for
   * presence-only callers (streak tests) → adds 0.
   * @param {number} [durationMinutes]
   */
  markToday(durationMinutes) {
    const today = getLocalDateKey(this.now());
    const add = Number(durationMinutes);
    const delta =
      Number.isFinite(add) && add > 0 ? add : 0;

    const days = this._read().days.map((d) => ({ ...d }));
    const idx = days.findIndex((d) => d.date === today);
    if (idx >= 0) {
      const prev = days[idx].totalMinutes;
      const base = prev == null ? 0 : prev;
      days[idx] = { date: today, totalMinutes: base + delta };
    } else {
      days.push({ date: today, totalMinutes: delta });
    }
    days.sort((a, b) => a.date.localeCompare(b.date));
    this._write({ days: days.slice(-PRACTICE_DAYS_MAX_ENTRIES) });
  }

  /** @returns {number} */
  getRecentStreakDays() {
    const keys = this._read().days.map((d) => d.date);
    return countRecentPracticeStreak(keys, getLocalDateKey(this.now()));
  }

  /** Lit dots for the soft 7-day ring (capped). */
  getRingFilled(total = PRACTICE_STREAK_RING_TOTAL) {
    const cap = Math.max(1, total);
    return Math.min(cap, this.getRecentStreakDays());
  }

  /**
   * Last `n` local calendar days inclusive of today (oldest → newest).
   * Days with no store entry are filled as `{ date, totalMinutes: 0 }`.
   * @param {number} n
   * @returns {PracticeDayEntry[]}
   */
  getLastNDays(n) {
    const count = Math.floor(Number(n));
    if (!Number.isFinite(count) || count <= 0) return [];

    const today = getLocalDateKey(this.now());
    /** @type {Map<string, number | null>} */
    const byDate = new Map(
      this._read().days.map((d) => [d.date, d.totalMinutes])
    );

    /** @type {PracticeDayEntry[]} */
    const out = [];
    for (let i = count - 1; i >= 0; i -= 1) {
      const date = shiftLocalDateKey(today, -i);
      if (byDate.has(date)) {
        out.push({ date, totalMinutes: byDate.get(date) ?? null });
      } else {
        out.push({ date, totalMinutes: 0 });
      }
    }
    return out;
  }

  _read() {
    if (!this.storage) return this._memoryState;

    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      if (parsed && Array.isArray(parsed.days)) {
        const { days, migratedFromLegacy } = migratePracticeDaysEntries(
          parsed.days
        );
        this._memoryState = { days };
        if (migratedFromLegacy || this._rawNeedsRewrite(parsed.days, days)) {
          this._write(this._memoryState);
        }
      }
    } catch {
      // keep memory
    }
    return this._memoryState;
  }

  /**
   * Rewrite when any legacy string row (or other non-canonical shape) was present.
   * @param {unknown[]} rawDays
   * @param {PracticeDayEntry[]} normalized
   */
  _rawNeedsRewrite(rawDays, normalized) {
    if (rawDays.some((row) => typeof row === 'string')) return true;
    if (rawDays.length !== normalized.length) return true;
    return rawDays.some((row) => {
      if (!row || typeof row !== 'object') return true;
      const r = /** @type {{ date?: unknown, totalMinutes?: unknown }} */ (row);
      return typeof r.date !== 'string' || !('totalMinutes' in r);
    });
  }

  /** @param {PracticeDaysState} state */
  _write(state) {
    this._memoryState = {
      days: state.days.map((d) => ({
        date: d.date,
        totalMinutes: d.totalMinutes
      }))
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      // ignore
    }
  }
}
