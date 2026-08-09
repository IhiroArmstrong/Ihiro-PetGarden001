/**
 * Buy Yin a Tea · kindness badges (ritual thank-you marks — not content unlocks).
 *
 * Paid tip: min 3. Free practice path: min 1 after first practice (requirePractice).
 * Count = f(practice days + lifetime minutes); only-grow merge.
 * Re-tip / same practice level does NOT add badges.
 */

import {
  PRACTICE_DAYS_STORAGE_KEY,
  migratePracticeDaysEntries
} from './PracticeDaysStore.js';
import {
  computePracticeBadgeTargetCount,
  mergeCatalogBadgeAwards
} from './practiceBadgeAward.js';

/** Public URL prefix for high-res PNGs (download + display). */
export const TIP_KINDNESS_BADGE_PUBLIC_DIR = '/ui/support/yin-badges';

/**
 * Catalog order = progression (simpler → richer). Max 9.
 * @type {ReadonlyArray<{ id: string, file: string }>}
 */
export const TIP_KINDNESS_BADGE_CATALOG = Object.freeze([
  {
    id: 'silver-mono',
    file: 'yin-medallion-silver-monochrome-engraved.png'
  },
  {
    id: 'silver-gold-outline',
    file: 'yin-medallion-silver-gold-outline.png'
  },
  {
    id: 'silver-gold-outline-rim',
    file: 'yin-medallion-silver-gold-outline-rim.png'
  },
  {
    id: 'silver-gold-rim',
    file: 'yin-medallion-silver-gold-rim.png'
  },
  {
    id: 'silver-gold-pendant',
    file: 'yin-medallion-silver-gold-pendant.png'
  },
  {
    id: 'gold-mono',
    file: 'yin-medallion-gold-monochrome-engraved.png'
  },
  {
    id: 'gold-silver-relief',
    file: 'yin-medallion-gold-silver-relief.png'
  },
  {
    id: 'square-gold-silver',
    file: 'yin-badge-square-gold-on-silver.png'
  },
  {
    id: 'square-gold-silver-alt',
    file: 'yin-badge-square-gold-on-silver-alt.png'
  }
]);

const CATALOG_BY_ID = new Map(
  TIP_KINDNESS_BADGE_CATALOG.map((b) => [b.id, b])
);

export const TIP_KINDNESS_BADGE_MIN = 3;
export const TIP_KINDNESS_BADGE_FREE_MIN = 1;
export const TIP_KINDNESS_BADGE_MAX = TIP_KINDNESS_BADGE_CATALOG.length;

/**
 * @param {string} file
 * @returns {string}
 */
export function tipKindnessBadgeSrc(file) {
  return `${TIP_KINDNESS_BADGE_PUBLIC_DIR}/${file}`;
}

/**
 * @param {string} id
 * @returns {{ id: string, file: string } | null}
 */
export function getTipKindnessBadgeById(id) {
  return CATALOG_BY_ID.get(String(id || '')) || null;
}

/**
 * @param {unknown} rawIds
 * @returns {string[]}
 */
export function normalizeTipBadgeIds(rawIds) {
  if (!Array.isArray(rawIds)) return [];
  /** @type {string[]} */
  const out = [];
  const seen = new Set();
  for (const entry of TIP_KINDNESS_BADGE_CATALOG) {
    if (!rawIds.includes(entry.id)) continue;
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    out.push(entry.id);
  }
  return out;
}

/**
 * @param {{ date: string, totalMinutes: number | null }[]} days
 * @returns {{ practiceDayCount: number, lifetimeMinutes: number }}
 */
export function summarizePracticeDaysForBadges(days) {
  if (!Array.isArray(days)) {
    return { practiceDayCount: 0, lifetimeMinutes: 0 };
  }
  let practiceDayCount = 0;
  let lifetimeMinutes = 0;
  for (const row of days) {
    if (!row || typeof row !== 'object') continue;
    const mins = row.totalMinutes;
    const practiced =
      mins === null ||
      (typeof mins === 'number' && Number.isFinite(mins) && mins > 0);
    if (!practiced) continue;
    practiceDayCount += 1;
    if (typeof mins === 'number' && Number.isFinite(mins) && mins > 0) {
      lifetimeMinutes += mins;
    }
  }
  return { practiceDayCount, lifetimeMinutes };
}

/**
 * Target badge count for a tip (paid) event — floor 3.
 *
 * @param {{ practiceDayCount?: number, lifetimeMinutes?: number }} summary
 * @returns {number}
 */
export function computeTipBadgeTargetCount(summary = {}) {
  return computePracticeBadgeTargetCount(summary, {
    min: TIP_KINDNESS_BADGE_MIN,
    max: TIP_KINDNESS_BADGE_MAX,
    requirePractice: false
  });
}

/**
 * Free practice path — floor 1 only after practice exists.
 *
 * @param {{ practiceDayCount?: number, lifetimeMinutes?: number }} summary
 * @returns {number}
 */
export function computeFreePracticeBadgeTargetCount(summary = {}) {
  return computePracticeBadgeTargetCount(summary, {
    min: TIP_KINDNESS_BADGE_FREE_MIN,
    max: TIP_KINDNESS_BADGE_MAX,
    requirePractice: true
  });
}

/**
 * Only-grow merge: take the first N catalog ids where
 * N = max(alreadyOwnedInCatalogOrder, targetCount).
 *
 * @param {string[]} prevIds
 * @param {number} targetCount
 * @returns {{ badgeIds: string[], newlyAddedIds: string[] }}
 */
export function mergeTipBadgeAwards(prevIds, targetCount) {
  return mergeCatalogBadgeAwards(
    TIP_KINDNESS_BADGE_CATALOG,
    prevIds,
    targetCount,
    normalizeTipBadgeIds
  );
}

/**
 * Read practice-days entries from the same storage tip uses.
 * @param {Storage | null | undefined} storage
 * @returns {{ date: string, totalMinutes: number | null }[]}
 */
export function readPracticeDaysForTipBadges(storage) {
  if (!storage) return [];
  try {
    const raw = storage.getItem(PRACTICE_DAYS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.days)) return [];
    return migratePracticeDaysEntries(parsed.days).days;
  } catch {
    return [];
  }
}

/**
 * Compute award merge from current practice + previous tip badges.
 * @param {Storage | null | undefined} storage
 * @param {string[]} [prevBadgeIds]
 * @param {{ mode?: 'paid' | 'free' }} [opts]
 */
export function planTipBadgeAward(
  storage,
  prevBadgeIds = [],
  { mode = 'paid' } = {}
) {
  const summary = summarizePracticeDaysForBadges(
    readPracticeDaysForTipBadges(storage)
  );
  const targetCount =
    mode === 'free'
      ? computeFreePracticeBadgeTargetCount(summary)
      : computeTipBadgeTargetCount(summary);
  const merge = mergeTipBadgeAwards(prevBadgeIds, targetCount);
  return { summary, targetCount, ...merge };
}
