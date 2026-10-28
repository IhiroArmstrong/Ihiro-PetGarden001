/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { loadPreferredFocusDurationMinutes, FOCUS_DURATION_STORAGE_KEY } from './focusDuration.js';
import { AWAKEN_CHECKIN_STORAGE_KEY, normalizeCheckInRows } from './awakenCheckInStore.js';
import {
  YIN_ADAPTATION_RULE_IDS,
  isAnyInviteKindAdaptationPaused,
  isYinAdaptationEnabled,
  readYinAdaptationState,
  shouldSuggestLowerFocusDuration
} from './yinAdaptationStore.js';

function hasFocusDurationPref(storage) {
  if (!storage) return false;
  try {
    return Boolean(storage.getItem(FOCUS_DURATION_STORAGE_KEY));
  } catch {
    return false;
  }
}

function lastEndCheckInLabel(storage) {
  if (!storage) return null;
  let rows = [];
  try {
    const raw = storage.getItem(AWAKEN_CHECKIN_STORAGE_KEY);
    rows = normalizeCheckInRows(raw ? JSON.parse(raw) : []);
  } catch {
    return null;
  }
  const end = rows.filter((row) => row.phase === 'end' && row.label).at(-1);
  if (!end) return null;
  return { label: end.label };
}

export function buildYinAdaptationNotebookLines(opts = {}) {
  const storage = opts.storage ?? null;
  const now = Number(opts.now) || Date.now();
  const state = readYinAdaptationState();
  const lines = [];

  if (
    !state.hiddenLines[YIN_ADAPTATION_RULE_IDS.REMEMBER_DURATION] &&
    hasFocusDurationPref(storage)
  ) {
    lines.push({
      id: YIN_ADAPTATION_RULE_IDS.REMEMBER_DURATION,
      textKey: 'YIN_ADAPTATION_REMEMBER_DURATION',
      suspended: Boolean(state.suspendedRules[YIN_ADAPTATION_RULE_IDS.REMEMBER_DURATION])
    });
  }

  if (
    lastEndCheckInLabel(storage) &&
    !state.hiddenLines[YIN_ADAPTATION_RULE_IDS.REMEMBER_CHECKIN]
  ) {
    lines.push({
      id: YIN_ADAPTATION_RULE_IDS.REMEMBER_CHECKIN,
      textKey: 'YIN_ADAPTATION_REMEMBER_CHECKIN',
      suspended: Boolean(state.suspendedRules[YIN_ADAPTATION_RULE_IDS.REMEMBER_CHECKIN])
    });
  }

  if (
    isYinAdaptationEnabled() &&
    !state.suspendedRules[YIN_ADAPTATION_RULE_IDS.INVITE_PAUSE] &&
    !state.hiddenLines[YIN_ADAPTATION_RULE_IDS.INVITE_PAUSE] &&
    isAnyInviteKindAdaptationPaused(now)
  ) {
    lines.push({
      id: YIN_ADAPTATION_RULE_IDS.INVITE_PAUSE,
      textKey: 'YIN_ADAPTATION_INVITE_PAUSE'
    });
  }

  if (
    isYinAdaptationEnabled() &&
    !state.hiddenLines[YIN_ADAPTATION_RULE_IDS.DURATION_SUGGEST] &&
    shouldSuggestLowerFocusDuration(storage)
  ) {
    lines.push({
      id: YIN_ADAPTATION_RULE_IDS.DURATION_SUGGEST,
      textKey: 'YIN_ADAPTATION_DURATION_SUGGEST',
      suspended: Boolean(state.suspendedRules[YIN_ADAPTATION_RULE_IDS.DURATION_SUGGEST])
    });
  }

  return lines;
}

export function yinAdaptationNotebookHasContent(storage) {
  return buildYinAdaptationNotebookLines({ storage }).length > 0;
}

