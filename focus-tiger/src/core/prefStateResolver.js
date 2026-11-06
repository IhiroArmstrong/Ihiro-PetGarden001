/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T73 read door — duration highlight + local fact projection.
 * First knife: habitual window. Second knife: say-what-is-seen + yes/no.
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
import { resolveStableFocusFixedMinutes } from './stablePrefsStore.js';

export const PREF_STATE_READ_STORAGE_KEY = 'focus-tiger.pref-state-read.v1';

export const PREF_HABITUAL_WINDOW_SIZE = 12;
export const PREF_HABITUAL_MIN_COUNT = 3;

/**
 * @param {unknown} raw
 * @returns {{ minutes: number, choice: 'accepted' | 'rejected', at: number } | null}
 */
export function normalizeHabitualHighlightConsent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const minutes = normalizeFocusDurationMinutes(raw.minutes);
  const choice = raw.choice === 'accepted' || raw.choice === 'rejected' ? raw.choice : null;
  const at = Number(raw.at);
  if (!choice || !Number.isFinite(at)) return null;
  if (!FOCUS_DURATION_OPTIONS_MINUTES.includes(minutes)) return null;
  return { minutes, choice, at };
}

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
 *   highlightRewrittenCount: number,
 *   habitualHighlightConsent: { minutes: number, choice: 'accepted' | 'rejected', at: number } | null,
 *   habitualProposalAcceptedCount: number,
 *   habitualProposalRejectedCount: number
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
  const proposalAccepted = Number(raw?.habitualProposalAcceptedCount);
  const proposalRejected = Number(raw?.habitualProposalRejectedCount);
  return {
    qualifyingManualPicks: picks.slice(-MAX_STORED_PICKS),
    highlightAcceptedCount: Number.isFinite(accepted) && accepted > 0 ? accepted : 0,
    highlightRewrittenCount: Number.isFinite(rewritten) && rewritten > 0 ? rewritten : 0,
    habitualHighlightConsent: normalizeHabitualHighlightConsent(raw?.habitualHighlightConsent),
    habitualProposalAcceptedCount:
      Number.isFinite(proposalAccepted) && proposalAccepted > 0 ? proposalAccepted : 0,
    habitualProposalRejectedCount:
      Number.isFinite(proposalRejected) && proposalRejected > 0 ? proposalRejected : 0
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
 * After "no", skip habitual highlight until post-reject picks re-form a habitual
 * (then ask again, still skip until the new answer).
 *
 * @param {{ qualifyingManualPicks: Array<{ minutes: number, at: number }>, habitualHighlightConsent: { minutes: number, choice: 'accepted' | 'rejected', at: number } | null }} ledger
 * @param {number | null} habitualFocusMinutes
 */
export function describeHabitualHighlightConsent(ledger, habitualFocusMinutes) {
  const consent = ledger?.habitualHighlightConsent ?? null;
  if (habitualFocusMinutes == null) {
    return {
      habitualHighlightConsent: null,
      needsHabitualConfirm: false,
      skipHabitualHighlight: false
    };
  }
  if (!consent || consent.minutes !== habitualFocusMinutes) {
    return {
      habitualHighlightConsent: null,
      needsHabitualConfirm: true,
      skipHabitualHighlight: false
    };
  }
  if (consent.choice === 'accepted') {
    return {
      habitualHighlightConsent: consent,
      needsHabitualConfirm: false,
      skipHabitualHighlight: false
    };
  }
  const picksAfter = (ledger.qualifyingManualPicks || []).filter(
    (row) => Number(row.at) > consent.at
  );
  const reestablished = resolveHabitualFocusMinutesFromPicks(picksAfter);
  if (reestablished === habitualFocusMinutes) {
    return {
      habitualHighlightConsent: null,
      needsHabitualConfirm: true,
      skipHabitualHighlight: true
    };
  }
  return {
    habitualHighlightConsent: consent,
    needsHabitualConfirm: false,
    skipHabitualHighlight: true
  };
}

/**
 * @param {'accepted' | 'rejected'} choice
 * @param {Storage | null | undefined} [storage]
 * @param {number} [at]
 * @returns {boolean}
 */
export function setHabitualHighlightConsent(choice, storage, at = Date.now()) {
  if (choice !== 'accepted' && choice !== 'rejected') return false;
  const store = resolveStore(storage);
  const model = resolvePrefStateReadModel(store);
  if (model.habitualFocusMinutes == null) return false;
  const ledger = readPrefStateReadLedger(store);
  ledger.habitualHighlightConsent = {
    minutes: model.habitualFocusMinutes,
    choice,
    at: Number(at) || Date.now()
  };
  if (choice === 'accepted') ledger.habitualProposalAcceptedCount += 1;
  else ledger.habitualProposalRejectedCount += 1;
  return writePrefStateReadLedger(ledger, store);
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
  const consentView = describeHabitualHighlightConsent(ledger, habitualFocusMinutes);
  const adaptationEnabled = isYinAdaptationEnabled();
  const tiredSuggestsShorter = shouldSuggestLowerFocusDuration(store);
  const stableFixed = resolveStableFocusFixedMinutes(store);
  /** @type {number} */
  let highlightFocusMinutes = FOCUS_DURATION_DEFAULT_MINUTES;
  if (tiredSuggestsShorter) {
    highlightFocusMinutes = resolveAdaptedFocusDurationHighlightMinutes(store);
  } else if (stableFixed != null) {
    highlightFocusMinutes = stableFixed;
  } else if (habitualFocusMinutes != null && !consentView.skipHabitualHighlight) {
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
    highlightRewrittenCount: ledger.highlightRewrittenCount,
    habitualHighlightConsent: consentView.habitualHighlightConsent,
    needsHabitualConfirm: consentView.needsHabitualConfirm,
    skipHabitualHighlight: consentView.skipHabitualHighlight,
    habitualProposalAcceptedCount: ledger.habitualProposalAcceptedCount,
    habitualProposalRejectedCount: ledger.habitualProposalRejectedCount
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
