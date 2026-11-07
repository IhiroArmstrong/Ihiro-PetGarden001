/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T81 S1 · per-week integer counters (R-03). No free text.
 */

import {
  clampResearchCount,
  CO_PRACTICE_RESEARCH_COUNT_CAPS,
  isCoPracticeResearchRouteClass
} from './coPracticeResearchEnums.js';
import { formatIsoWeekLocal } from './coPracticeResearchIsoWeek.js';

export const CO_PRACTICE_RESEARCH_WEEK_LEDGER_KEY =
  'focus-tiger.co-practice-research-week-ledger.v1';

/**
 * @typedef {{
 *   confideOpened?: number,
 *   sitWithYin?: number,
 *   route?: Record<string, number>
 * }} CoPracticeResearchWeekBucket
 *
 * @typedef {{ weeks: Record<string, CoPracticeResearchWeekBucket> }} CoPracticeResearchWeekLedger
 */

function resolveStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} raw
 * @returns {CoPracticeResearchWeekLedger}
 */
export function normalizeCoPracticeResearchWeekLedger(raw) {
  if (!raw || typeof raw !== 'object') return { weeks: {} };
  const weeksRaw = /** @type {Record<string, unknown>} */ (raw).weeks;
  if (!weeksRaw || typeof weeksRaw !== 'object') return { weeks: {} };
  /** @type {Record<string, CoPracticeResearchWeekBucket>} */
  const weeks = {};
  for (const [weekKey, bucket] of Object.entries(weeksRaw)) {
    if (!bucket || typeof bucket !== 'object') continue;
    const b = /** @type {Record<string, unknown>} */ (bucket);
    /** @type {CoPracticeResearchWeekBucket} */
    const next = {};
    if (typeof b.confideOpened === 'number') {
      next.confideOpened = clampResearchCount(
        b.confideOpened,
        CO_PRACTICE_RESEARCH_COUNT_CAPS.companion
      );
    }
    if (typeof b.sitWithYin === 'number') {
      next.sitWithYin = clampResearchCount(
        b.sitWithYin,
        CO_PRACTICE_RESEARCH_COUNT_CAPS.sitWithYin
      );
    }
    if (b.route && typeof b.route === 'object') {
      /** @type {Record<string, number>} */
      const route = {};
      for (const [k, v] of Object.entries(
        /** @type {Record<string, unknown>} */ (b.route)
      )) {
        if (!isCoPracticeResearchRouteClass(k)) continue;
        route[k] = clampResearchCount(v, CO_PRACTICE_RESEARCH_COUNT_CAPS.companion);
      }
      if (Object.keys(route).length) next.route = route;
    }
    weeks[weekKey] = next;
  }
  return { weeks };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readCoPracticeResearchWeekLedger(storage) {
  const store = resolveStorage(storage);
  if (!store) return { weeks: {} };
  try {
    const raw = store.getItem(CO_PRACTICE_RESEARCH_WEEK_LEDGER_KEY);
    if (!raw) return { weeks: {} };
    return normalizeCoPracticeResearchWeekLedger(JSON.parse(raw));
  } catch {
    return { weeks: {} };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {CoPracticeResearchWeekLedger} ledger
 */
export function writeCoPracticeResearchWeekLedger(storage, ledger) {
  const store = resolveStorage(storage);
  if (!store) return;
  try {
    store.setItem(
      CO_PRACTICE_RESEARCH_WEEK_LEDGER_KEY,
      JSON.stringify(normalizeCoPracticeResearchWeekLedger(ledger))
    );
  } catch {
    /* quota */
  }
}

/**
 * @param {CoPracticeResearchWeekLedger} ledger
 * @param {string} weekKey
 */
function ensureWeekBucket(ledger, weekKey) {
  if (!ledger.weeks[weekKey]) ledger.weeks[weekKey] = {};
  return ledger.weeks[weekKey];
}

/**
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 */
export function noteCoPracticeResearchConfideOpened(storage, now = () => new Date()) {
  const store = resolveStorage(storage);
  if (!store) return;
  const weekKey = formatIsoWeekLocal(now());
  const ledger = readCoPracticeResearchWeekLedger(store);
  const bucket = ensureWeekBucket(ledger, weekKey);
  bucket.confideOpened = clampResearchCount(
    (bucket.confideOpened || 0) + 1,
    CO_PRACTICE_RESEARCH_COUNT_CAPS.companion
  );
  writeCoPracticeResearchWeekLedger(store, ledger);
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string | null | undefined} routeClass
 * @param {() => Date} [now]
 */
export function noteCoPracticeResearchRouteClass(storage, routeClass, now = () => new Date()) {
  if (!isCoPracticeResearchRouteClass(routeClass)) return;
  const store = resolveStorage(storage);
  if (!store) return;
  const weekKey = formatIsoWeekLocal(now());
  const ledger = readCoPracticeResearchWeekLedger(store);
  const bucket = ensureWeekBucket(ledger, weekKey);
  if (!bucket.route) bucket.route = {};
  bucket.route[routeClass] = clampResearchCount(
    (bucket.route[routeClass] || 0) + 1,
    CO_PRACTICE_RESEARCH_COUNT_CAPS.companion
  );
  writeCoPracticeResearchWeekLedger(store, ledger);
}

/**
 * No production sitWithYin key yet — call only when instrumentation lands.
 *
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 */
export function noteCoPracticeResearchSitWithYin(storage, now = () => new Date()) {
  const store = resolveStorage(storage);
  if (!store) return;
  const weekKey = formatIsoWeekLocal(now());
  const ledger = readCoPracticeResearchWeekLedger(store);
  const bucket = ensureWeekBucket(ledger, weekKey);
  bucket.sitWithYin = clampResearchCount(
    (bucket.sitWithYin || 0) + 1,
    CO_PRACTICE_RESEARCH_COUNT_CAPS.sitWithYin
  );
  writeCoPracticeResearchWeekLedger(store, ledger);
}
