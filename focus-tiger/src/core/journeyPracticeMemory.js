/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Evolution P0 · practice witness memories + Come Back (Journey Log surface).
 *
 * SSOT: `docs/YIN_EVOLUTION.md` §5–6. Presentation only — no scoreFormula consumer,
 * no popups, no Stage HUD. Persisted inside `focus-tiger.journey-log.v1`.
 */

import { bloomCountForMinutes } from './lotusPondMath.js';
import { LotusPondStore } from './LotusPondStore.js';
import {
  countRecentPracticeStreak,
  PracticeDaysStore,
  shiftLocalDateKey
} from './PracticeDaysStore.js';
import {
  PRACTICE_BASELINE_SOURCE_IDS,
  resolvePracticeAggregate
} from './practiceAggregate.js';
import {
  JOURNEY_LOG_STORAGE_KEY,
  journeyLogDateKey,
  readJourneyLog,
  writeJourneyLog
} from './journeyLogGate.js';
import { getLocalDateKey } from '../utils/localDate.js';

/** @typedef {typeof PRACTICE_BASELINE_SOURCE_IDS[number]} PracticeBaselineSourceId */

/** One-time milestone ids (YIN_EVOLUTION §6 + optional first lotus). */
export const JOURNEY_PRACTICE_MILESTONE_IDS = Object.freeze([
  'first-practice',
  'streak-7',
  'streak-21',
  'first-return',
  'practice-variety',
  'streak-100',
  'first-lotus'
]);

export const JOURNEY_COME_BACK_ID = 'come-back';

const STREAK_MILESTONES = Object.freeze([
  { id: 'streak-7', days: 7 },
  { id: 'streak-21', days: 21 },
  { id: 'streak-100', days: 100 }
]);

/**
 * @typedef {{
 *   kind: 'milestone' | 'come-back',
 *   id: string,
 *   at: string,
 *   dateKey?: string
 * }} JourneyPracticeMemory
 *
 * @typedef {{
 *   entries: import('./journeyLogGate.js').JourneyLogEntry[],
 *   memories?: JourneyPracticeMemory[],
 *   sourcesSeen?: string[]
 * }} JourneyLogExtendedState
 */

/**
 * @param {unknown} raw
 * @returns {JourneyPracticeMemory[]}
 */
export function normalizeJourneyPracticeMemories(raw) {
  if (!Array.isArray(raw)) return [];
  /** @type {JourneyPracticeMemory[]} */
  const out = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const o = /** @type {Record<string, unknown>} */ (row);
    const id = typeof o.id === 'string' ? o.id.trim() : '';
    const at = typeof o.at === 'string' && o.at ? o.at : '';
    const kind = o.kind === 'come-back' ? 'come-back' : 'milestone';
    if (!id || !at) continue;
    /** @type {JourneyPracticeMemory} */
    const mem = { kind, id, at };
    if (typeof o.dateKey === 'string' && o.dateKey) mem.dateKey = o.dateKey;
    out.push(mem);
  }
  return out;
}

/**
 * @param {unknown} raw
 * @returns {string[]}
 */
export function normalizeJourneySourcesSeen(raw) {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(PRACTICE_BASELINE_SOURCE_IDS);
  return raw
    .filter((x) => typeof x === 'string' && allowed.has(/** @type {string} */ (x)))
    .slice();
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {JourneyLogExtendedState}
 */
export function readJourneyLogExtended(storage) {
  const base = readJourneyLog(storage);
  if (!storage) {
    return { entries: base.entries, memories: [], sourcesSeen: [] };
  }
  try {
    const raw = storage.getItem(JOURNEY_LOG_STORAGE_KEY);
    if (!raw) return { entries: base.entries, memories: [], sourcesSeen: [] };
    const parsed = JSON.parse(raw);
    return {
      entries: base.entries,
      memories: normalizeJourneyPracticeMemories(parsed?.memories),
      sourcesSeen: normalizeJourneySourcesSeen(parsed?.sourcesSeen)
    };
  } catch {
    return { entries: base.entries, memories: [], sourcesSeen: [] };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {JourneyLogExtendedState} state
 */
export function writeJourneyLogExtended(storage, state) {
  writeJourneyLog(storage, { entries: state.entries });
  if (!storage) return;
  try {
    const prevRaw = storage.getItem(JOURNEY_LOG_STORAGE_KEY);
    let parsed = {};
    if (prevRaw) {
      try {
        parsed = JSON.parse(prevRaw) ?? {};
      } catch {
        parsed = {};
      }
    }
    parsed.entries = readJourneyLog(storage).entries;
    parsed.memories = normalizeJourneyPracticeMemories(state.memories);
    parsed.sourcesSeen = normalizeJourneySourcesSeen(state.sourcesSeen);
    storage.setItem(JOURNEY_LOG_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Locale key for a memory row (Journey Log UI).
 * @param {Pick<JourneyPracticeMemory, 'kind' | 'id'>} memory
 * @returns {string}
 */
export function journeyPracticeMemoryLocaleKey(memory) {
  if (memory.kind === 'come-back') return 'JOURNEY_MEMORY_COME_BACK';
  switch (memory.id) {
    case 'first-practice':
      return 'JOURNEY_MEMORY_FIRST_PRACTICE';
    case 'streak-7':
      return 'JOURNEY_MEMORY_STREAK_7';
    case 'streak-21':
      return 'JOURNEY_MEMORY_STREAK_21';
    case 'streak-100':
      return 'JOURNEY_MEMORY_STREAK_100';
    case 'first-return':
      return 'JOURNEY_MEMORY_FIRST_RETURN';
    case 'practice-variety':
      return 'JOURNEY_MEMORY_PRACTICE_VARIETY';
    case 'first-lotus':
      return 'JOURNEY_MEMORY_FIRST_LOTUS';
    default:
      return 'JOURNEY_MEMORY_FIRST_PRACTICE';
  }
}

/**
 * Sort key for interleaving sittings and memories (newest first in UI).
 * @param {{ at: string }} row
 */
export function journeyTimelineSortKey(row) {
  const t = Date.parse(row.at);
  return Number.isFinite(t) ? t : 0;
}

/**
 * @param {JourneyPracticeMemory[]} memories
 * @param {string} id
 * @returns {boolean}
 */
function hasMilestone(memories, id) {
  return memories.some((m) => m.kind === 'milestone' && m.id === id);
}

/**
 * @param {JourneyPracticeMemory[]} memories
 * @param {string} dateKey
 * @returns {boolean}
 */
function hasComeBackOnDate(memories, dateKey) {
  return memories.some(
    (m) => m.kind === 'come-back' && m.dateKey === dateKey
  );
}

/**
 * @param {string} dateKey YYYY-MM-DD
 * @returns {string}
 */
function isoAtLocalNoon(dateKey) {
  return `${dateKey}T12:00:00.000Z`;
}

/**
 * @param {Iterable<string>} dayKeys
 * @param {string} endKey
 * @returns {number}
 */
function streakEndingOn(dayKeys, endKey) {
  const set = new Set(dayKeys);
  if (!set.has(endKey)) return 0;
  let streak = 0;
  let cursor = endKey;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftLocalDateKey(cursor, -1);
  }
  return streak;
}

/**
 * @param {string[]} sortedDayKeys ascending
 * @returns {{ comeBackDates: string[], firstReturnDate: string | null }}
 */
export function deriveComeBackDatesFromPracticeDays(sortedDayKeys) {
  /** @type {string[]} */
  const comeBackDates = [];
  let firstReturnDate = null;
  for (let i = 1; i < sortedDayKeys.length; i += 1) {
    const prev = sortedDayKeys[i - 1];
    const cur = sortedDayKeys[i];
    const expected = shiftLocalDateKey(prev, 1);
    if (cur === expected) continue;
    comeBackDates.push(cur);
    if (!firstReturnDate) firstReturnDate = cur;
  }
  return { comeBackDates, firstReturnDate };
}

/**
 * Idempotent backfill from practice-day / lotus history (existing users).
 *
 * @param {JourneyLogExtendedState} state
 * @param {object} deps
 * @param {PracticeDaysStore} deps.practiceDaysStore
 * @param {LotusPondStore} deps.lotusPondStore
 * @param {() => Date} deps.now
 * @returns {JourneyLogExtendedState}
 */
export function reconcileJourneyPracticeMemoriesFromHistory(state, deps) {
  const dayKeys = deps.practiceDaysStore
    .getPracticedDateKeys()
    .slice()
    .sort();
  /** @type {JourneyPracticeMemory[]} */
  let memories = state.memories?.slice() ?? [];
  let changed = false;

  if (dayKeys.length >= 1 && !hasMilestone(memories, 'first-practice')) {
    memories.push({
      kind: 'milestone',
      id: 'first-practice',
      at: isoAtLocalNoon(dayKeys[0])
    });
    changed = true;
  }

  for (const node of STREAK_MILESTONES) {
    if (hasMilestone(memories, node.id)) continue;
    let hitDate = null;
    for (const key of dayKeys) {
      if (streakEndingOn(dayKeys, key) >= node.days) {
        hitDate = key;
        break;
      }
    }
    if (hitDate) {
      memories.push({
        kind: 'milestone',
        id: node.id,
        at: isoAtLocalNoon(hitDate)
      });
      changed = true;
    }
  }

  const { comeBackDates, firstReturnDate } =
    deriveComeBackDatesFromPracticeDays(dayKeys);
  for (const dateKey of comeBackDates) {
    if (hasComeBackOnDate(memories, dateKey)) continue;
    memories.push({
      kind: 'come-back',
      id: JOURNEY_COME_BACK_ID,
      at: isoAtLocalNoon(dateKey),
      dateKey
    });
    changed = true;
  }
  if (firstReturnDate && !hasMilestone(memories, 'first-return')) {
    memories.push({
      kind: 'milestone',
      id: 'first-return',
      at: isoAtLocalNoon(firstReturnDate)
    });
    changed = true;
  }

  if (
    bloomCountForMinutes(deps.lotusPondStore.getLifetimeMinutes()) >= 1 &&
    !hasMilestone(memories, 'first-lotus')
  ) {
    memories.push({
      kind: 'milestone',
      id: 'first-lotus',
      at: deps.now().toISOString()
    });
    changed = true;
  }

  if (!changed) return state;
  return { ...state, memories };
}

/**
 * Record today's baseline practice and unlock any new Journey memories (silent).
 *
 * @param {Storage | null | undefined} storage
 * @param {object} opts
 * @param {PracticeBaselineSourceId} opts.sourceId
 * @param {PracticeDaysStore} [opts.practiceDaysStore]
 * @param {LotusPondStore} [opts.lotusPondStore]
 * @param {() => Date} [opts.now]
 * @returns {JourneyPracticeMemory[]} newly appended rows (may be empty)
 */
export function syncJourneyPracticeMemories(
  storage,
  { sourceId, practiceDaysStore, lotusPondStore, now = () => new Date() } = {}
) {
  if (!storage || !sourceId || !PRACTICE_BASELINE_SOURCE_IDS.includes(sourceId)) {
    return [];
  }

  const days =
    practiceDaysStore ??
    new PracticeDaysStore({ storage, now });
  const lotus =
    lotusPondStore ?? new LotusPondStore({ storage, now });
  const todayKey = getLocalDateKey(now());
  const at = now().toISOString();

  const initial = readJourneyLogExtended(storage);
  const initialMemoryCount = initial.memories?.length ?? 0;
  const initialSourcesSeen = normalizeJourneySourcesSeen(initial.sourcesSeen);

  let state = reconcileJourneyPracticeMemoriesFromHistory(initial, {
    practiceDaysStore: days,
    lotusPondStore: lotus,
    now
  });

  const beforeCount = state.memories?.length ?? 0;
  /** @type {JourneyPracticeMemory[]} */
  let memories = state.memories?.slice() ?? [];

  const sourcesSeen = normalizeJourneySourcesSeen(state.sourcesSeen);
  if (!sourcesSeen.includes(sourceId)) {
    sourcesSeen.push(sourceId);
  }

  const sortedDayKeys = days.getPracticedDateKeys().slice().sort();
  const todayIdx = sortedDayKeys.indexOf(todayKey);
  const isFirstPracticeDay = todayIdx <= 0;

  if (isFirstPracticeDay && !hasMilestone(memories, 'first-practice')) {
    memories.push({ kind: 'milestone', id: 'first-practice', at });
  }

  if (
    todayIdx > 0 &&
    !hasComeBackOnDate(memories, todayKey)
  ) {
    const prevKey = sortedDayKeys[todayIdx - 1];
    const expected = shiftLocalDateKey(prevKey, 1);
    if (todayKey !== expected) {
      memories.push({
        kind: 'come-back',
        id: JOURNEY_COME_BACK_ID,
        at,
        dateKey: todayKey
      });
      if (!hasMilestone(memories, 'first-return')) {
        memories.push({ kind: 'milestone', id: 'first-return', at });
      }
    }
  }

  const streak = countRecentPracticeStreak(
    days.getPracticedDateKeys(),
    todayKey
  );
  for (const node of STREAK_MILESTONES) {
    if (streak < node.days) continue;
    if (hasMilestone(memories, node.id)) continue;
    memories.push({ kind: 'milestone', id: node.id, at });
  }

  if (sourcesSeen.length >= 2 && !hasMilestone(memories, 'practice-variety')) {
    memories.push({ kind: 'milestone', id: 'practice-variety', at });
  }

  if (
    bloomCountForMinutes(lotus.getLifetimeMinutes()) >= 1 &&
    !hasMilestone(memories, 'first-lotus')
  ) {
    memories.push({ kind: 'milestone', id: 'first-lotus', at });
  }

  state = {
    ...state,
    memories,
    sourcesSeen
  };

  const memoryCountChanged = memories.length !== initialMemoryCount;
  const sourcesSeenChanged =
    sourcesSeen.length !== initialSourcesSeen.length ||
    sourcesSeen.some((id, i) => id !== initialSourcesSeen[i]);

  if (memoryCountChanged || sourcesSeenChanged) {
    writeJourneyLogExtended(storage, state);
  }

  return memories.slice(beforeCount);
}

/**
 * Read-only aggregate helper for tests / Confide (not a formula consumer).
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 */
export function readJourneyPracticeMemorySummary(storage, now = () => new Date()) {
  const state = readJourneyLogExtended(storage);
  const aggregate = resolvePracticeAggregate({ storage, now });
  return {
    memoryCount: state.memories?.length ?? 0,
    milestoneIds: (state.memories ?? [])
      .filter((m) => m.kind === 'milestone')
      .map((m) => m.id),
    sourcesSeen: state.sourcesSeen ?? [],
    practiceDayCount: aggregate.practiceDayCount
  };
}
