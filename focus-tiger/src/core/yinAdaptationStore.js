/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T58 — local Yin adaptation (quieter invites + duration suggestion + notebook state).
 * Never uploaded; excluded from T54 research payload.
 */

import { getStorage, setStorage } from '../utils/Storage.js';
import {
  FOCUS_DURATION_OPTIONS_MINUTES,
  FOCUS_DURATION_STORAGE_KEY,
  loadPreferredFocusDurationMinutes,
  normalizeFocusDurationMinutes
} from './focusDuration.js';
import {
  INVITE_OUTCOME_KINDS,
  INVITE_OUTCOME_VALUES,
  clearInviteOutcomeRecords
} from './inviteOutcomeStore.js';
import { AWAKEN_CHECKIN_STORAGE_KEY, normalizeCheckInRows } from './awakenCheckInStore.js';

export const YIN_ADAPTATION_STORAGE_KEY = 'focus-tiger.yin-adaptation.v1';
export const FOCUS_DURATION_MANUAL_ANCHOR_STORAGE_KEY =
  'focus-tiger.focus-duration-manual-anchor.v1';

export const YIN_ADAPTATION_DISMISS_STREAK = 3;
export const YIN_ADAPTATION_IGNORE_STREAK = 5;
export const YIN_ADAPTATION_PAUSE_MS = 7 * 24 * 60 * 60 * 1000;
export const YIN_ADAPTATION_TIRED_WINDOW = 5;
export const YIN_ADAPTATION_TIRED_MIN = 3;

export const YIN_ADAPTATION_RULE_IDS = Object.freeze({
  REMEMBER_DURATION: 'remember-duration',
  REMEMBER_CHECKIN: 'remember-checkin',
  INVITE_PAUSE: 'invite-pause',
  DURATION_SUGGEST: 'duration-suggest'
});

export function defaultYinAdaptationState() {
  return {
    enabled: true,
    kindState: {},
    suspendedRules: {},
    hiddenLines: {},
    legacyPrefSeeded: false
  };
}

export function normalizeYinAdaptationState(raw) {
  const base = defaultYinAdaptationState();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw;
  if (typeof obj.enabled === 'boolean') base.enabled = obj.enabled;
  if (typeof obj.legacyPrefSeeded === 'boolean') {
    base.legacyPrefSeeded = obj.legacyPrefSeeded;
  }
  if (obj.kindState && typeof obj.kindState === 'object') {
    for (const [kind, st] of Object.entries(obj.kindState)) {
      if (!st || typeof st !== 'object') continue;
      base.kindState[kind] = {
        consecutiveDismissed: Number(st.consecutiveDismissed) || 0,
        consecutiveIgnored: Number(st.consecutiveIgnored) || 0,
        pausedUntil: Number(st.pausedUntil) || 0
      };
    }
  }
  if (obj.suspendedRules && typeof obj.suspendedRules === 'object') {
    base.suspendedRules = { ...obj.suspendedRules };
  }
  if (obj.hiddenLines && typeof obj.hiddenLines === 'object') {
    base.hiddenLines = { ...obj.hiddenLines };
  }
  return base;
}

export function readYinAdaptationState(key = YIN_ADAPTATION_STORAGE_KEY) {
  return normalizeYinAdaptationState(getStorage(key, null));
}

export function writeYinAdaptationState(state, key = YIN_ADAPTATION_STORAGE_KEY) {
  try {
    setStorage(key, state);
    return true;
  } catch {
    return false;
  }
}

export function isYinAdaptationEnabled(key = YIN_ADAPTATION_STORAGE_KEY) {
  return readYinAdaptationState(key).enabled !== false;
}

export function setYinAdaptationEnabled(enabled, key = YIN_ADAPTATION_STORAGE_KEY) {
  const state = readYinAdaptationState(key);
  state.enabled = enabled;
  if (!enabled) state.kindState = {};
  writeYinAdaptationState(state, key);
}

function kindBucket(kind, state) {
  if (!state.kindState[kind]) {
    state.kindState[kind] = {
      consecutiveDismissed: 0,
      consecutiveIgnored: 0,
      pausedUntil: 0
    };
  }
  return state.kindState[kind];
}

export function applyInviteOutcomeForAdaptation(
  kind,
  outcome,
  ts = Date.now(),
  key = YIN_ADAPTATION_STORAGE_KEY
) {
  const state = readYinAdaptationState(key);
  if (!state.enabled) return;
  if (state.suspendedRules[YIN_ADAPTATION_RULE_IDS.INVITE_PAUSE]) return;

  const bucket = kindBucket(kind, state);
  if (bucket.pausedUntil > ts) {
    writeYinAdaptationState(state, key);
    return;
  }

  if (outcome === INVITE_OUTCOME_VALUES.ACCEPTED) {
    bucket.consecutiveDismissed = 0;
    bucket.consecutiveIgnored = 0;
  } else if (outcome === INVITE_OUTCOME_VALUES.DISMISSED) {
    bucket.consecutiveDismissed += 1;
  } else if (outcome === INVITE_OUTCOME_VALUES.IGNORED) {
    bucket.consecutiveIgnored += 1;
  }

  if (bucket.consecutiveDismissed >= YIN_ADAPTATION_DISMISS_STREAK) {
    bucket.pausedUntil = ts + YIN_ADAPTATION_PAUSE_MS;
    bucket.consecutiveDismissed = 0;
    bucket.consecutiveIgnored = 0;
  } else if (bucket.consecutiveIgnored >= YIN_ADAPTATION_IGNORE_STREAK) {
    bucket.pausedUntil = ts + YIN_ADAPTATION_PAUSE_MS;
    bucket.consecutiveDismissed = 0;
    bucket.consecutiveIgnored = 0;
  }

  writeYinAdaptationState(state, key);
}

export function isInviteKindAdaptationPaused(
  kind,
  now = Date.now(),
  key = YIN_ADAPTATION_STORAGE_KEY
) {
  const state = readYinAdaptationState(key);
  if (!state.enabled) return false;
  if (state.suspendedRules[YIN_ADAPTATION_RULE_IDS.INVITE_PAUSE]) return false;
  const bucket = state.kindState[kind];
  if (!bucket) return false;
  return bucket.pausedUntil > now;
}

export function inviteOutcomeKindFromAwakenPath(awakenKind, decision) {
  if (awakenKind === 'extend') return INVITE_OUTCOME_KINDS.EXTEND;
  if (awakenKind === 'long-sit') return INVITE_OUTCOME_KINDS.LONG_SIT;
  if (decision?.kind === 'extend') return INVITE_OUTCOME_KINDS.EXTEND;
  return INVITE_OUTCOME_KINDS.AWAY;
}

export function recordManualFocusDurationAnchor(minutes, storage) {
  const m = normalizeFocusDurationMinutes(minutes);
  const store = storage ?? null;
  if (store) {
    try {
      store.setItem(
        FOCUS_DURATION_MANUAL_ANCHOR_STORAGE_KEY,
        JSON.stringify({ minutes: m, ts: Date.now() })
      );
    } catch {
      /* ignore */
    }
  }
  const state = readYinAdaptationState();
  state.legacyPrefSeeded = true;
  writeYinAdaptationState(state);
  return m;
}

export function readManualFocusDurationAnchorMinutes(storage) {
  const store = storage ?? null;
  if (!store) return null;
  try {
    const raw = store.getItem(FOCUS_DURATION_MANUAL_ANCHOR_STORAGE_KEY);
    if (!raw) return null;
    return normalizeFocusDurationMinutes(JSON.parse(raw)?.minutes);
  } catch {
    return null;
  }
}

export function resolveFocusDurationAnchorMinutes(storage) {
  const manual = readManualFocusDurationAnchorMinutes(storage);
  if (manual != null) return manual;
  const state = readYinAdaptationState();
  const store = storage ?? null;
  if (!store) return null;
  try {
    if (!store.getItem(FOCUS_DURATION_STORAGE_KEY)) return null;
    if (!state.legacyPrefSeeded) {
      state.legacyPrefSeeded = true;
      writeYinAdaptationState(state);
    }
    return loadPreferredFocusDurationMinutes(store);
  } catch {
    return null;
  }
}

export function focusDurationOneTierBelow(anchorMinutes) {
  const anchor = normalizeFocusDurationMinutes(anchorMinutes);
  const idx = FOCUS_DURATION_OPTIONS_MINUTES.indexOf(anchor);
  if (idx <= 0) return anchor;
  return FOCUS_DURATION_OPTIONS_MINUTES[idx - 1];
}

export function countTiredInRecentEndCheckIns(
  storage,
  windowSize = YIN_ADAPTATION_TIRED_WINDOW
) {
  let rows = [];
  const store = storage ?? null;
  if (store) {
    try {
      const raw = store.getItem(AWAKEN_CHECKIN_STORAGE_KEY);
      rows = normalizeCheckInRows(raw ? JSON.parse(raw) : []);
    } catch {
      rows = [];
    }
  } else {
    rows = normalizeCheckInRows(getStorage(AWAKEN_CHECKIN_STORAGE_KEY, []));
  }
  return rows
    .filter((row) => row.phase === 'end' && row.label === 'tired')
    .slice(-windowSize).length;
}

export function shouldSuggestLowerFocusDuration(storage) {
  if (!isYinAdaptationEnabled()) return false;
  const state = readYinAdaptationState();
  if (state.suspendedRules[YIN_ADAPTATION_RULE_IDS.DURATION_SUGGEST]) return false;
  const anchor = resolveFocusDurationAnchorMinutes(storage);
  if (anchor == null) return false;
  if (countTiredInRecentEndCheckIns(storage) < YIN_ADAPTATION_TIRED_MIN) return false;
  return focusDurationOneTierBelow(anchor) < anchor;
}

export function resolveAdaptedFocusDurationHighlightMinutes(storage) {
  const pref = loadPreferredFocusDurationMinutes(storage);
  if (!isYinAdaptationEnabled()) return pref;
  const anchor = resolveFocusDurationAnchorMinutes(storage);
  if (anchor == null) return pref;
  if (shouldSuggestLowerFocusDuration(storage)) {
    return focusDurationOneTierBelow(anchor);
  }
  return anchor;
}

export function suspendYinAdaptationRule(ruleId, key = YIN_ADAPTATION_STORAGE_KEY) {
  const state = readYinAdaptationState(key);
  state.suspendedRules[ruleId] = true;
  writeYinAdaptationState(state, key);
}

export function hideYinAdaptationNotebookLine(ruleId, key = YIN_ADAPTATION_STORAGE_KEY) {
  const state = readYinAdaptationState(key);
  state.hiddenLines[ruleId] = true;
  if (
    ruleId === YIN_ADAPTATION_RULE_IDS.INVITE_PAUSE ||
    ruleId === YIN_ADAPTATION_RULE_IDS.DURATION_SUGGEST
  ) {
    clearInviteOutcomeRecords();
    state.kindState = {};
  }
  writeYinAdaptationState(state, key);
}

export function forgetYinAdaptationTuning(key = YIN_ADAPTATION_STORAGE_KEY) {
  clearInviteOutcomeRecords();
  const state = readYinAdaptationState(key);
  state.kindState = {};
  state.suspendedRules = {};
  state.hiddenLines = {};
  writeYinAdaptationState(state, key);
}

export function isAnyInviteKindAdaptationPaused(now = Date.now(), key = YIN_ADAPTATION_STORAGE_KEY) {
  return (
    isInviteKindAdaptationPaused(INVITE_OUTCOME_KINDS.AWAY, now, key) ||
    isInviteKindAdaptationPaused(INVITE_OUTCOME_KINDS.EXTEND, now, key) ||
    isInviteKindAdaptationPaused(INVITE_OUTCOME_KINDS.LONG_SIT, now, key)
  );
}
