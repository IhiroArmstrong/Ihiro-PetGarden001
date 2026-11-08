/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T78 — Breath minutes + Companion mode stable dimensions (PR-3).
 */

import {
  COMPANION_MODE_ACROSS_TOOLS,
  COMPANION_MODE_STEP_AWAY,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STORAGE_KEY,
  isValidCompanionMode
} from './FocusSession.js';
import {
  MICRO_RITUAL_DURATION_MINUTES,
  MICRO_RITUAL_DURATION_OPTIONS_MINUTES,
  normalizeMicroRitualMinutes
} from './MicroRitual.js';
import {
  FOCUS_STABLE_DECAY_MS,
  FOCUS_STABLE_PROMOTE_MIN,
  FOCUS_STABLE_SUPPRESS_MS,
  FOCUS_STABLE_WINDOW,
  readStablePrefsState,
  writeStablePrefsState
} from './stablePrefsStore.js';

const YIN_ADAPTATION_STORAGE_KEY = 'focus-tiger.yin-adaptation.v1';

export const STABLE_BREATH_NOTEBOOK_LINE_ID = 'stable-breath-minutes-fact';
export const STABLE_COMPANION_NOTEBOOK_LINE_ID = 'stable-companion-mode-fact';

/**
 * @typedef {{ minutes: number, lastUsedAt?: number }} StableBreathDimState
 * @typedef {{ minutes: number, at: number }} StableBreathVote
 * @typedef {{ mode: string, lastUsedAt?: number }} StableCompanionDimState
 * @typedef {{ mode: string, at: number }} StableCompanionVote
 */

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

function readYinAdaptationEnabled(storage) {
  const store = resolveStore(storage);
  if (!store) return true;
  try {
    const raw = store.getItem(YIN_ADAPTATION_STORAGE_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.enabled === false) return false;
  } catch {
    /* ignore */
  }
  return true;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {import('./FocusSession.js').CompanionMode}
 */
export function readStoredCompanionModePreference(storage) {
  const store = resolveStore(storage);
  if (!store) return COMPANION_MODE_STAY;
  try {
    const raw = store.getItem(COMPANION_MODE_STORAGE_KEY);
    if (!raw) return COMPANION_MODE_STAY;
    const parsed = JSON.parse(raw);
    const mode =
      parsed && typeof parsed === 'object' && typeof parsed.mode === 'string'
        ? parsed.mode
        : raw;
    return isValidCompanionMode(mode) ? mode : COMPANION_MODE_STAY;
  } catch {
    return COMPANION_MODE_STAY;
  }
}

/** @param {string} mode */
export function companionModeLocaleKey(mode) {
  if (mode === COMPANION_MODE_STEP_AWAY) return 'COMPANION_MODE_STEP_AWAY';
  if (mode === COMPANION_MODE_ACROSS_TOOLS) return 'COMPANION_MODE_ACROSS_TOOLS';
  return 'COMPANION_MODE_STAY';
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 * @returns {number | null}
 */
export function resolveStableBreathMinutes(storage, now = Date.now()) {
  if (!readYinAdaptationEnabled(storage)) return null;
  const ts = Number(now) || Date.now();
  const state = readStablePrefsState(storage);
  if ((Number(state.breathSuppressUntil) || 0) > ts) return null;
  const dim = readStableBreathMinutesDim(storage, ts);
  return dim?.minutes ?? null;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 * @returns {StableBreathDimState | null}
 */
export function readStableBreathMinutesDim(storage, now = Date.now()) {
  const ts = Number(now) || Date.now();
  const state = readStablePrefsState(storage);
  const dim = state.breathMinutes;
  if (!dim) return null;
  const last = Number(dim.lastUsedAt) || 0;
  if (last > 0 && ts - last > FOCUS_STABLE_DECAY_MS) {
    const cleared = readStablePrefsState(storage);
    cleared.breathMinutes = undefined;
    writeStablePrefsState(cleared, storage);
    return null;
  }
  return dim;
}

/**
 * Chip highlight for Breath practice (stable, else product default 1).
 * @param {Storage | null | undefined} storage
 */
export function resolveHighlightBreathMinutes(storage) {
  const stable = resolveStableBreathMinutes(storage);
  if (stable != null) return stable;
  return MICRO_RITUAL_DURATION_MINUTES;
}

/**
 * @param {object} opts
 * @param {number} opts.minutes
 * @param {Storage | null | undefined} [opts.storage]
 */
export function noteBreathMinutesChipChosen({ minutes, storage }) {
  const chosen = normalizeMicroRitualMinutes(minutes);
  const highlight = resolveHighlightBreathMinutes(storage);
  return {
    acceptedHighlight: chosen === highlight,
    recordedQualifying: chosen !== highlight
  };
}

/**
 * @param {boolean} recordedQualifying
 * @param {Storage | null | undefined} storage
 */
export function setBreathStableAwaitingVoteFromChip(recordedQualifying, storage) {
  const store = resolveStore(storage);
  const state = readStablePrefsState(store);
  state.breathAwaitingVote = recordedQualifying === true;
  writeStablePrefsState(state, store);
}

export function clearBreathStableAwaitingVote(storage) {
  const store = resolveStore(storage);
  const state = readStablePrefsState(store);
  state.breathAwaitingVote = false;
  writeStablePrefsState(state, store);
}

/**
 * @param {object} opts
 * @param {number} opts.minutes
 * @param {Storage | null | undefined} [opts.storage]
 * @param {number} [opts.at]
 */
export function onBreathSessionBeginStablePrefs({ minutes, storage, at = Date.now() }) {
  const store = resolveStore(storage);
  const now = Number(at) || Date.now();
  const normalized = normalizeMicroRitualMinutes(minutes);
  const state = readStablePrefsState(store);
  const awaiting = state.breathAwaitingVote === true;
  state.breathAwaitingVote = false;

  let dim = state.breathMinutes;
  if (dim?.lastUsedAt && now - dim.lastUsedAt > FOCUS_STABLE_DECAY_MS) {
    state.breathMinutes = undefined;
    dim = undefined;
  }

  if (!awaiting) {
    if (dim) {
      state.breathMinutes = { ...dim, lastUsedAt: now };
      writeStablePrefsState(state, store);
    }
    return { countedVote: false, promoted: false };
  }

  /** @type {StableBreathVote} */
  const voteRow = { minutes: normalized, at: now };
  const windowRows = [...(state.breathVoteWindow || []), voteRow].slice(
    -FOCUS_STABLE_WINDOW
  );
  state.breathVoteWindow = windowRows;

  let promoted = false;
  const suppressUntil = Number(state.breathSuppressUntil) || 0;
  if (now >= suppressUntil) {
    /** @type {Map<number, number>} */
    const counts = new Map();
    for (const row of windowRows) {
      const m = normalizeMicroRitualMinutes(row.minutes);
      counts.set(m, (counts.get(m) || 0) + 1);
    }
    let bestMinutes = null;
    let bestCount = 0;
    let tied = false;
    for (const m of MICRO_RITUAL_DURATION_OPTIONS_MINUTES) {
      const c = counts.get(m) || 0;
      if (c > bestCount) {
        bestCount = c;
        bestMinutes = m;
        tied = false;
      } else if (c === bestCount && c > 0) {
        tied = true;
      }
    }
    if (!tied && bestMinutes != null && bestCount >= FOCUS_STABLE_PROMOTE_MIN) {
      state.breathMinutes = { minutes: bestMinutes, lastUsedAt: now };
      promoted = true;
    }
  }

  if (!promoted && dim) {
    state.breathMinutes = { ...dim, lastUsedAt: now };
  }

  writeStablePrefsState(state, store);
  return { countedVote: true, promoted };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 */
export function resolveStableBreathL2Fact(storage, now = Date.now()) {
  const m = resolveStableBreathMinutes(storage, now);
  if (m == null) return null;
  return { minutes: m };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [at]
 */
export function rejectStableBreathNotQuite(storage, at = Date.now()) {
  const store = resolveStore(storage);
  const ts = Number(at) || Date.now();
  const state = readStablePrefsState(store);
  state.breathMinutes = undefined;
  state.breathVoteWindow = [];
  state.breathAwaitingVote = false;
  state.breathSuppressUntil = ts + FOCUS_STABLE_SUPPRESS_MS;
  writeStablePrefsState(state, store);
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 * @returns {string | null}
 */
export function resolveStableCompanionMode(storage, now = Date.now()) {
  if (!readYinAdaptationEnabled(storage)) return null;
  const ts = Number(now) || Date.now();
  const state = readStablePrefsState(storage);
  if ((Number(state.companionSuppressUntil) || 0) > ts) return null;
  const dim = readStableCompanionModeDim(storage, ts);
  return dim?.mode ?? null;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 * @returns {StableCompanionDimState | null}
 */
export function readStableCompanionModeDim(storage, now = Date.now()) {
  const ts = Number(now) || Date.now();
  const state = readStablePrefsState(storage);
  const dim = state.companionMode;
  if (!dim || !isValidCompanionMode(dim.mode)) return null;
  const last = Number(dim.lastUsedAt) || 0;
  if (last > 0 && ts - last > FOCUS_STABLE_DECAY_MS) {
    const cleared = readStablePrefsState(storage);
    cleared.companionMode = undefined;
    writeStablePrefsState(cleared, storage);
    return null;
  }
  return dim;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {import('./FocusSession.js').CompanionMode}
 */
export function resolveHighlightCompanionMode(storage) {
  const stable = resolveStableCompanionMode(storage);
  if (stable && isValidCompanionMode(stable)) return stable;
  return readStoredCompanionModePreference(storage);
}

/**
 * @param {object} opts
 * @param {string} opts.mode
 * @param {Storage | null | undefined} [opts.storage]
 */
export function noteCompanionModeManualPick({ mode, storage }) {
  const picked = isValidCompanionMode(mode) ? mode : COMPANION_MODE_STAY;
  const highlight = resolveHighlightCompanionMode(storage);
  return {
    acceptedHighlight: picked === highlight,
    recordedQualifying: picked !== highlight
  };
}

/**
 * @param {boolean} recordedQualifying
 * @param {Storage | null | undefined} storage
 */
export function setCompanionStableAwaitingVoteFromPick(recordedQualifying, storage) {
  const store = resolveStore(storage);
  const state = readStablePrefsState(store);
  state.companionAwaitingVote = recordedQualifying === true;
  writeStablePrefsState(state, store);
}

/**
 * @param {object} opts
 * @param {string} opts.mode
 * @param {Storage | null | undefined} [opts.storage]
 * @param {number} [opts.at]
 */
export function onCompanionSessionBeginStablePrefs({ mode, storage, at = Date.now() }) {
  const store = resolveStore(storage);
  const now = Number(at) || Date.now();
  const picked = isValidCompanionMode(mode) ? mode : COMPANION_MODE_STAY;
  const state = readStablePrefsState(store);
  const awaiting = state.companionAwaitingVote === true;
  state.companionAwaitingVote = false;

  let dim = state.companionMode;
  if (dim?.lastUsedAt && now - dim.lastUsedAt > FOCUS_STABLE_DECAY_MS) {
    state.companionMode = undefined;
    dim = undefined;
  }

  if (!awaiting) {
    if (dim) {
      state.companionMode = { ...dim, lastUsedAt: now };
      writeStablePrefsState(state, store);
    }
    return { countedVote: false, promoted: false };
  }

  /** @type {StableCompanionVote} */
  const voteRow = { mode: picked, at: now };
  const windowRows = [...(state.companionVoteWindow || []), voteRow].slice(
    -FOCUS_STABLE_WINDOW
  );
  state.companionVoteWindow = windowRows;

  let promoted = false;
  const suppressUntil = Number(state.companionSuppressUntil) || 0;
  if (now >= suppressUntil) {
    /** @type {Map<string, number>} */
    const counts = new Map();
    for (const row of windowRows) {
      if (!isValidCompanionMode(row.mode)) continue;
      counts.set(row.mode, (counts.get(row.mode) || 0) + 1);
    }
    let bestMode = '';
    let bestCount = 0;
    let tied = false;
    for (const [k, c] of counts) {
      if (c > bestCount) {
        bestCount = c;
        bestMode = k;
        tied = false;
      } else if (c === bestCount) {
        tied = true;
      }
    }
    if (!tied && bestMode && bestCount >= FOCUS_STABLE_PROMOTE_MIN) {
      state.companionMode = { mode: bestMode, lastUsedAt: now };
      promoted = true;
    }
  }

  if (!promoted && dim) {
    state.companionMode = { ...dim, lastUsedAt: now };
  }

  writeStablePrefsState(state, store);
  return { countedVote: true, promoted };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 */
export function resolveStableCompanionL2Fact(storage, now = Date.now()) {
  const mode = resolveStableCompanionMode(storage, now);
  if (!mode || !isValidCompanionMode(mode)) return null;
  return { mode, modeLabelKey: companionModeLocaleKey(mode) };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [at]
 */
export function rejectStableCompanionNotQuite(storage, at = Date.now()) {
  const store = resolveStore(storage);
  const ts = Number(at) || Date.now();
  const state = readStablePrefsState(store);
  state.companionMode = undefined;
  state.companionVoteWindow = [];
  state.companionAwaitingVote = false;
  state.companionSuppressUntil = ts + FOCUS_STABLE_SUPPRESS_MS;
  writeStablePrefsState(state, store);
}
