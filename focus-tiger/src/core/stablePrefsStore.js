/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T87 — stable preference layer v1 (Focus duration).
 * Vote only after the user changes the chip / mode (see main.js + noteFocusDurationChipChosen)
 * and then begins a timed Focus session.
 */

import {
  FOCUS_DURATION_DEFAULT_MINUTES,
  FOCUS_DURATION_MODE_FIXED,
  FOCUS_DURATION_MODE_OPEN,
  FOCUS_DURATION_OPTIONS_MINUTES,
  loadPreferredFocusDurationMinutes,
  normalizeFocusDurationMinutes,
  normalizeFocusDurationMode
} from './focusDuration.js';

const YIN_ADAPTATION_STORAGE_KEY = 'focus-tiger.yin-adaptation.v1';
const FOCUS_DURATION_MANUAL_ANCHOR_KEY = 'focus-tiger.focus-duration-manual-anchor.v1';

/** @typedef {'fixed' | 'open'} StableFocusDurationKind */

export const STABLE_PREFS_STORAGE_KEY = 'focus-tiger.stable-prefs.v1';

export const FOCUS_STABLE_PROMOTE_MIN = 3;
export const FOCUS_STABLE_WINDOW = 5;
export const FOCUS_STABLE_DECAY_MS = 14 * 24 * 60 * 60 * 1000;
export const FOCUS_STABLE_SUPPRESS_MS = 14 * 24 * 60 * 60 * 1000;

export const STABLE_FOCUS_NOTEBOOK_LINE_ID = 'stable-focus-minutes-fact';

/**
 * @typedef {{
 *   kind: StableFocusDurationKind,
 *   minutes?: number,
 *   lastUsedAt?: number
 * }} StableFocusDimState
 *
 * @typedef {{
 *   kind: StableFocusDurationKind,
 *   minutes?: number,
 *   at: number
 * }} StableFocusVote
 *
 * @typedef {{
 *   focusMinutes?: StableFocusDimState,
 *   focusVoteWindow: StableFocusVote[],
 *   focusSuppressUntil: number,
 *   focusAwaitingVote: boolean
 * }} StablePrefsV1
 */

export function defaultStablePrefsState() {
  return {
    focusVoteWindow: [],
    focusSuppressUntil: 0,
    focusAwaitingVote: false
  };
}

/**
 * @param {unknown} raw
 * @returns {StablePrefsV1}
 */
export function normalizeStablePrefsState(raw) {
  const base = defaultStablePrefsState();
  if (!raw || typeof raw !== 'object') return base;
  const o = /** @type {Record<string, unknown>} */ (raw);

  const fm = o.focusMinutes;
  if (fm && typeof fm === 'object') {
    const f = /** @type {Record<string, unknown>} */ (fm);
    const kind =
      f.kind === FOCUS_DURATION_MODE_OPEN ? FOCUS_DURATION_MODE_OPEN : FOCUS_DURATION_MODE_FIXED;
    const minutes =
      kind === FOCUS_DURATION_MODE_FIXED
        ? normalizeFocusDurationMinutes(f.minutes)
        : normalizeFocusDurationMinutes(f.minutes ?? FOCUS_DURATION_DEFAULT_MINUTES);
    const lastUsedAt = Number(f.lastUsedAt);
    base.focusMinutes = {
      kind,
      minutes,
      lastUsedAt: Number.isFinite(lastUsedAt) && lastUsedAt > 0 ? lastUsedAt : undefined
    };
  }

  if (Array.isArray(o.focusVoteWindow)) {
    /** @type {StableFocusVote[]} */
    const out = [];
    for (const row of o.focusVoteWindow) {
      if (!row || typeof row !== 'object') continue;
      const r = /** @type {Record<string, unknown>} */ (row);
      const at = Number(r.at);
      if (!Number.isFinite(at)) continue;
      const kind =
        r.kind === FOCUS_DURATION_MODE_OPEN ? FOCUS_DURATION_MODE_OPEN : FOCUS_DURATION_MODE_FIXED;
      const minutes =
        kind === FOCUS_DURATION_MODE_FIXED
          ? normalizeFocusDurationMinutes(r.minutes)
          : normalizeFocusDurationMinutes(r.minutes ?? FOCUS_DURATION_DEFAULT_MINUTES);
      out.push({ kind, minutes, at });
    }
    base.focusVoteWindow = out.slice(-FOCUS_STABLE_WINDOW);
  }

  const sup = Number(o.focusSuppressUntil);
  base.focusSuppressUntil = Number.isFinite(sup) && sup > 0 ? sup : 0;

  base.focusAwaitingVote = o.focusAwaitingVote === true;

  return base;
}

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
 * @param {Storage | null | undefined} storage
 * @param {string} [key]
 * @returns {StablePrefsV1}
 */
export function readStablePrefsState(storage, key = STABLE_PREFS_STORAGE_KEY) {
  const store = resolveStore(storage);
  if (!store) return normalizeStablePrefsState(null);
  try {
    const raw = store.getItem(key);
    if (!raw) return normalizeStablePrefsState(null);
    return normalizeStablePrefsState(JSON.parse(raw));
  } catch {
    return normalizeStablePrefsState(null);
  }
}

/**
 * @param {StablePrefsV1} state
 * @param {Storage | null | undefined} storage
 * @param {string} [key]
 * @returns {boolean}
 */
export function writeStablePrefsState(state, storage, key = STABLE_PREFS_STORAGE_KEY) {
  const store = resolveStore(storage);
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(normalizeStablePrefsState(state)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Call when the user picks a chip (after `noteFocusDurationChipChosen`).
 * @param {boolean} recordedQualifying
 * @param {Storage | null | undefined} storage
 */
export function setFocusStableAwaitingVoteFromChip(recordedQualifying, storage) {
  const store = resolveStore(storage);
  const state = readStablePrefsState(store);
  state.focusAwaitingVote = recordedQualifying === true;
  writeStablePrefsState(state, store);
}

/**
 * Call when the user picks open-ended (before `beginFocusWithMode`).
 * @param {boolean} wasOpenEndedAlready
 * @param {Storage | null | undefined} storage
 */
export function setFocusStableAwaitingVoteForOpenEnded(wasOpenEndedAlready, storage) {
  const store = resolveStore(storage);
  const state = readStablePrefsState(store);
  state.focusAwaitingVote = wasOpenEndedAlready !== true;
  writeStablePrefsState(state, store);
}

/**
 * Call when a path skips the chip UI but the user explicitly chose minutes (e.g. cold-start direct sit).
 * @param {boolean} shouldCount
 * @param {Storage | null | undefined} storage
 */
export function setFocusStableAwaitingVoteExplicit(shouldCount, storage) {
  const store = resolveStore(storage);
  const state = readStablePrefsState(store);
  state.focusAwaitingVote = shouldCount === true;
  writeStablePrefsState(state, store);
}

/** Call when the duration picker closes without starting a session. */
export function clearFocusStableAwaitingVote(storage) {
  const store = resolveStore(storage);
  const state = readStablePrefsState(store);
  state.focusAwaitingVote = false;
  writeStablePrefsState(state, store);
}

function voteKey(vote) {
  if (vote.kind === FOCUS_DURATION_MODE_OPEN) return `open`;
  return `fixed:${normalizeFocusDurationMinutes(vote.minutes)}`;
}

/**
 * @param {object} opts
 * @param {'fixed' | 'open'} opts.durationMode
 * @param {number} opts.targetMinutes
 * @param {Storage | null | undefined} [opts.storage]
 * @param {number} [opts.at]
 * @returns {{ countedVote: boolean, promoted: boolean }}
 */
export function onFocusSessionBeginStablePrefs({
  durationMode,
  targetMinutes,
  storage,
  at = Date.now()
}) {
  const store = resolveStore(storage);
  const now = Number(at) || Date.now();
  const mode = normalizeFocusDurationMode(durationMode);
  const minutes =
    mode === FOCUS_DURATION_MODE_FIXED
      ? normalizeFocusDurationMinutes(targetMinutes)
      : normalizeFocusDurationMinutes(loadPreferredFocusDurationMinutes(store));

  const state = readStablePrefsState(store);
  const awaiting = state.focusAwaitingVote === true;
  state.focusAwaitingVote = false;

  let dim = state.focusMinutes;
  const suppressUntil = Number(state.focusSuppressUntil) || 0;

  if (dim?.lastUsedAt && now - dim.lastUsedAt > FOCUS_STABLE_DECAY_MS) {
    state.focusMinutes = undefined;
    dim = undefined;
  }

  if (!awaiting) {
    if (dim) {
      state.focusMinutes = { ...dim, lastUsedAt: now };
      writeStablePrefsState(state, store);
    }
    return { countedVote: false, promoted: false };
  }

  /** @type {StableFocusVote} */
  const voteRow = {
    kind: mode,
    minutes,
    at: now
  };
  const windowRows = [...(state.focusVoteWindow || []), voteRow].slice(-FOCUS_STABLE_WINDOW);
  state.focusVoteWindow = windowRows;

  let promoted = false;
  if (now >= suppressUntil) {
    /** @type {Map<string, number>} */
    const counts = new Map();
    for (const row of windowRows) {
      const k = voteKey(row);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    let bestCount = 0;
    /** @type {Set<string>} */
    const tiedAtBest = new Set();
    for (const [k, c] of counts) {
      if (c > bestCount) {
        bestCount = c;
        tiedAtBest.clear();
        tiedAtBest.add(k);
      } else if (c === bestCount) {
        tiedAtBest.add(k);
      }
    }
    const bestKey = tiedAtBest.size === 1 ? [...tiedAtBest][0] : null;
    if (bestKey && bestCount >= FOCUS_STABLE_PROMOTE_MIN) {
      if (bestKey === 'open') {
        state.focusMinutes = {
          kind: FOCUS_DURATION_MODE_OPEN,
          minutes: normalizeFocusDurationMinutes(loadPreferredFocusDurationMinutes(store)),
          lastUsedAt: now
        };
      } else {
        const m = Number(bestKey.replace(/^fixed:/, ''));
        const fm = FOCUS_DURATION_OPTIONS_MINUTES.includes(/** @type {10|15|25|45} */ (m))
          ? m
          : normalizeFocusDurationMinutes(m);
        state.focusMinutes = {
          kind: FOCUS_DURATION_MODE_FIXED,
          minutes: fm,
          lastUsedAt: now
        };
      }
      promoted = true;
    }
  }

  if (!promoted && dim) {
    state.focusMinutes = { ...dim, lastUsedAt: now };
  }

  writeStablePrefsState(state, store);
  return { countedVote: true, promoted };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 * @returns {StableFocusDimState | null}
 */
export function readStableFocusMinutesDim(storage, now = Date.now()) {
  const ts = Number(now) || Date.now();
  const state = readStablePrefsState(storage);
  const dim = state.focusMinutes;
  if (!dim) return null;
  const last = Number(dim.lastUsedAt) || 0;
  if (last > 0 && ts - last > FOCUS_STABLE_DECAY_MS) {
    const cleared = readStablePrefsState(storage);
    cleared.focusMinutes = undefined;
    writeStablePrefsState(cleared, storage);
    return null;
  }
  return dim;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 * @returns {number | null} stable fixed minutes, or null if not stable / open / suppressed
 */
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
 */
export function clearFocusDurationManualAnchor(storage) {
  try {
    resolveStore(storage)?.removeItem(FOCUS_DURATION_MANUAL_ANCHOR_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * T87 forget path: stable layer + manual anchor (last pref retained separately).
 * @param {Storage | null | undefined} storage
 */
export function forgetStableFocusLearning(storage) {
  clearStablePrefsState(storage);
  clearFocusDurationManualAnchor(storage);
}

export function resolveStableFocusFixedMinutes(storage, now = Date.now()) {
  if (!readYinAdaptationEnabled(storage)) return null;
  const ts = Number(now) || Date.now();
  const state = readStablePrefsState(storage);
  if ((Number(state.focusSuppressUntil) || 0) > ts) return null;
  const dim = readStableFocusMinutesDim(storage, ts);
  if (!dim || dim.kind !== FOCUS_DURATION_MODE_FIXED) return null;
  return normalizeFocusDurationMinutes(dim.minutes);
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 * @returns {{ minutes: number } | null}
 */
export function resolveStableFocusL2Fact(storage, now = Date.now()) {
  const m = resolveStableFocusFixedMinutes(storage, now);
  if (m == null) return null;
  return { minutes: m };
}

/**
 * 「不是这样」— clear focus stable + votes; suppress 14d.
 * @param {Storage | null | undefined} storage
 * @param {number} [at]
 */
export function rejectStableFocusNotQuite(storage, at = Date.now()) {
  const store = resolveStore(storage);
  const ts = Number(at) || Date.now();
  const state = readStablePrefsState(store);
  state.focusMinutes = undefined;
  state.focusVoteWindow = [];
  state.focusAwaitingVote = false;
  state.focusSuppressUntil = ts + FOCUS_STABLE_SUPPRESS_MS;
  writeStablePrefsState(state, store);
}

/**
 * Forget / clear all stable prefs for Focus (also used from forgetYinAdaptationTuning).
 * @param {Storage | null | undefined} storage
 */
export function clearStablePrefsState(storage) {
  const store = resolveStore(storage);
  try {
    store?.removeItem(STABLE_PREFS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
