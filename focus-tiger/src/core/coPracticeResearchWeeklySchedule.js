/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T81 S5 — weekly upload window: Monday 00:00 local + deterministic 0–24h jitter;
 * defer POST while scene overlay is busy (Arrival / Honesty / Reflection path).
 */

import {
  formatIsoWeekLocal,
  localWeekBoundsFromKey
} from './coPracticeResearchIsoWeek.js';
import {
  hasCoPracticeResearchConsent,
  readCoPracticeResearchConsent
} from './coPracticeResearchConsent.js';
import { shouldPostCoPracticeResearchIngest } from './coPracticeResearchUpload.js';

export const CO_PRACTICE_RESEARCH_WEEKLY_SCHEDULE_KEY =
  'focus-tiger.co-practice-research-weekly-schedule.v1';

/** Same backoff as taste-layer boot when ceremony overlays are up. */
export const CO_PRACTICE_RESEARCH_UPLOAD_OVERLAY_RETRY_MS = 1000;

const MS_PER_DAY = 86_400_000;
const MS_JITTER_CAP = 24 * 60 * 60 * 1000;

/**
 * @param {string} studyId
 * @param {string} weekKey
 */
export function weeklyUploadJitterMs(studyId, weekKey) {
  const s = `${String(studyId || '')}\0${String(weekKey || '')}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % MS_JITTER_CAP;
}

/**
 * @param {string} studyId
 * @param {string} weekKey
 * @param {Date} [anchor]
 */
export function weeklyUploadTargetMs(studyId, weekKey, anchor = new Date()) {
  const { startMs } = localWeekBoundsFromKey(weekKey, anchor);
  return startMs + weeklyUploadJitterMs(studyId, weekKey);
}

/**
 * @param {unknown} raw
 * @returns {{ lastPostedWeek: string | null }}
 */
export function normalizeWeeklyScheduleState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { lastPostedWeek: null };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const lastPostedWeek =
    typeof o.lastPostedWeek === 'string' && /^(\d{4})-W(\d{2})$/.test(o.lastPostedWeek)
      ? o.lastPostedWeek
      : null;
  return { lastPostedWeek };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readWeeklyScheduleState(storage) {
  if (!storage) return normalizeWeeklyScheduleState(null);
  try {
    const raw = storage.getItem(CO_PRACTICE_RESEARCH_WEEKLY_SCHEDULE_KEY);
    if (!raw) return normalizeWeeklyScheduleState(null);
    return normalizeWeeklyScheduleState(JSON.parse(raw));
  } catch {
    return normalizeWeeklyScheduleState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} weekKey
 */
export function markCoPracticeResearchWeekPosted(storage, weekKey) {
  if (!storage || !weekKey) return;
  const next = { lastPostedWeek: weekKey };
  try {
    storage.setItem(CO_PRACTICE_RESEARCH_WEEKLY_SCHEDULE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearCoPracticeResearchWeeklySchedule(storage) {
  if (!storage) return;
  try {
    storage.removeItem(CO_PRACTICE_RESEARCH_WEEKLY_SCHEDULE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} weekKey
 */
export function hasPostedCoPracticeResearchWeek(storage, weekKey) {
  const state = readWeeklyScheduleState(storage);
  return state.lastPostedWeek === weekKey;
}

/**
 * Ms until next ISO week's upload target (after current week already posted).
 *
 * @param {Date} now
 * @param {string} studyId
 */
export function msUntilNextWeeklyUploadWindow(now, studyId) {
  const current = formatIsoWeekLocal(now);
  const { endMs } = localWeekBoundsFromKey(current, now);
  const nextMonday = new Date(endMs + 1);
  const nextKey = formatIsoWeekLocal(nextMonday);
  const target = weeklyUploadTargetMs(studyId, nextKey, nextMonday);
  const delay = target - now.getTime();
  return delay > 0 ? delay : CO_PRACTICE_RESEARCH_UPLOAD_OVERLAY_RETRY_MS;
}

/**
 * @param {object} input
 * @param {boolean} input.overlayBusy
 * @param {Storage | null | undefined} [input.storage]
 * @param {Date} [input.now]
 * @param {string | null} [input.studyId]
 */
export function nextCoPracticeResearchUploadDelayMs({
  overlayBusy,
  storage,
  now = new Date(),
  studyId
} = {}) {
  if (overlayBusy) return CO_PRACTICE_RESEARCH_UPLOAD_OVERLAY_RETRY_MS;
  const id =
    studyId ??
    (hasCoPracticeResearchConsent(storage)
      ? readCoPracticeResearchConsent(storage).studyId
      : null);
  if (!id) return MS_PER_DAY;
  const weekKey = formatIsoWeekLocal(now);
  if (hasPostedCoPracticeResearchWeek(storage, weekKey)) {
    return msUntilNextWeeklyUploadWindow(now, id);
  }
  const target = weeklyUploadTargetMs(id, weekKey, now);
  const remaining = target - now.getTime();
  if (remaining > 0) return remaining;
  return 0;
}

/**
 * @param {object} opts
 * @param {() => boolean} opts.isOverlayBusy
 * @param {typeof nextCoPracticeResearchUploadDelayMs} [opts.nextDelayMs]
 * @param {(fn: () => void, ms: number) => unknown} opts.schedule
 * @param {() => Promise<{ ok?: boolean; skipped?: boolean; reason?: string }>} opts.runUpload
 * @param {Storage | null | undefined} [opts.storage]
 * @param {() => boolean} [opts.isAllowed]
 */
export function createCoPracticeResearchUploadScheduler({
  isOverlayBusy,
  nextDelayMs = nextCoPracticeResearchUploadDelayMs,
  schedule,
  runUpload,
  storage = globalThis.localStorage,
  isAllowed = () => shouldPostCoPracticeResearchIngest({ storage })
}) {
  /** @type {ReturnType<typeof schedule> | null} */
  let pending = null;

  function clearPending() {
    if (pending != null && typeof clearTimeout === 'function') {
      clearTimeout(/** @type {ReturnType<typeof setTimeout>} */ (pending));
    }
    pending = null;
  }

  async function tick() {
    clearPending();
    if (!isAllowed()) return;
    const consent = readCoPracticeResearchConsent(storage);
    const studyId = consent.studyId;
    if (!studyId) return;

    const delayMs = nextDelayMs({
      overlayBusy: isOverlayBusy(),
      storage,
      now: new Date(),
      studyId
    });

    if (delayMs > 0) {
      pending = schedule(() => {
        void tick();
      }, delayMs);
      return;
    }

    const weekKey = formatIsoWeekLocal(new Date());
    const result = await runUpload();
    if (result?.ok) {
      markCoPracticeResearchWeekPosted(storage, weekKey);
    }
    pending = schedule(() => {
      void tick();
    }, msUntilNextWeeklyUploadWindow(new Date(), studyId));
  }

  function start() {
    void tick();
  }

  function stop() {
    clearPending();
  }

  return { start, stop, tickForTests: tick };
}
