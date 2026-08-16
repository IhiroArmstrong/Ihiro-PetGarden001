/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin's Sanctuary · prestigious badges (Lifetime identity marks).
 *
 * Visual catalog is separate from Tip kindness badges (yin-badges/).
 * Storage: sanctuary entitlement `badgeIds` — never tip-jar.
 */

import {
  PRACTICE_DAYS_STORAGE_KEY,
  migratePracticeDaysEntries
} from './PracticeDaysStore.js';
import {
  computePracticeBadgeTargetCount,
  mergeCatalogBadgeAwards
} from './practiceBadgeAward.js';

export const SANCTUARY_BADGE_PUBLIC_DIR = '/ui/support/sanctuary-badges';

/**
 * Catalog order = progression (silver → gold → high tier). Max 17.
 * @type {ReadonlyArray<{ id: string, file: string }>}
 */
export const SANCTUARY_BADGE_CATALOG = Object.freeze([
  {
    id: 'silver-gold-rim-gray-scene',
    file: 'tiger-badge-silver-gold-rim-gray-scene.png'
  },
  { id: 'silver-gold-rim', file: 'tiger-badge-silver-gold-rim.png' },
  { id: 'silver-gold-rim-v2', file: 'tiger-badge-silver-gold-rim-v2.png' },
  { id: 'silver-gold-rim-frost', file: 'tiger-badge-silver-gold-rim-frost.png' },
  {
    id: 'silver-gold-rim-sparkle',
    file: 'tiger-badge-silver-gold-rim-sparkle.png'
  },
  { id: 'silver-dark-scene', file: 'tiger-badge-silver-dark-scene.png' },
  { id: 'gunmetal-gold-rim', file: 'tiger-badge-gunmetal-gold-rim.png' },
  { id: 'gold-plain', file: 'tiger-badge-gold-plain.png' },
  { id: 'gold-thin-rim', file: 'tiger-badge-gold-thin-rim.png' },
  { id: 'gold-classic', file: 'tiger-badge-gold-classic.png' },
  { id: 'gold-thick-rim', file: 'tiger-badge-gold-thick-rim.png' },
  { id: 'gold-solid-circle', file: 'tiger-badge-gold-solid-circle.png' },
  { id: 'gold-silver-rim', file: 'tiger-badge-gold-silver-rim.png' },
  { id: 'gold-silver-rim-v2', file: 'tiger-badge-gold-silver-rim-v2.png' },
  {
    id: 'gold-silver-rim-pink-gem',
    file: 'tiger-badge-gold-silver-rim-pink-gem.png'
  },
  { id: 'gold-radial-burst', file: 'tiger-badge-gold-radial-burst.png' },
  { id: 'gold-diamond', file: 'tiger-badge-gold-diamond.png' }
]);

const CATALOG_BY_ID = new Map(
  SANCTUARY_BADGE_CATALOG.map((b) => [b.id, b])
);

export const SANCTUARY_BADGE_MIN = 3;
export const SANCTUARY_BADGE_MAX = SANCTUARY_BADGE_CATALOG.length;

/**
 * @param {string} file
 * @returns {string}
 */
export function sanctuaryBadgeSrc(file) {
  return `${SANCTUARY_BADGE_PUBLIC_DIR}/${file}`;
}

/**
 * @param {string} id
 * @returns {{ id: string, file: string } | null}
 */
export function getSanctuaryBadgeById(id) {
  return CATALOG_BY_ID.get(String(id || '')) || null;
}

/**
 * @param {unknown} rawIds
 * @returns {string[]}
 */
export function normalizeSanctuaryBadgeIds(rawIds) {
  if (!Array.isArray(rawIds)) return [];
  /** @type {string[]} */
  const out = [];
  const seen = new Set();
  for (const entry of SANCTUARY_BADGE_CATALOG) {
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
export function summarizePracticeDaysForSanctuaryBadges(days) {
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
 * @param {{ practiceDayCount?: number, lifetimeMinutes?: number }} summary
 * @returns {number}
 */
export function computeSanctuaryBadgeTargetCount(summary = {}) {
  return computePracticeBadgeTargetCount(summary, {
    min: SANCTUARY_BADGE_MIN,
    max: SANCTUARY_BADGE_MAX,
    requirePractice: false
  });
}

/**
 * @param {string[]} prevIds
 * @param {number} targetCount
 */
export function mergeSanctuaryBadgeAwards(prevIds, targetCount) {
  return mergeCatalogBadgeAwards(
    SANCTUARY_BADGE_CATALOG,
    prevIds,
    targetCount,
    normalizeSanctuaryBadgeIds
  );
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readPracticeDaysForSanctuaryBadges(storage) {
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
 * @param {Storage | null | undefined} storage
 * @param {string[]} [prevBadgeIds]
 */
export function planSanctuaryBadgeAward(storage, prevBadgeIds = []) {
  const summary = summarizePracticeDaysForSanctuaryBadges(
    readPracticeDaysForSanctuaryBadges(storage)
  );
  const targetCount = computeSanctuaryBadgeTargetCount(summary);
  const merge = mergeSanctuaryBadgeAwards(prevBadgeIds, targetCount);
  return { summary, targetCount, ...merge };
}
