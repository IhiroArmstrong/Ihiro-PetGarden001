/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Build H.3 V1 five-key signals from local stores only (no raw text).
 * @see docs/YIN_PERSONALIZATION_ENGINE.md §H.3
 */

import { normalizeJourneyLogState } from './journeyLogGate.js';
import { migratePracticeDaysEntries } from './PracticeDaysStore.js';
import {
  normalizeYpeCompanionStyle,
  readYpeCompanionStyle
} from './yinPersonalizationEngine.js';

export const YPE_SIGNAL_WINDOW_DAYS = 30;
export const YPE_MIN_COMPLETIONS_FOR_PACK = 10;

/**
 * @param {'quiet' | 'default' | 'warm'} style
 * @returns {'low' | 'medium'}
 */
export function deriveInterventionPreference(style) {
  return normalizeYpeCompanionStyle(style) === 'quiet' ? 'low' : 'medium';
}

/**
 * @param {string} dateKey YYYY-MM-DD
 * @param {number} deltaDays
 */
function shiftDateKey(dateKey, deltaDays) {
  const parts = String(dateKey).split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return dateKey;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * @param {string} todayKey
 * @param {number} windowDays
 */
export function windowStartDateKey(todayKey, windowDays = YPE_SIGNAL_WINDOW_DAYS) {
  return shiftDateKey(todayKey, -(windowDays - 1));
}

/**
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 * @returns {{
 *   signals: {
 *     focus_return_rate: number,
 *     reflection_frequency: number,
 *     companion_style_preference: 'quiet' | 'default' | 'warm',
 *     intervention_preference: 'low' | 'medium',
 *     practice_day_count_window: number
 *   },
 *   windowCompletionCount: number,
 *   fingerprint: string
 * }}
 */
export function buildYpePersonalizationSignals(
  storage,
  now = () => new Date()
) {
  const companionStyle = readYpeCompanionStyle(storage);
  const today = now();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const windowStart = windowStartDateKey(todayKey);

  let journeyRaw = null;
  let practiceRaw = null;
  try {
    journeyRaw = storage?.getItem('focus-tiger.journey-log.v1') ?? null;
    practiceRaw = storage?.getItem('focus-tiger.practice-days.v1') ?? null;
  } catch {
    /* ignore */
  }

  const journey = normalizeJourneyLogState(
    journeyRaw ? JSON.parse(journeyRaw) : null
  );
  let practiceDays = [];
  try {
    const parsed = practiceRaw ? JSON.parse(practiceRaw) : null;
    const rawDays =
      parsed && typeof parsed === 'object' && Array.isArray(parsed.days)
        ? parsed.days
        : [];
    practiceDays = migratePracticeDaysEntries(rawDays).days;
  } catch {
    practiceDays = [];
  }

  const entriesInWindow = journey.entries.filter((row) => {
    const dk = String(row.at || '').slice(0, 10);
    return dk >= windowStart && dk <= todayKey;
  });
  const windowCompletionCount = entriesInWindow.length;
  const reflectedN = entriesInWindow.filter((row) => row.reflect === true).length;
  const reflection_frequency =
    windowCompletionCount > 0 ? reflectedN / windowCompletionCount : 0;
  const focus_return_rate = windowCompletionCount > 0 ? 1 : 0;

  const practiceDaysInWindow = practiceDays.filter(
    (row) => row.date >= windowStart && row.date <= todayKey
  ).length;

  const signals = {
    focus_return_rate: Math.min(1, Math.max(0, focus_return_rate)),
    reflection_frequency: Math.min(1, Math.max(0, reflection_frequency)),
    companion_style_preference: companionStyle,
    intervention_preference: deriveInterventionPreference(companionStyle),
    practice_day_count_window: practiceDaysInWindow
  };

  const fingerprint = JSON.stringify({
    signals,
    windowCompletionCount
  });

  return { signals, windowCompletionCount, fingerprint };
}
