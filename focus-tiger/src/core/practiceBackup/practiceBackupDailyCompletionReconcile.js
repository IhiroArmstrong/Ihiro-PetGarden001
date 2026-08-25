/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Practice-backup v1 (6 keys) omits daily-completions. After restore, reminder /
 * hasCompletedToday can disagree with heatmap (practice-days). Derive a synthetic
 * today session when practice-days shows today practiced and daily-completions is empty.
 *
 * Honest limits: celebrated stamp, multi-session history, and real completedAt are
 * not recoverable from practice-days alone.
 */

import { getLocalDateKey } from '../../utils/localDate.js';
import { DailyCompletionStore } from '../DailyCompletionStore.js';
import {
  PRACTICE_DAYS_STORAGE_KEY,
  migratePracticeDaysEntries
} from '../PracticeDaysStore.js';

/**
 * @param {Storage | null | undefined} storage
 * @param {Date} [now]
 * @returns {{ reconciled: boolean, reason?: string, durationMinutes?: number }}
 */
export function reconcileDailyCompletionAfterRestore(storage, now = new Date()) {
  if (!storage) {
    return { reconciled: false, reason: 'no_storage' };
  }

  const dateKey = getLocalDateKey(now);
  /** @type {number | null | undefined} */
  let totalMinutes;

  try {
    const raw = JSON.parse(storage.getItem(PRACTICE_DAYS_STORAGE_KEY) ?? 'null');
    if (!raw || !Array.isArray(raw.days)) {
      return { reconciled: false, reason: 'no_practice_today' };
    }
    const { days } = migratePracticeDaysEntries(raw.days);
    const entry = days.find((d) => d.date === dateKey);
    if (!entry || entry.totalMinutes === 0) {
      return { reconciled: false, reason: 'no_practice_today' };
    }
    totalMinutes = entry.totalMinutes;
  } catch {
    return { reconciled: false, reason: 'practice_days_unreadable' };
  }

  const daily = new DailyCompletionStore({
    storage,
    now: () => now
  });
  if (daily.hasCompletedToday()) {
    return { reconciled: false, reason: 'already_completed' };
  }

  const durationMinutes = Math.max(1, totalMinutes ?? 1);
  daily.recordCompletion(durationMinutes);
  return { reconciled: true, durationMinutes };
}
