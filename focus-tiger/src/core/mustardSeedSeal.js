/**
 * Memorial Seal · 《芥子须弥》(Mustard Seed · Mount Sumeru)
 *
 * Product originality mark (乐五斋诗稿): unlock once when unified practice
 * score crosses the threshold; first reveal after a timed completion ceremony;
 * thereafter re-openable from Idle ⋯ / drawer (Quiet Line–like card).
 *
 * score = practiceDayCount + floor(lifetimeMinutes / 60) — same as practice badges.
 */

import { computePracticeScore } from './practiceBadgeAward.js';
import {
  readPracticeDaysForTipBadges,
  summarizePracticeDaysForBadges,
  tipKindnessBadgeSrc
} from './tipKindnessBadges.js';

export const MUSTARD_SEED_SEAL_STORAGE_KEY = 'focus-tiger.mustard-seed-seal.v1';

/** Aligned with long-horizon memorial tier (~21 practice score units). */
export const MUSTARD_SEED_SEAL_SCORE_THRESHOLD = 21;

/**
 * Companion medallion (interim: tip catalog gold mono).
 * Follow-up: replace with dedicated mustard-seed-seal asset (see task brief).
 */
export const MUSTARD_SEED_SEAL_BADGE_FILE =
  'yin-medallion-gold-monochrome-engraved.png';

export const MUSTARD_SEED_SEAL_POEM_ZH = Object.freeze([
  '大鹏展翅九万里，',
  '十方世界共菩提。',
  '谁言我心不无量，',
  '芥子亦足纳须弥。'
]);

/**
 * Interim EN lines — human editorial pass deferred (see task brief).
 */
export const MUSTARD_SEED_SEAL_POEM_EN = Object.freeze([
  'A roc spreads its wings for ninety thousand miles;',
  'In every direction, the worlds share one Bodhi.',
  'Who says this heart is not immeasurable?',
  'A mustard seed can hold Mount Sumeru.'
]);

export const MUSTARD_SEED_SEAL_ATTRIBUTION_ZH = '乐五斋诗稿';
export const MUSTARD_SEED_SEAL_ATTRIBUTION_EN = 'Verses of Le Wu Zhai';

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ revealed: boolean, revealedAt: string | null, scoreAtReveal: number | null }}
 */
export function readMustardSeedSealState(storage) {
  if (!storage) {
    return { revealed: false, revealedAt: null, scoreAtReveal: null };
  }
  try {
    const raw = storage.getItem(MUSTARD_SEED_SEAL_STORAGE_KEY);
    if (!raw) {
      return { revealed: false, revealedAt: null, scoreAtReveal: null };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { revealed: false, revealedAt: null, scoreAtReveal: null };
    }
    return {
      revealed: parsed.revealed === true,
      revealedAt:
        typeof parsed.revealedAt === 'string' ? parsed.revealedAt : null,
      scoreAtReveal:
        typeof parsed.scoreAtReveal === 'number' &&
        Number.isFinite(parsed.scoreAtReveal)
          ? parsed.scoreAtReveal
          : null
    };
  } catch {
    return { revealed: false, revealedAt: null, scoreAtReveal: null };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ scoreAtReveal?: number, now?: () => Date }} [opts]
 * @returns {{ revealed: boolean, revealedAt: string | null, scoreAtReveal: number | null }}
 */
export function markMustardSeedSealRevealed(storage, opts = {}) {
  const now = opts.now?.() ?? new Date();
  const state = {
    revealed: true,
    revealedAt: now.toISOString(),
    scoreAtReveal:
      typeof opts.scoreAtReveal === 'number' &&
      Number.isFinite(opts.scoreAtReveal)
        ? opts.scoreAtReveal
        : null
  };
  try {
    storage?.setItem(MUSTARD_SEED_SEAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
  return state;
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearMustardSeedSealState(storage) {
  try {
    storage?.removeItem(MUSTARD_SEED_SEAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * @param {{ practiceDayCount?: number, lifetimeMinutes?: number }} summary
 * @param {number} [threshold]
 * @returns {boolean}
 */
export function isMustardSeedSealScoreMet(
  summary,
  threshold = MUSTARD_SEED_SEAL_SCORE_THRESHOLD
) {
  return computePracticeScore(summary) >= threshold;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ threshold?: number }} [opts]
 * @returns {{
 *   score: number,
 *   summary: { practiceDayCount: number, lifetimeMinutes: number },
 *   unlocked: boolean,
 *   revealed: boolean,
 *   shouldAutoReveal: boolean
 * }}
 */
export function resolveMustardSeedSeal(storage, opts = {}) {
  const threshold = opts.threshold ?? MUSTARD_SEED_SEAL_SCORE_THRESHOLD;
  const summary = summarizePracticeDaysForBadges(
    readPracticeDaysForTipBadges(storage)
  );
  const score = computePracticeScore(summary);
  const unlocked = score >= threshold;
  const { revealed } = readMustardSeedSealState(storage);
  return {
    score,
    summary,
    unlocked,
    revealed,
    shouldAutoReveal: unlocked && !revealed
  };
}

/**
 * @returns {string}
 */
export function mustardSeedSealBadgeSrc() {
  return tipKindnessBadgeSrc(MUSTARD_SEED_SEAL_BADGE_FILE);
}

/**
 * Pure gate for post-completion auto offer (timed session ceremony only).
 * @param {{
 *   completed?: boolean,
 *   unlocked?: boolean,
 *   revealed?: boolean
 * }} opts
 * @returns {boolean}
 */
export function shouldOfferMustardSeedSealAfterCeremony(opts = {}) {
  return (
    opts.completed === true &&
    opts.unlocked === true &&
    opts.revealed !== true
  );
}
