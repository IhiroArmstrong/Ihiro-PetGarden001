/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Practice Imprint (修行纪念印) — cumulative lifetime-minute badges.
 *
 * SSOT thresholds: `MILESTONE_CATALOG` imprint surface rows (`lifetime-minutes-at-least`).
 * Brief: `docs/task-briefs/task-practice-imprint-badges.md`.
 */

import {
  getMilestoneCatalogEntry,
  isCatalogMilestoneMet,
  listMilestoneCatalogIdsForImprint
} from './MILESTONE_CATALOG.js';
import {
  buildCollectionsScarcityEvaluationContext,
  COLLECTIONS_SCARCITY_NAME_KEYS
} from './collectionsBehavioralScarcity.js';
import { resolvePracticeAggregate } from './practiceAggregate.js';
import {
  MUSTARD_SEED_SEAL_BADGE_FILE,
  MUSTARD_SEED_SEAL_BADGE_PUBLIC_DIR
} from './mustardSeedSeal.js';

export const PRACTICE_IMPRINT_STORAGE_KEY = 'focus-tiger.practice-imprint.v1';

/** Body class toggled while the practice imprint card is open. */
export const PRACTICE_IMPRINT_BODY_CLASS = 'ft-practice-imprint-open';

/** @type {readonly string[]} */
export const PRACTICE_IMPRINT_CATALOG_IDS = Object.freeze(
  listMilestoneCatalogIdsForImprint()
);

/** Reuse scarcity memorial name keys — no parallel minute table. */
export const PRACTICE_IMPRINT_NAME_KEYS = Object.freeze(
  Object.fromEntries(
    PRACTICE_IMPRINT_CATALOG_IDS.map((id) => [id, COLLECTIONS_SCARCITY_NAME_KEYS[id]])
  )
);

/**
 * @typedef {{
 *   awardedIds: string[],
 *   revealedIds: string[],
 *   awardedAt: Readonly<Record<string, string>>
 * }} PracticeImprintState
 */

/**
 * @returns {PracticeImprintState}
 */
function emptyPracticeImprintState() {
  return { awardedIds: [], revealedIds: [], awardedAt: {} };
}

/**
 * @param {string} catalogId
 * @returns {boolean}
 */
function isPracticeImprintCatalogId(catalogId) {
  return PRACTICE_IMPRINT_CATALOG_IDS.includes(catalogId);
}

/**
 * @param {PracticeImprintState} state
 * @returns {string[]}
 */
function sortPracticeImprintIds(state) {
  const order = new Map(
    PRACTICE_IMPRINT_CATALOG_IDS.map((id, index) => [id, index])
  );
  return [...state.awardedIds].sort(
    (a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99)
  );
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {PracticeImprintState}
 */
export function readPracticeImprintState(storage) {
  if (!storage) return emptyPracticeImprintState();
  try {
    const raw = storage.getItem(PRACTICE_IMPRINT_STORAGE_KEY);
    if (!raw) return emptyPracticeImprintState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyPracticeImprintState();
    const awardedIds = Array.isArray(parsed.awardedIds)
      ? parsed.awardedIds.filter(isPracticeImprintCatalogId)
      : [];
    const revealedIds = Array.isArray(parsed.revealedIds)
      ? parsed.revealedIds.filter((id) => awardedIds.includes(id))
      : [];
    const awardedAt =
      parsed.awardedAt && typeof parsed.awardedAt === 'object'
        ? Object.fromEntries(
            Object.entries(parsed.awardedAt).filter(
              ([id, value]) =>
                isPracticeImprintCatalogId(id) && typeof value === 'string'
            )
          )
        : {};
    return { awardedIds, revealedIds, awardedAt };
  } catch {
    return emptyPracticeImprintState();
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {PracticeImprintState} state
 */
function persistPracticeImprintState(storage, state) {
  try {
    storage?.setItem(PRACTICE_IMPRINT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearPracticeImprintState(storage) {
  try {
    storage?.removeItem(PRACTICE_IMPRINT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * @param {string} catalogId
 * @returns {number}
 */
export function practiceImprintMinutesThreshold(catalogId) {
  const entry = getMilestoneCatalogEntry(catalogId);
  if (!entry || entry.predicate.type !== 'lifetime-minutes-at-least') return 0;
  return Math.max(0, Math.floor(Number(entry.predicate.minutes) || 0));
}

/**
 * @param {string} [file]
 * @returns {string}
 */
export function practiceImprintBadgeSrc(
  file = MUSTARD_SEED_SEAL_BADGE_FILE
) {
  return `${MUSTARD_SEED_SEAL_BADGE_PUBLIC_DIR}/${file}`;
}

/**
 * @param {Date} date
 * @param {string} locale
 * @returns {string}
 */
export function formatPracticeImprintSeasonPhrase(date, locale) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const seasonZh = month < 3 ? '冬' : month < 6 ? '春' : month < 9 ? '夏' : '秋';
  if (locale === 'zh') return `始于 ${year} 年${seasonZh}`;
  if (locale === 'ja') return `${year}年${seasonZh}より`;
  const seasonEn =
    month < 3 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall';
  return `Since ${seasonEn} ${year}`;
}

/**
 * @param {PracticeImprintState} state
 * @returns {string | null}
 */
export function nextUnrevealedPracticeImprintId(state) {
  const awarded = sortPracticeImprintIds(state);
  return awarded.find((id) => !state.revealedIds.includes(id)) ?? null;
}

/**
 * Award newly met imprint tiers (monotonic; never revokes).
 * @param {Storage | null | undefined} storage
 * @param {import('./MILESTONE_CATALOG.js').MilestoneEvaluationContext} [context]
 * @param {() => Date} [now]
 * @returns {{ state: PracticeImprintState, newlyAwardedIds: string[] }}
 */
export function syncPracticeImprintAwards(storage, context, now = () => new Date()) {
  const prev = readPracticeImprintState(storage);
  const awarded = new Set(prev.awardedIds);
  const awardedAt = { ...prev.awardedAt };
  /** @type {string[]} */
  const newlyAwardedIds = [];
  for (const catalogId of PRACTICE_IMPRINT_CATALOG_IDS) {
    if (awarded.has(catalogId)) continue;
    if (!isCatalogMilestoneMet(catalogId, context)) continue;
    awarded.add(catalogId);
    awardedAt[catalogId] = now().toISOString();
    newlyAwardedIds.push(catalogId);
  }
  const state = {
    awardedIds: sortPracticeImprintIds({ awardedIds: [...awarded], revealedIds: prev.revealedIds, awardedAt }),
    revealedIds: prev.revealedIds,
    awardedAt
  };
  if (newlyAwardedIds.length) persistPracticeImprintState(storage, state);
  return { state, newlyAwardedIds };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} catalogId
 * @returns {PracticeImprintState}
 */
export function markPracticeImprintRevealed(storage, catalogId) {
  if (!isPracticeImprintCatalogId(catalogId)) {
    return readPracticeImprintState(storage);
  }
  const prev = readPracticeImprintState(storage);
  if (!prev.awardedIds.includes(catalogId)) return prev;
  const revealedIds = [...new Set([...prev.revealedIds, catalogId])];
  const state = { ...prev, revealedIds };
  persistPracticeImprintState(storage, state);
  return state;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{
 *   storage?: Storage | null,
 *   now?: () => Date,
 *   practiceDaysStore?: import('./PracticeDaysStore.js').PracticeDaysStore,
 *   lotusPondStore?: import('./LotusPondStore.js').LotusPondStore,
 *   dailyCompletionStore?: import('./DailyCompletionStore.js').DailyCompletionStore
 * }} [deps]
 */
export function resolvePracticeImprint(storage, deps = {}) {
  const aggregate = resolvePracticeAggregate({ storage, ...deps });
  const context = buildCollectionsScarcityEvaluationContext(aggregate, {
    storage,
    ...deps
  });
  const { state, newlyAwardedIds } = syncPracticeImprintAwards(
    storage,
    context,
    deps.now
  );
  const nextCatalogId = nextUnrevealedPracticeImprintId(state);
  const nextEntry = nextCatalogId
    ? getMilestoneCatalogEntry(nextCatalogId)
    : null;
  return {
    aggregate,
    context,
    state,
    newlyAwardedIds,
    nextCatalogId,
    nextEntry,
    shouldAutoReveal: nextCatalogId != null,
    menuEntries: PRACTICE_IMPRINT_CATALOG_IDS.map((catalogId) => ({
      catalogId,
      nameKey: PRACTICE_IMPRINT_NAME_KEYS[catalogId],
      minutesThreshold: practiceImprintMinutesThreshold(catalogId),
      awarded: state.awardedIds.includes(catalogId),
      revealed: state.revealedIds.includes(catalogId),
      unlocked: isCatalogMilestoneMet(catalogId, context),
      awardedAt: state.awardedAt[catalogId] ?? null
    }))
  };
}

/**
 * @param {{
 *   completed?: boolean,
 *   shouldAutoReveal?: boolean
 * }} opts
 * @returns {boolean}
 */
export function shouldOfferPracticeImprintAfterCeremony(opts = {}) {
  return opts.completed === true && opts.shouldAutoReveal === true;
}
