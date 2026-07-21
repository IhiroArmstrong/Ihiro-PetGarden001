/**
 * Soft practice-day presence for streak-meter (7-dot ring).
 * No fail state / no “broken streak” copy — fewer lit dots when quiet days pass.
 */

import { getLocalDateKey } from '../utils/localDate.js';

export const PRACTICE_DAYS_STORAGE_KEY = 'focus-tiger.practice-days.v1';
export const PRACTICE_STREAK_RING_TOTAL = 7;

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
 * @typedef {{ days: string[] }} PracticeDaysState
 */
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

  /** Mark the local calendar day as having shared sitting (timed or Honesty). */
  markToday() {
    const today = getLocalDateKey(this.now());
    const days = new Set(this._read().days);
    days.add(today);
    const sorted = [...days].sort();
    this._write({ days: sorted.slice(-90) });
  }

  /** @returns {number} */
  getRecentStreakDays() {
    return countRecentPracticeStreak(
      this._read().days,
      getLocalDateKey(this.now())
    );
  }

  /** Lit dots for the soft 7-day ring (capped). */
  getRingFilled(total = PRACTICE_STREAK_RING_TOTAL) {
    const cap = Math.max(1, total);
    return Math.min(cap, this.getRecentStreakDays());
  }

  _read() {
    if (!this.storage) return this._memoryState;
    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      if (parsed && Array.isArray(parsed.days)) {
        this._memoryState = {
          days: parsed.days.filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
        };
      }
    } catch {
      // keep memory
    }
    return this._memoryState;
  }

  /** @param {PracticeDaysState} state */
  _write(state) {
    this._memoryState = { days: [...state.days] };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      // ignore
    }
  }
}
