/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { FOCUS_DURATION_STORAGE_KEY } from './focusDuration.js';
import { AWAKEN_CHECKIN_STORAGE_KEY, normalizeCheckInRows } from './awakenCheckInStore.js';
import {
  YIN_ADAPTATION_RULE_IDS,
  isAnyInviteKindAdaptationPaused,
  isYinAdaptationEnabled,
  readYinAdaptationState,
  shouldSuggestLowerFocusDuration
} from './yinAdaptationStore.js';
import { getEveningPracticePaperFact } from './eveningPracticeFacts.js';
import { getLocalDateKey } from '../utils/localDate.js';
import { resolvePrefStateReadModel } from './prefStateResolver.js';

export const PREF_NOTEBOOK_LINE_IDS = Object.freeze({
  EVENING_SLOT: 'pref-evening-slot',
  HABITUAL_SEEN: 'pref-habitual-seen',
  HABITUAL_CONFIRM: 'pref-habitual-confirm'
});

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
  const todayKey = opts.todayKey || getLocalDateKey(new Date(now));
  const state = readYinAdaptationState();
  const lines = [];
  const pref = resolvePrefStateReadModel(storage);

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

  const eveningFact = getEveningPracticePaperFact(storage, todayKey);
  if (eveningFact?.show) {
    lines.push({
      id: PREF_NOTEBOOK_LINE_IDS.EVENING_SLOT,
      textKey: eveningFact.localeKey,
      textParams: { n: String(eveningFact.count) },
      kind: 'fact'
    });
  }

  if (pref.habitualFocusMinutes != null) {
    lines.push({
      id: PREF_NOTEBOOK_LINE_IDS.HABITUAL_SEEN,
      textKey: 'PREF_HABITUAL_SEEN',
      textParams: { n: String(pref.habitualFocusMinutes) },
      kind: 'fact'
    });
  }

  if (pref.needsHabitualConfirm && pref.habitualFocusMinutes != null) {
    lines.push({
      id: PREF_NOTEBOOK_LINE_IDS.HABITUAL_CONFIRM,
      textKey: 'PREF_HABITUAL_CONFIRM',
      textParams: { n: String(pref.habitualFocusMinutes) },
      kind: 'confirm'
    });
  }

  return lines;
}

export function yinAdaptationNotebookHasContent(storage) {
  return buildYinAdaptationNotebookLines({ storage }).length > 0;
}
