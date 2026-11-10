/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Cloud restore merge (T93 D1). Local remains authoritative: union by id/day,
 * never delete a local key because the cloud snapshot has null.
 */

import {
  JOURNEY_LOG_MAX_ENTRIES,
  normalizeJourneyLogState
} from '../journeyLogGate.js';
import {
  migratePracticeDaysEntries,
  PRACTICE_DAYS_MAX_ENTRIES
} from '../PracticeDaysStore.js';
import { normalizeMilestoneGlowState } from '../MilestoneGlowStore.js';
import { normalizeOwnershipState } from '../entitlement/entitlementOwnership.js';
import {
  normalizeRitualCompletionState,
  RITUAL_COMPLETION_MAX_ENTRIES
} from '../RitualCompletionStore.js';
import { normalizeLotusPondState } from '../LotusPondStore.js';

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {unknown}
 */
function richerObject(a, b) {
  const aKeys = a && typeof a === 'object' ? Object.keys(a).length : 0;
  const bKeys = b && typeof b === 'object' ? Object.keys(b).length : 0;
  return bKeys > aKeys ? b : a;
}

/**
 * @param {unknown} localVal
 * @param {unknown} cloudVal
 */
function mergeJourneyLog(localVal, cloudVal) {
  const local = normalizeJourneyLogState(localVal);
  const cloud = normalizeJourneyLogState(cloudVal);
  /** @type {Map<string, Record<string, unknown>>} */
  const byAt = new Map();
  for (const row of [...local.entries, ...cloud.entries]) {
    if (!row?.at) continue;
    const prev = byAt.get(row.at);
    if (!prev) {
      byAt.set(row.at, { ...row });
      continue;
    }
    byAt.set(row.at, {
      ...prev,
      minutes: Math.max(Number(prev.minutes) || 0, Number(row.minutes) || 0),
      arrive: Boolean(prev.arrive || row.arrive),
      reflect: Boolean(prev.reflect || row.reflect),
      ...(prev.insightSpark === true || row.insightSpark === true
        ? { insightSpark: true }
        : {})
    });
  }
  const entries = [...byAt.values()]
    .sort((a, b) => String(a.at).localeCompare(String(b.at)))
    .slice(-JOURNEY_LOG_MAX_ENTRIES);
  /** @type {Record<string, unknown>} */
  const out = { entries };
  const localObj =
    localVal && typeof localVal === 'object'
      ? /** @type {Record<string, unknown>} */ (localVal)
      : {};
  const cloudObj =
    cloudVal && typeof cloudVal === 'object'
      ? /** @type {Record<string, unknown>} */ (cloudVal)
      : {};
  const memories = [
    ...(Array.isArray(localObj.memories) ? localObj.memories : []),
    ...(Array.isArray(cloudObj.memories) ? cloudObj.memories : [])
  ];
  if (memories.length) {
    const seen = new Set();
    out.memories = memories.filter((row) => {
      if (!row || typeof row !== 'object') return false;
      const id = /** @type {{ id?: unknown }} */ (row).id;
      const key = typeof id === 'string' && id ? id : JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const sources = [
    ...(Array.isArray(localObj.sourcesSeen) ? localObj.sourcesSeen : []),
    ...(Array.isArray(cloudObj.sourcesSeen) ? cloudObj.sourcesSeen : [])
  ].filter((s) => typeof s === 'string');
  if (sources.length) out.sourcesSeen = [...new Set(sources)];
  return out;
}

/**
 * @param {unknown} localVal
 * @param {unknown} cloudVal
 */
function mergePracticeDays(localVal, cloudVal) {
  const localDays =
    localVal && typeof localVal === 'object'
      ? /** @type {{ days?: unknown }} */ (localVal).days
      : [];
  const cloudDays =
    cloudVal && typeof cloudVal === 'object'
      ? /** @type {{ days?: unknown }} */ (cloudVal).days
      : [];
  const localMigrated = migratePracticeDaysEntries(localDays).days;
  const cloudMigrated = migratePracticeDaysEntries(cloudDays).days;
  /** @type {Map<string, number | null>} */
  const byDate = new Map();
  for (const row of [...localMigrated, ...cloudMigrated]) {
    const prev = byDate.get(row.date);
    if (prev === undefined) {
      byDate.set(row.date, row.totalMinutes);
      continue;
    }
    if (prev == null && row.totalMinutes == null) continue;
    if (prev == null) {
      byDate.set(row.date, row.totalMinutes);
      continue;
    }
    if (row.totalMinutes == null) continue;
    byDate.set(row.date, Math.max(prev, row.totalMinutes));
  }
  const days = [...byDate.entries()]
    .map(([date, totalMinutes]) => ({ date, totalMinutes }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-PRACTICE_DAYS_MAX_ENTRIES);
  return { days };
}

/**
 * @param {unknown} localVal
 * @param {unknown} cloudVal
 */
function mergeMilestoneGlow(localVal, cloudVal) {
  const local = normalizeMilestoneGlowState(localVal);
  const cloud = normalizeMilestoneGlowState(cloudVal);
  /** @type {Map<string, import('../MilestoneGlowStore.js').MilestoneGlowRecord>} */
  const byId = new Map();
  for (const record of [...local.records, ...cloud.records]) {
    const prev = byId.get(record.id);
    byId.set(record.id, prev ? richerObject(prev, record) : record);
  }
  return { records: [...byId.values()] };
}

/**
 * @param {unknown} localVal
 * @param {unknown} cloudVal
 */
function mergeOwnership(localVal, cloudVal) {
  const local = normalizeOwnershipState(localVal);
  const cloud = normalizeOwnershipState(cloudVal);
  /** @type {Record<string, import('../entitlement/entitlementOwnership.js').OwnershipRecord>} */
  const owned = { ...local.owned };
  for (const [key, record] of Object.entries(cloud.owned)) {
    const prev = owned[key];
    if (!prev) {
      owned[key] = record;
      continue;
    }
    const prevAt = prev.at || '';
    const nextAt = record.at || '';
    const at =
      prevAt && nextAt
        ? prevAt <= nextAt
          ? prevAt
          : nextAt
        : prevAt || nextAt;
    owned[key] = {
      at,
      meta: prev.meta || record.meta
    };
  }
  return { owned };
}

/**
 * @param {unknown} localVal
 * @param {unknown} cloudVal
 */
function mergeRitualCompletions(localVal, cloudVal) {
  const local = normalizeRitualCompletionState(localVal);
  const cloud = normalizeRitualCompletionState(cloudVal);
  /** @type {Map<string, import('../RitualCompletionStore.js').RitualCompletionEntry>} */
  const byId = new Map();
  for (const row of [...local.entries, ...cloud.entries]) {
    const key = `${row.ritualId}\0${row.at}`;
    const prev = byId.get(key);
    byId.set(key, prev ? richerObject(prev, row) : row);
  }
  return {
    entries: [...byId.values()]
      .sort((a, b) => String(a.at).localeCompare(String(b.at)))
      .slice(-RITUAL_COMPLETION_MAX_ENTRIES)
  };
}

/**
 * @param {unknown} localVal
 * @param {unknown} cloudVal
 */
function mergeMustardSeed(localVal, cloudVal) {
  const local =
    localVal && typeof localVal === 'object'
      ? /** @type {Record<string, unknown>} */ (localVal)
      : {};
  const cloud =
    cloudVal && typeof cloudVal === 'object'
      ? /** @type {Record<string, unknown>} */ (cloudVal)
      : {};
  const localIds = Array.isArray(local.revealedCaseIds)
    ? local.revealedCaseIds.filter((id) => typeof id === 'string')
    : [];
  const cloudIds = Array.isArray(cloud.revealedCaseIds)
    ? cloud.revealedCaseIds.filter((id) => typeof id === 'string')
    : [];
  const revealedCaseIds = [...new Set([...localIds, ...cloudIds])];
  const revealed =
    local.revealed === true || cloud.revealed === true || revealedCaseIds.length > 0;
  const times = [local.revealedAt, cloud.revealedAt].filter(
    (v) => typeof v === 'string' && v
  );
  times.sort();
  const scores = [local.scoreAtReveal, cloud.scoreAtReveal]
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n));
  return {
    revealed,
    revealedAt: times[0] ?? null,
    scoreAtReveal: scores.length ? Math.max(...scores) : null,
    revealedCaseIds,
    lastShownCaseId:
      (typeof local.lastShownCaseId === 'string' && local.lastShownCaseId) ||
      (typeof cloud.lastShownCaseId === 'string' && cloud.lastShownCaseId) ||
      null
  };
}

/**
 * @param {unknown} localVal
 * @param {unknown} cloudVal
 */
function mergeLotusPond(localVal, cloudVal) {
  const local = normalizeLotusPondState(localVal);
  const cloud = normalizeLotusPondState(cloudVal);
  const lifetimeMinutes = Math.max(local.lifetimeMinutes, cloud.lifetimeMinutes);
  const scoreEligibleLifetimeMinutes = Math.max(
    local.scoreEligibleLifetimeMinutes,
    cloud.scoreEligibleLifetimeMinutes
  );
  const richer =
    cloud.lifetimeMinutes > local.lifetimeMinutes ? cloud : local;
  return {
    lifetimeMinutes,
    scoreEligibleLifetimeMinutes,
    scoreCapDayKey: richer.scoreCapDayKey,
    scoreCapDayEligibleMinutes: Math.max(
      local.scoreCapDayEligibleMinutes,
      cloud.scoreCapDayEligibleMinutes
    )
  };
}

/**
 * Merge one cloud whitelist store. Cloud `null` keeps the local value.
 *
 * @param {string} storeKey
 * @param {unknown} localVal
 * @param {unknown} cloudVal
 * @returns {unknown | null}
 */
export function mergePracticeBackupCloudStoreValue(storeKey, localVal, cloudVal) {
  if (cloudVal == null) return localVal ?? null;
  if (localVal == null) return cloudVal;
  switch (storeKey) {
    case 'focus-tiger.journey-log.v1':
      return mergeJourneyLog(localVal, cloudVal);
    case 'focus-tiger.practice-days.v1':
      return mergePracticeDays(localVal, cloudVal);
    case 'focus-tiger.milestone-glow.v1':
      return mergeMilestoneGlow(localVal, cloudVal);
    case 'focus-tiger.entitlement-ownership.v1':
      return mergeOwnership(localVal, cloudVal);
    case 'focus-tiger.ritual-completions.v1':
      return mergeRitualCompletions(localVal, cloudVal);
    case 'focus-tiger.mustard-seed-seal.v1':
      return mergeMustardSeed(localVal, cloudVal);
    case 'focus-tiger.lotus-pond.v1':
      return mergeLotusPond(localVal, cloudVal);
    default:
      return richerObject(localVal, cloudVal);
  }
}
