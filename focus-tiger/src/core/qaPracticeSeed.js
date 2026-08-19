/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * QA-only boot seed for long-horizon practice (MilestoneGlow / badges /
 * mustard-seed). Not a product feature — testers should not wait 7–21 real days.
 *
 * Canonical:
 *   ?product=1&sessionMinutes=1&qaSeedStreak=6
 * Seeds 6 prior calendar days (today empty). Completing one timed session today
 * projects streak-7 and can claim MilestoneGlow. Seeding also clears
 * milestone-glow claims unless ?qaKeepMilestones=1.
 */

import { getLocalDateKey } from '../utils/localDate.js';
import {
  PRACTICE_DAYS_MAX_ENTRIES,
  PRACTICE_DAYS_STORAGE_KEY,
  shiftLocalDateKey
} from './PracticeDaysStore.js';
import { MILESTONE_GLOW_STORAGE_KEY } from './MilestoneGlowStore.js';
import { FOCUS_SESSION_DEFAULT_MINUTES } from '../utils/Constants.js';

export const QA_SEED_STREAK_MAX = PRACTICE_DAYS_MAX_ENTRIES;
export const QA_SEED_MINUTES_MIN = 1;
export const QA_SEED_MINUTES_MAX = 180;

/**
 * @param {string} [search]
 * @returns {URLSearchParams}
 */
function paramsFromSearch(search = '') {
  const q = String(search || '');
  return new URLSearchParams(q.startsWith('?') ? q.slice(1) : q);
}

/**
 * @param {string} [search]
 * @returns {number | null} prior practiced days to write (excludes today)
 */
export function parseQaSeedStreak(search = '') {
  const raw = paramsFromSearch(search).get('qaSeedStreak');
  if (raw == null || raw === '') return null;
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(QA_SEED_STREAK_MAX, n);
}

/**
 * @param {string} [search]
 * @returns {number}
 */
export function parseQaSeedMinutesPerDay(search = '') {
  const raw = paramsFromSearch(search).get('qaSeedMinutes');
  if (raw == null || raw === '') return FOCUS_SESSION_DEFAULT_MINUTES;
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return FOCUS_SESSION_DEFAULT_MINUTES;
  return Math.min(QA_SEED_MINUTES_MAX, Math.max(QA_SEED_MINUTES_MIN, n));
}

/**
 * @param {string} [search]
 * @param {number | null} seededStreak
 * @returns {boolean}
 */
export function shouldQaResetMilestones(search = '', seededStreak = null) {
  const params = paramsFromSearch(search);
  if (params.get('qaKeepMilestones') === '1') return false;
  if (params.get('qaResetMilestones') === '1') return true;
  return seededStreak != null;
}

/**
 * Consecutive practiced days ending yesterday (today stays empty until a real sit).
 * @param {string} todayKey
 * @param {number} priorCount
 * @param {number} [minutesPerDay]
 * @returns {{ date: string, totalMinutes: number }[]}
 */
export function buildPriorPracticeDayEntries(
  todayKey,
  priorCount,
  minutesPerDay = FOCUS_SESSION_DEFAULT_MINUTES
) {
  const count = Math.floor(Number(priorCount));
  if (!Number.isFinite(count) || count < 1) return [];
  const minutes = Number(minutesPerDay);
  const totalMinutes =
    Number.isFinite(minutes) && minutes > 0
      ? minutes
      : FOCUS_SESSION_DEFAULT_MINUTES;
  /** @type {{ date: string, totalMinutes: number }[]} */
  const days = [];
  for (let i = count; i >= 1; i -= 1) {
    days.push({
      date: shiftLocalDateKey(todayKey, -i),
      totalMinutes
    });
  }
  return days;
}

/**
 * @param {{
 *   search?: string,
 *   storage?: Storage | null,
 *   todayKey?: string,
 *   now?: () => Date
 * }} [opts]
 * @returns {{
 *   seededPriorDays: number | null,
 *   minutesPerDay: number,
 *   resetMilestones: boolean,
 *   applied: boolean
 * }}
 */
export function applyQaPracticeSeedFromSearch(opts = {}) {
  const search = opts.search ?? '';
  const storage = opts.storage ?? null;
  const seededPriorDays = parseQaSeedStreak(search);
  const minutesPerDay = parseQaSeedMinutesPerDay(search);
  const resetMilestones = shouldQaResetMilestones(search, seededPriorDays);

  if (!storage) {
    return {
      seededPriorDays,
      minutesPerDay,
      resetMilestones,
      applied: false
    };
  }

  let wrote = false;
  if (seededPriorDays != null) {
    const today =
      opts.todayKey ?? getLocalDateKey(opts.now ? opts.now() : new Date());
    storage.setItem(
      PRACTICE_DAYS_STORAGE_KEY,
      JSON.stringify({
        days: buildPriorPracticeDayEntries(
          today,
          seededPriorDays,
          minutesPerDay
        )
      })
    );
    wrote = true;
  }
  if (resetMilestones) {
    storage.removeItem(MILESTONE_GLOW_STORAGE_KEY);
    wrote = true;
  }

  return {
    seededPriorDays,
    minutesPerDay,
    resetMilestones,
    applied: wrote
  };
}
