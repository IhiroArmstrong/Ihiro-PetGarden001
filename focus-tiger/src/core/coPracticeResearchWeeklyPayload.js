/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T81 S1 — local weekly payload builder (no network).
 */

import { getLocalDateKey } from '../utils/localDate.js';
import { PracticeDaysStore, shiftLocalDateKey } from './PracticeDaysStore.js';
import {
  CO_PRACTICE_RESEARCH_SCHEMA_VERSION,
  clampResearchCount,
  CO_PRACTICE_RESEARCH_COUNT_CAPS
} from './coPracticeResearchEnums.js';
import {
  formatIsoWeekLocal,
  localWeekBoundsFromKey,
  practiceTimeSlotForLocalDate,
  tenureWeeksSinceConsent,
  isTimestampInLocalWeek
} from './coPracticeResearchIsoWeek.js';
import { buildCompanionWeekAggregate } from './coPracticeResearchCompanionWeek.js';
import { readRitualCompletionState } from './RitualCompletionStore.js';
import {
  T54_LOG_END,
  T54_LOG_SOURCE,
  T54_RESEARCH_LOG_STORAGE_KEY
} from './t54ResearchLedger.js';
import { FOCUS_CIRCLE_STORAGE_KEY } from './focusCircleMembership.js';
import { REMINDER_PREFERENCE_STORAGE_KEY } from './reminderPreference.js';

const EMPTY_PRACTICE_BLOCK = () => ({
  started: 0,
  completed: 0,
  minutes: 0
});

function resolveStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
function readT54ResearchLogRows(storage) {
  const store = resolveStorage(storage);
  if (!store) return [];
  try {
    const parsed = JSON.parse(store.getItem(T54_RESEARCH_LOG_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} weekKey
 */
function buildPracticeWeekAggregate(storage, weekKey) {
  const bounds = localWeekBoundsFromKey(weekKey);
  const rows = readT54ResearchLogRows(storage);
  const sit = EMPTY_PRACTICE_BLOCK();
  const breath = EMPTY_PRACTICE_BLOCK();
  const honesty = EMPTY_PRACTICE_BLOCK();
  const micro = EMPTY_PRACTICE_BLOCK();
  /** @type {Record<string, number>} */
  const timeSlots = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    lateNight: 0
  };

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const startedAt = Date.parse(String(row.startedAt || ''));
    if (!isTimestampInLocalWeek(startedAt, bounds)) continue;
    const source = row.source;
    const actualMinutes = clampResearchCount(
      row.actualMinutes,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.minutesWeek
    );
    const completed = row.endKind === T54_LOG_END.COMPLETED;
    const slot = practiceTimeSlotForLocalDate(new Date(startedAt));
    timeSlots[slot] = clampResearchCount(
      (timeSlots[slot] || 0) + 1,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.practiceBlock
    );

    if (
      source === T54_LOG_SOURCE.SELF_OPEN ||
      source === T54_LOG_SOURCE.SILENCE_NUDGE
    ) {
      sit.started += 1;
      if (completed) sit.completed += 1;
      sit.minutes += actualMinutes;
    } else if (source === T54_LOG_SOURCE.HONESTY_MAKEUP) {
      honesty.started += 1;
      if (completed) honesty.completed += 1;
      honesty.minutes += actualMinutes;
    } else if (source === T54_LOG_SOURCE.RITUAL) {
      micro.started += 1;
      if (completed) micro.completed += 1;
      micro.minutes += actualMinutes;
    }
  }

  const ritualState = readRitualCompletionState(resolveStorage(storage));
  for (const entry of ritualState.entries || []) {
    const at = Date.parse(entry.at || '');
    if (!isTimestampInLocalWeek(at, bounds)) continue;
    micro.started += 1;
    micro.completed += 1;
    const slot = practiceTimeSlotForLocalDate(new Date(at));
    timeSlots[slot] = clampResearchCount(
      (timeSlots[slot] || 0) + 1,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.practiceBlock
    );
  }

  for (const block of [sit, breath, honesty, micro]) {
    block.started = clampResearchCount(
      block.started,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.practiceBlock
    );
    block.completed = clampResearchCount(
      block.completed,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.practiceBlock
    );
    block.minutes = clampResearchCount(
      block.minutes,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.minutesWeek
    );
  }

  return {
    practice: { sit, breath, honesty, micro },
    timeSlots
  };
}

/**
 * Monday-first dayMask for the ISO week (local calendar).
 *
 * @param {Storage | null | undefined} storage
 * @param {string} weekKey
 */
function buildDayMaskForWeek(storage, weekKey) {
  const store = resolveStorage(storage);
  const bounds = localWeekBoundsFromKey(weekKey);
  const monday = new Date(bounds.startMs);
  const practice = new PracticeDaysStore({ storage: store });
  const practiced = new Set(practice.getPracticedDateKeys());
  let mask = '';
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = getLocalDateKey(d);
    mask += practiced.has(key) ? '1' : '0';
  }
  return mask.length === 7 ? mask : '0000000';
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} weekKey
 */
function buildRetentionForWeek(storage, weekKey) {
  const store = resolveStorage(storage);
  const bounds = localWeekBoundsFromKey(weekKey);
  const practice = new PracticeDaysStore({ storage: store });
  const practicedDates = practice.getPracticedDateKeys();

  const weekEndKey = getLocalDateKey(new Date(bounds.endMs));
  let daysSinceLastPractice = CO_PRACTICE_RESEARCH_COUNT_CAPS.retentionDays;
  const practicedSet = new Set(practicedDates);
  for (let back = 0; back <= 400; back += 1) {
    const key = shiftLocalDateKey(weekEndKey, -back);
    if (practicedSet.has(key)) {
      daysSinceLastPractice = back;
      break;
    }
  }

  const monday = new Date(bounds.startMs);
  let longestGapDays = 0;
  let currentGap = 0;
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = getLocalDateKey(d);
    if (practicedSet.has(key)) {
      longestGapDays = Math.max(longestGapDays, currentGap);
      currentGap = 0;
    } else {
      currentGap += 1;
      longestGapDays = Math.max(longestGapDays, currentGap);
    }
  }

  let comebacks = 0;
  for (const dateKey of practicedDates) {
    const ms = Date.parse(`${dateKey}T12:00:00`);
    if (!isTimestampInLocalWeek(ms, bounds)) continue;
    let gap = 0;
    for (let back = 1; back <= 30; back += 1) {
      const prev = shiftLocalDateKey(dateKey, -back);
      if (practicedSet.has(prev)) break;
      gap = back;
    }
    if (gap >= 3) comebacks += 1;
  }

  return {
    daysSinceLastPractice: clampResearchCount(
      daysSinceLastPractice,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.retentionDays
    ),
    longestGapDays: clampResearchCount(
      longestGapDays,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.retentionDays
    ),
    comebacks: clampResearchCount(
      comebacks,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.comebacks
    )
  };
}

/**
 * @param {Storage | null | undefined} storage
 */
function readResearchFlagsSnapshot(storage) {
  const store = resolveStorage(storage);
  let localAi = false;
  let focusCircle = false;
  let reminders = false;
  if (!store) {
    return { localAi, focusCircle, reminders };
  }
  try {
    const companionMode = store.getItem('focus-tiger.companion-mode.v1');
    if (companionMode) {
      const parsed = JSON.parse(companionMode);
      localAi =
        parsed?.generateEnabled === true ||
        parsed?.localAiEnabled === true ||
        parsed?.l2Enabled === true;
    }
  } catch {
    /* ignore */
  }
  try {
    const fcRaw = store.getItem(FOCUS_CIRCLE_STORAGE_KEY);
    if (fcRaw) {
      const parsed = JSON.parse(fcRaw);
      focusCircle = Boolean(parsed?.circleId || parsed?.joined);
    }
  } catch {
    /* ignore */
  }
  try {
    const remRaw = store.getItem(REMINDER_PREFERENCE_STORAGE_KEY);
    if (remRaw) {
      const parsed = JSON.parse(remRaw);
      reminders = parsed !== null && typeof parsed === 'object';
    }
  } catch {
    /* ignore */
  }
  return { localAi, focusCircle, reminders };
}

/**
 * @param {object} opts
 * @param {string} opts.studyId UUIDv4
 * @param {{ v: number, tier2: boolean }} opts.consent
 * @param {'en' | 'ja' | 'zh'} opts.locale
 * @param {'web' | 'mac' | 'win'} opts.platform
 * @param {string | null} [opts.consentedAt] ISO consent timestamp for tenureWeeks
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @param {string} [opts.week] override ISO week key
 */
export function buildWeeklyPayload(opts) {
  const storage = resolveStorage(opts.storage);
  const now = opts.now ? opts.now() : new Date();
  const week = opts.week || formatIsoWeekLocal(now);
  const bounds = localWeekBoundsFromKey(week);
  const weekEndSunday = new Date(bounds.endMs);

  const { practice, timeSlots } = buildPracticeWeekAggregate(storage, week);
  const companion = buildCompanionWeekAggregate(storage, week);
  const dayMask = buildDayMaskForWeek(storage, week);
  const retention = buildRetentionForWeek(storage, week);
  const flags = readResearchFlagsSnapshot(storage);

  return {
    studyId: opts.studyId,
    schemaVersion: CO_PRACTICE_RESEARCH_SCHEMA_VERSION,
    week,
    tenureWeeks: tenureWeeksSinceConsent(opts.consentedAt, weekEndSunday),
    locale: opts.locale,
    platform: opts.platform,
    consent: {
      v: Math.max(1, Math.floor(Number(opts.consent?.v) || 1)),
      tier2: opts.consent?.tier2 === true
    },
    t1: {
      practice,
      dayMask,
      timeSlots,
      companion,
      retention,
      flags
    }
  };
}

export {
  noteCoPracticeResearchConfideOpened,
  noteCoPracticeResearchRouteClass
} from './coPracticeResearchWeekLedger.js';
export { mapConfideReplyToResearchRouteClass } from './coPracticeResearchRouteMap.js';
