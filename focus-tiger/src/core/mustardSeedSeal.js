/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Memorial Seal · 《芥子须弥》(Mustard Seed · Mount Sumeru)
 *
 * Product originality mark (乐五斋 verse cases): unlock once when unified
 * practice score crosses the threshold; each unrevealed case first appears
 * after a timed completion ceremony; thereafter re-openable from Idle ⋯ /
 * drawer (Quiet Line–like card), cycling revealed cases.
 *
 * score = practiceDayCount + floor(lifetimeMinutes / 60) — same as practice badges.
 */

import { computePracticeScore } from './practiceBadgeAward.js';
import {
  readPracticeDaysForTipBadges,
  summarizePracticeDaysForBadges
} from './tipKindnessBadges.js';

export const MUSTARD_SEED_SEAL_STORAGE_KEY = 'focus-tiger.mustard-seed-seal.v1';

/** Aligned with long-horizon memorial tier (~21 practice score units). */
export const MUSTARD_SEED_SEAL_SCORE_THRESHOLD = 21;

/** Dedicated seal badge dir (not tip / Sanctuary catalogs). */
export const MUSTARD_SEED_SEAL_BADGE_PUBLIC_DIR =
  '/ui/support/mustard-seed-seal';

/**
 * Companion medallion for the memorial seal card.
 * Ingested 2026-08-12 from root「芥子须弥纪念印所用的金章-…」→ kebab-case.
 */
export const MUSTARD_SEED_SEAL_BADGE_FILE =
  'yin-badge-square-gold-on-silver-alt.png';

export const MUSTARD_SEED_SEAL_CASE_SUMERU = 'mustard-seed-sumeru';
export const MUSTARD_SEED_SEAL_CASE_HERO = 'hero-not-pond';
export const MUSTARD_SEED_SEAL_CASE_NO_TRACE = 'no-trace-might';

export const MUSTARD_SEED_SEAL_POEM_ZH = Object.freeze([
  '大鵬展翅九萬里，',
  '十方世界共菩提。',
  '誰言我心不無量，',
  '芥子亦足納須彌。'
]);

/** Product EN lines (2026-08-12: accept current draft; no further editorial gate). */
export const MUSTARD_SEED_SEAL_POEM_EN = Object.freeze([
  'A roc spreads its wings for ninety thousand miles;',
  'In every direction, the worlds share one Bodhi.',
  'Who says this heart is not immeasurable?',
  'A mustard seed can hold Mount Sumeru.'
]);

export const MUSTARD_SEED_SEAL_ATTRIBUTION_ZH = '樂五齋詩稿';
export const MUSTARD_SEED_SEAL_ATTRIBUTION_EN = 'Verses of Le Wu Zhai';

export const MUSTARD_SEED_SEAL_HERO_POEM_ZH = Object.freeze([
  '山海奇雲風幡舞，',
  '紅塵如電亦如露。',
  '芥子無量納須彌，',
  '英雄豈是池中物。'
]);

/** Product EN lines (2026-08-17: same draft posture as case 1). */
export const MUSTARD_SEED_SEAL_HERO_POEM_EN = Object.freeze([
  'Strange clouds over mountains and seas; wind-banners dance.',
  'Red dust is like lightning, and like dew.',
  'Immeasurable, a mustard seed holds Mount Sumeru.',
  'How could a hero remain a creature of the pond?'
]);

export const MUSTARD_SEED_SEAL_HERO_ATTRIBUTION_ZH = '樂五齋七言歌行';
export const MUSTARD_SEED_SEAL_HERO_ATTRIBUTION_EN =
  'Song Verse of Le Wu Zhai';

export const MUSTARD_SEED_SEAL_NO_TRACE_POEM_ZH = Object.freeze([
  '縱橫馳騁九萬里，',
  '芥子唯微納須彌。',
  '英雄何需青龍手，',
  '所向無痕皆披靡。'
]);

/** Product EN lines (2026-09-02: same draft posture as cases 1–2). */
export const MUSTARD_SEED_SEAL_NO_TRACE_POEM_EN = Object.freeze([
  'Gallop freely across ninety thousand miles;',
  'Minute as a mustard seed, it still holds Mount Sumeru.',
  "Why would a hero need the Azure Dragon's hand?",
  'Wherever one goes, unmarked, all yield.'
]);

export const MUSTARD_SEED_SEAL_NO_TRACE_ATTRIBUTION_ZH = '樂五齋詩稿〇九〇二';
export const MUSTARD_SEED_SEAL_NO_TRACE_ATTRIBUTION_EN =
  'Verses of Le Wu Zhai · 0902';

/**
 * Ordered verse cases for this memorial scene (same card, same score gate).
 * @type {ReadonlyArray<{
 *   id: string,
 *   poemZh: ReadonlyArray<string>,
 *   poemEn: ReadonlyArray<string>,
 *   attributionZh: string,
 *   attributionEn: string
 * }>}
 */
export const MUSTARD_SEED_SEAL_CASES = Object.freeze([
  Object.freeze({
    id: MUSTARD_SEED_SEAL_CASE_SUMERU,
    poemZh: MUSTARD_SEED_SEAL_POEM_ZH,
    poemEn: MUSTARD_SEED_SEAL_POEM_EN,
    attributionZh: MUSTARD_SEED_SEAL_ATTRIBUTION_ZH,
    attributionEn: MUSTARD_SEED_SEAL_ATTRIBUTION_EN
  }),
  Object.freeze({
    id: MUSTARD_SEED_SEAL_CASE_HERO,
    poemZh: MUSTARD_SEED_SEAL_HERO_POEM_ZH,
    poemEn: MUSTARD_SEED_SEAL_HERO_POEM_EN,
    attributionZh: MUSTARD_SEED_SEAL_HERO_ATTRIBUTION_ZH,
    attributionEn: MUSTARD_SEED_SEAL_HERO_ATTRIBUTION_EN
  }),
  Object.freeze({
    id: MUSTARD_SEED_SEAL_CASE_NO_TRACE,
    poemZh: MUSTARD_SEED_SEAL_NO_TRACE_POEM_ZH,
    poemEn: MUSTARD_SEED_SEAL_NO_TRACE_POEM_EN,
    attributionZh: MUSTARD_SEED_SEAL_NO_TRACE_ATTRIBUTION_ZH,
    attributionEn: MUSTARD_SEED_SEAL_NO_TRACE_ATTRIBUTION_EN
  })
]);

/**
 * @returns {{
 *   revealed: boolean,
 *   revealedAt: string | null,
 *   scoreAtReveal: number | null,
 *   revealedCaseIds: string[],
 *   lastShownCaseId: string | null
 * }}
 */
function emptySealState() {
  return {
    revealed: false,
    revealedAt: null,
    scoreAtReveal: null,
    revealedCaseIds: [],
    lastShownCaseId: null
  };
}

/**
 * @param {string | null | undefined} id
 * @returns {(typeof MUSTARD_SEED_SEAL_CASES)[number] | null}
 */
export function getMustardSeedSealCase(id) {
  if (typeof id !== 'string' || !id) return null;
  return MUSTARD_SEED_SEAL_CASES.find((entry) => entry.id === id) ?? null;
}

/**
 * Legacy `{ revealed: true }` without `revealedCaseIds` = case 1 already shown.
 * @param {{ revealed?: boolean, revealedCaseIds?: unknown }} [state]
 * @returns {string[]}
 */
export function listRevealedMustardSeedCaseIds(state) {
  const raw = Array.isArray(state?.revealedCaseIds)
    ? state.revealedCaseIds.filter((id) => getMustardSeedSealCase(id))
    : [];
  if (raw.length > 0) return raw;
  if (state?.revealed === true) return [MUSTARD_SEED_SEAL_CASE_SUMERU];
  return [];
}

/**
 * @param {{ revealed?: boolean, revealedCaseIds?: unknown }} [state]
 * @returns {(typeof MUSTARD_SEED_SEAL_CASES)[number] | null}
 */
export function nextUnrevealedMustardSeedCase(state) {
  const revealed = new Set(listRevealedMustardSeedCaseIds(state));
  return MUSTARD_SEED_SEAL_CASES.find((entry) => !revealed.has(entry.id)) ?? null;
}

/**
 * Next revealed case after `lastShownCaseId` (wrap). One revealed case stays put.
 * @param {{
 *   revealed?: boolean,
 *   revealedCaseIds?: unknown,
 *   lastShownCaseId?: string | null
 * }} [state]
 * @returns {(typeof MUSTARD_SEED_SEAL_CASES)[number]}
 */
export function pickMustardSeedSealMenuCase(state) {
  const revealedIds = listRevealedMustardSeedCaseIds(state);
  if (revealedIds.length === 0) {
    return MUSTARD_SEED_SEAL_CASES[0];
  }
  const last = state?.lastShownCaseId;
  const idx = revealedIds.indexOf(last);
  const nextId =
    idx >= 0
      ? revealedIds[(idx + 1) % revealedIds.length]
      : revealedIds[0];
  return getMustardSeedSealCase(nextId) ?? MUSTARD_SEED_SEAL_CASES[0];
}

/**
 * @param {Storage | null | undefined} storage
 * @param {ReturnType<typeof emptySealState>} state
 */
function persistSealState(storage, state) {
  try {
    storage?.setItem(MUSTARD_SEED_SEAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {ReturnType<typeof emptySealState>}
 */
export function readMustardSeedSealState(storage) {
  if (!storage) return emptySealState();
  try {
    const raw = storage.getItem(MUSTARD_SEED_SEAL_STORAGE_KEY);
    if (!raw) return emptySealState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptySealState();
    const revealed = parsed.revealed === true;
    const revealedAt =
      typeof parsed.revealedAt === 'string' ? parsed.revealedAt : null;
    const scoreAtReveal =
      typeof parsed.scoreAtReveal === 'number' &&
      Number.isFinite(parsed.scoreAtReveal)
        ? parsed.scoreAtReveal
        : null;
    const lastShownCaseId = getMustardSeedSealCase(parsed.lastShownCaseId)
      ? parsed.lastShownCaseId
      : null;
    const revealedCaseIds = listRevealedMustardSeedCaseIds({
      revealed,
      revealedCaseIds: parsed.revealedCaseIds
    });
    return {
      revealed,
      revealedAt,
      scoreAtReveal,
      revealedCaseIds,
      lastShownCaseId
    };
  } catch {
    return emptySealState();
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{
 *   scoreAtReveal?: number,
 *   caseId?: string,
 *   now?: () => Date
 * }} [opts]
 * @returns {ReturnType<typeof emptySealState>}
 */
export function markMustardSeedSealRevealed(storage, opts = {}) {
  const now = opts.now?.() ?? new Date();
  const prev = readMustardSeedSealState(storage);
  const nextPending = nextUnrevealedMustardSeedCase(prev);
  const caseId =
    getMustardSeedSealCase(opts.caseId)?.id ??
    nextPending?.id ??
    MUSTARD_SEED_SEAL_CASE_SUMERU;
  const revealedCaseIds = [
    ...new Set([...listRevealedMustardSeedCaseIds(prev), caseId])
  ];
  const state = {
    revealed: true,
    revealedAt: prev.revealedAt ?? now.toISOString(),
    scoreAtReveal:
      prev.scoreAtReveal ??
      (typeof opts.scoreAtReveal === 'number' &&
      Number.isFinite(opts.scoreAtReveal)
        ? opts.scoreAtReveal
        : null),
    revealedCaseIds,
    lastShownCaseId: caseId
  };
  persistSealState(storage, state);
  return state;
}

/**
 * Menu re-read: remember which verse was shown without claiming a new case.
 * @param {Storage | null | undefined} storage
 * @param {string} caseId
 * @returns {ReturnType<typeof emptySealState>}
 */
export function rememberMustardSeedSealLastShown(storage, caseId) {
  const prev = readMustardSeedSealState(storage);
  if (!getMustardSeedSealCase(caseId)) return prev;
  const state = { ...prev, lastShownCaseId: caseId };
  persistSealState(storage, state);
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
 *   revealedCaseIds: string[],
 *   lastShownCaseId: string | null,
 *   nextCase: (typeof MUSTARD_SEED_SEAL_CASES)[number] | null,
 *   menuCase: (typeof MUSTARD_SEED_SEAL_CASES)[number],
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
  const state = readMustardSeedSealState(storage);
  const nextCase = nextUnrevealedMustardSeedCase(state);
  return {
    score,
    summary,
    unlocked,
    revealed: state.revealed,
    revealedCaseIds: state.revealedCaseIds,
    lastShownCaseId: state.lastShownCaseId,
    nextCase,
    menuCase: pickMustardSeedSealMenuCase(state),
    shouldAutoReveal: unlocked && nextCase != null
  };
}

/**
 * @param {string} [file]
 * @returns {string}
 */
export function mustardSeedSealBadgeSrc(
  file = MUSTARD_SEED_SEAL_BADGE_FILE
) {
  return `${MUSTARD_SEED_SEAL_BADGE_PUBLIC_DIR}/${file}`;
}

/**
 * Pure gate for post-completion auto offer (timed session ceremony only).
 * Prefer `hasUnrevealedCase` (second verse still pending after case 1).
 * If omitted, falls back to legacy `revealed !== true`.
 * @param {{
 *   completed?: boolean,
 *   unlocked?: boolean,
 *   revealed?: boolean,
 *   hasUnrevealedCase?: boolean
 * }} opts
 * @returns {boolean}
 */
export function shouldOfferMustardSeedSealAfterCeremony(opts = {}) {
  const pending =
    typeof opts.hasUnrevealedCase === 'boolean'
      ? opts.hasUnrevealedCase
      : opts.revealed !== true;
  return (
    opts.completed === true &&
    opts.unlocked === true &&
    pending === true
  );
}
