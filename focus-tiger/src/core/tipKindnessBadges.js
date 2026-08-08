/**
 * Buy Yin a Tea · kindness badges (ritual thank-you marks — not content unlocks).
 *
 * Awarded only when tip status is written (checkout return / email restore).
 * Count = f(practice days + lifetime minutes), clamped 3–9.
 * Re-tip with the same practice level does NOT add badges (only-grow).
 */

import {
  PRACTICE_DAYS_STORAGE_KEY,
  migratePracticeDaysEntries
} from './PracticeDaysStore.js';

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
      mins === null || (typeof mins === 'number' && Number.isFinite(mins) && mins > 0);
    if (!practiced) continue;
    practiceDayCount += 1;
    if (typeof mins === 'number' && Number.isFinite(mins) && mins > 0) {
      lifetimeMinutes += mins;
    }
  }
  return { practiceDayCount, lifetimeMinutes };
}

/**
 * Target badge count for a tip event.
 * No practice → 3. Else 3 + floor(score/3), clamped to [3, 9].
 * score = practiceDayCount + floor(lifetimeMinutes / 60).
 *
 * @param {{ practiceDayCount?: number, lifetimeMinutes?: number }} summary
 * @returns {number}
 */
export function computeTipBadgeTargetCount(summary = {}) {
  const days = Math.max(0, Math.floor(Number(summary.practiceDayCount) || 0));
  const minutes = Math.max(0, Number(summary.lifetimeMinutes) || 0);
  if (days <= 0 && minutes <= 0) return TIP_KINDNESS_BADGE_MIN;
  const score = days + Math.floor(minutes / 60);
  const raw = TIP_KINDNESS_BADGE_MIN + Math.floor(score / 3);
  return Math.min(
    TIP_KINDNESS_BADGE_MAX,
    Math.max(TIP_KINDNESS_BADGE_MIN, raw)
  );
}

/**
 * Only-grow merge: take the first N catalog ids where
 * N = max(alreadyOwnedInCatalogOrder, targetCount).
 * Same practice level on re-tip → same N → no new badges.
 *
 * @param {string[]} prevIds
 * @param {number} targetCount
 * @returns {{ badgeIds: string[], newlyAddedIds: string[] }}
 */
export function mergeTipBadgeAwards(prevIds, targetCount) {
  const prev = normalizeTipBadgeIds(prevIds);
  const target = Math.min(
    TIP_KINDNESS_BADGE_MAX,
    Math.max(TIP_KINDNESS_BADGE_MIN, Math.floor(Number(targetCount) || TIP_KINDNESS_BADGE_MIN))
  );
  const n = Math.max(prev.length, target);
  const badgeIds = TIP_KINDNESS_BADGE_CATALOG.slice(0, n).map((b) => b.id);
  const prevSet = new Set(prev);
  const newlyAddedIds = badgeIds.filter((id) => !prevSet.has(id));
  return { badgeIds, newlyAddedIds };
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
 */
export function planTipBadgeAward(storage, prevBadgeIds = []) {
  const summary = summarizePracticeDaysForBadges(
    readPracticeDaysForTipBadges(storage)
  );
  const targetCount = computeTipBadgeTargetCount(summary);
  const merge = mergeTipBadgeAwards(prevBadgeIds, targetCount);
  return { summary, targetCount, ...merge };
}
