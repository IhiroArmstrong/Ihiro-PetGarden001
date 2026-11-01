/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T73 first knife — single read door for duration highlight + local fact projection.
 * Wraps T58 tired math; does not rewrite 3/5/7 or one-tier-below.
 * Local only; excluded from T54 research payload.
 */

import { AWAKEN_CHECKIN_STORAGE_KEY, normalizeCheckInRows } from './awakenCheckInStore.js';
import {
  FOCUS_DURATION_DEFAULT_MINUTES,
  FOCUS_DURATION_OPTIONS_MINUTES,
  hasStoredFocusDurationPreference,
  loadPreferredFocusDurationMinutes,
  normalizeFocusDurationMinutes
} from './focusDuration.js';
import { getWorkEndPreference } from './workEndPreference.js';
import {
  isYinAdaptationEnabled,
  readManualFocusDurationAnchorMinutes,
  resolveAdaptedFocusDurationHighlightMinutes,
  shouldSuggestLowerFocusDuration
} from './yinAdaptationStore.js';

export const PREF_STATE_READ_STORAGE_KEY = 'focus-tiger.pref-state-read.v1';

export const PREF_HABITUAL_WINDOW_SIZE = 12;
export const PREF_HABITUAL_MIN_COUNT = 3;

const MAX_STORED_PICKS = PREF_HABITUAL_WINDOW_SIZE;

/**
 * @param {Storage | null | undefined} storage
 * @returns {Storage | null}
 */
function resolveStore(storage) {
  if (storage) return storage;
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} raw
 * @returns {{
 *   qualifyingManualPicks: Array<{ minutes: number, at: number }>,
 *   highlightAcceptedCount: number,
 *   highlightRewrittenCount: number
 * }}
 */
export function normalizePrefStateReadLedger(raw) {
  const picks = [];
  if (raw && typeof raw === 'object' && Array.isArray(raw.qualifyingManualPicks)) {
    for (const row of raw.qualifyingManualPicks) {
      if (!row || typeof row !== 'object') continue;
      const minutes = normalizeFocusDurationMinutes(row.minutes);
      const at = Number(row.at);
      if (!Number.isFinite(at)) continue;
      if (!FOCUS_DURATION_OPTIONS_MINUTES.includes(minutes)) continue;
      picks.push({ minutes, at });
    }
  }
  const accepted = Number(raw?.highlightAcceptedCount);
  const rewritten = Number(raw?.highlightRewrittenCount);
  return {
    qualifyingManualPicks: picks.slice(-MAX_STORED_PICKS),
    highlightAcceptedCount: Number.isFinite(accepted) && accepted > 0 ? accepted : 0,
    highlightRewrittenCount: Number.isFinite(rewritten) && rewritten > 0 ? rewritten : 0
  };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readPrefStateReadLedger(storage) {
  const store = resolveStore(storage);
  if (!store) return normalizePrefStateReadLedger(null);
  try {
    const raw = store.getItem(PREF_STATE_READ_STORAGE_KEY);
    if (!raw) return normalizePrefStateReadLedger(null);
    return normalizePrefStateReadLedger(JSON.parse(raw));
  } catch {
    return normalizePrefStateReadLedger(null);
  }
}

/**
 * @param {ReturnType<typeof normalizePrefStateReadLedger>} ledger
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
function writePrefStateReadLedger(ledger, storage) {
  const store = resolveStore(storage);
  if (!store) return false;
  try {
    store.setItem(
      PREF_STATE_READ_STORAGE_KEY,
      JSON.stringify(normalizePrefStateReadLedger(ledger))
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Strict unique winner in the last 12 qualifying picks.
 * Ties (including four tiers at 3) → no habitual; keep last highlight via fallback.
 * Clicking the current highlight does not append, so a prior winner does not age out.
 *
 * @param {Array<{ minutes: number, at: number }>} picks
 * @returns {number | null}
 */
export function resolveHabitualFocusMinutesFromPicks(picks) {
  const window = Array.isArray(picks) ? picks.slice(-PREF_HABITUAL_WINDOW_SIZE) : [];
  /** @type {Map<number, number>} */
  const counts = new Map();
  for (const row of window) {
    const minutes = normalizeFocusDurationMinutes(row?.minutes);
    counts.set(minutes, (counts.get(minutes) || 0) + 1);
  }
  let bestMinutes = null;
  let bestCount = 0;
  let tied = false;
  for (const minutes of FOCUS_DURATION_OPTIONS_MINUTES) {
    const count = counts.get(minutes) || 0;
    if (count > bestCount) {
      bestCount = count;
      bestMinutes = minutes;
      tied = false;
    } else if (count === bestCount && count > 0) {
      tied = true;
    }
  }
  if (tied || bestCount < PREF_HABITUAL_MIN_COUNT) return null;
  return bestMinutes;
}

/**
 * Recipe / template write-back: updates last stored minutes only. Not a qualifying pick.
 * @param {Storage | null | undefined} storage
 */
export function noteRecipeFocusDurationWrite(_minutes, storage) {
  void _minutes;
  void storage;
}

/**
 * Chip (or voice-from-picker) chose a product tier.
 * Accepting the current highlight records telemetry only — intentional, not a bug:
 * the old habitual must not expire when the person keeps tapping the highlighted chip.
 *
 * @param {object} opts
 * @param {number} opts.minutes
 * @param {Storage | null | undefined} [opts.storage]
 * @param {'chip' | 'voice-picker'} [opts.source]
 * @param {number} [opts.at]
 * @returns {{ acceptedHighlight: boolean, recordedQualifying: boolean }}
 */
export function noteFocusDurationChipChosen({
  minutes,
  storage,
  source = 'chip',
  at = Date.now()
}) {
  void source;
  const store = resolveStore(storage);
  const before = resolvePrefStateReadModel(store);
  const chosen = normalizeFocusDurationMinutes(minutes);
  const acceptedHighlight = chosen === before.highlightFocusMinutes;
  const ledger = readPrefStateReadLedger(store);
  if (acceptedHighlight) {
    ledger.highlightAcceptedCount += 1;
  } else {
    ledger.highlightRewrittenCount += 1;
    ledger.qualifyingManualPicks = [
      ...ledger.qualifyingManualPicks,
      { minutes: chosen, at: Number(at) || Date.now() }
    ].slice(-MAX_STORED_PICKS);
  }
  writePrefStateReadLedger(ledger, store);
  return {
    acceptedHighlight,
    recordedQualifying: !acceptedHighlight
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {'ease' | 'restless' | 'tired' | null}
 */
function latestEndCheckInLabel(storage) {
  const store = resolveStore(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(AWAKEN_CHECKIN_STORAGE_KEY);
    const rows = normalizeCheckInRows(raw ? JSON.parse(raw) : []);
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      if (rows[i].phase === 'end' && rows[i].label) return rows[i].label;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Single read door. Pure given the same Storage snapshot.
 *
 * @param {Storage | null | undefined} storage
 */
export function resolvePrefStateReadModel(storage) {
  const store = resolveStore(storage);
  const lastStoredFocusMinutes = loadPreferredFocusDurationMinutes(store);
  const lastManualAnchorMinutes = readManualFocusDurationAnchorMinutes(store);
  const ledger = readPrefStateReadLedger(store);
  const habitualFocusMinutes = resolveHabitualFocusMinutesFromPicks(
    ledger.qualifyingManualPicks
  );
  const adaptationEnabled = isYinAdaptationEnabled();
  const tiredSuggestsShorter = shouldSuggestLowerFocusDuration(store);
  /** @type {number} */
  let highlightFocusMinutes = FOCUS_DURATION_DEFAULT_MINUTES;
  if (tiredSuggestsShorter) {
    highlightFocusMinutes = resolveAdaptedFocusDurationHighlightMinutes(store);
  } else if (habitualFocusMinutes != null) {
    highlightFocusMinutes = habitualFocusMinutes;
  } else if (hasStoredFocusDurationPreference(store)) {
    highlightFocusMinutes = lastStoredFocusMinutes;
  } else {
    highlightFocusMinutes = FOCUS_DURATION_DEFAULT_MINUTES;
  }

  const workEnd = getWorkEndPreference({ storage: store ?? undefined });

  return {
    lastStoredFocusMinutes,
    lastManualAnchorMinutes,
    habitualFocusMinutes,
    tiredSuggestsShorter,
    highlightFocusMinutes,
    adaptationEnabled,
    latestEndCheckInLabel: latestEndCheckInLabel(store),
    workEndClock: workEnd
      ? { hour: workEnd.hour, minute: workEnd.minute }
      : null,
    hasStoredFocusDurationPreference: hasStoredFocusDurationPreference(store),
    highlightAcceptedCount: ledger.highlightAcceptedCount,
    highlightRewrittenCount: ledger.highlightRewrittenCount
  };
}

/**
 * Highlight minutes for chips / T67 offered default. Never read raw pref as highlight.
 *
 * @param {Storage | null | undefined} storage
 * @returns {number}
 */
export function resolveHighlightFocusMinutes(storage) {
  return resolvePrefStateReadModel(storage).highlightFocusMinutes;
}
