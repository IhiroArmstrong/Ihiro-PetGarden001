/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Contemplative Archive standalone memorial seals (CA-01 … CA-12).
 * Mustard Seed · Sumeru multi-case scene stays in `mustardSeedSeal.js`.
 */

import { computePracticeScore } from './practiceBadgeAward.js';
import {
  readPracticeDaysForTipBadges,
  summarizePracticeDaysForBadges
} from './tipKindnessBadges.js';
import {
  CONTEMPLATIVE_ARCHIVE_SEAL_PROXY_PREFIX,
  getMemorialSealEntry,
  isContemplativeArchiveSealEntry,
  listEnabledContemplativeArchiveSealEntries,
  nextUnrevealedMemorialSealEntry
} from './memorialSealDirectory.js';

export const CONTEMPLATIVE_ARCHIVE_SEAL_STORAGE_KEY =
  'focus-tiger.contemplative-archive-seals.v1';

/**
 * @returns {{ revealedEntryIds: string[] }}
 */
function emptyArchiveSealState() {
  return { revealedEntryIds: [] };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ revealedEntryIds: string[] }}
 */
export function readContemplativeArchiveSealState(storage) {
  if (!storage) return emptyArchiveSealState();
  try {
    const raw = storage.getItem(CONTEMPLATIVE_ARCHIVE_SEAL_STORAGE_KEY);
    if (!raw) return emptyArchiveSealState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyArchiveSealState();
    const revealedEntryIds = Array.isArray(parsed.revealedEntryIds)
      ? parsed.revealedEntryIds.filter((id) => {
          const entry = getMemorialSealEntry(id);
          return entry && isContemplativeArchiveSealEntry(entry);
        })
      : [];
    return { revealedEntryIds };
  } catch {
    return emptyArchiveSealState();
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ revealedEntryIds: string[] }} state
 */
function persistArchiveSealState(storage, state) {
  try {
    storage?.setItem(
      CONTEMPLATIVE_ARCHIVE_SEAL_STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch {
    // ignore quota
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} entryId
 * @returns {{ revealedEntryIds: string[] }}
 */
export function markContemplativeArchiveSealRevealed(storage, entryId) {
  const entry = getMemorialSealEntry(entryId);
  if (!entry || !isContemplativeArchiveSealEntry(entry)) {
    return readContemplativeArchiveSealState(storage);
  }
  const prev = readContemplativeArchiveSealState(storage);
  const revealedEntryIds = [
    ...new Set([...prev.revealedEntryIds, entry.id])
  ];
  const state = { revealedEntryIds };
  persistArchiveSealState(storage, state);
  return state;
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearContemplativeArchiveSealState(storage) {
  try {
    storage?.removeItem(CONTEMPLATIVE_ARCHIVE_SEAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * @param {string} entryId
 * @param {number} score
 * @param {{ revealedEntryIds?: string[] }} [state]
 * @returns {boolean}
 */
export function isContemplativeArchiveSealUnlocked(entryId, score, state) {
  const entry = getMemorialSealEntry(entryId);
  if (!entry || !entry.enabled || !isContemplativeArchiveSealEntry(entry)) {
    return false;
  }
  return score >= entry.scoreThreshold;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{
 *   score: number,
 *   summary: { practiceDayCount: number, lifetimeMinutes: number },
 *   nextEntry: import('./memorialSealDirectory.js').MemorialSealEntry | null,
 *   shouldAutoReveal: boolean,
 *   menuEntries: Array<{
 *     id: string,
 *     proxy: string,
 *     labelKey: string,
 *     unlocked: boolean,
 *     revealed: boolean
 *   }>
 * }}
 */
export function resolveContemplativeArchiveSeal(storage) {
  const summary = summarizePracticeDaysForBadges(
    readPracticeDaysForTipBadges(storage)
  );
  const score = computePracticeScore(summary);
  const state = readContemplativeArchiveSealState(storage);
  const revealed = new Set(state.revealedEntryIds);
  const enabledEntries = listEnabledContemplativeArchiveSealEntries();
  const nextEntry = nextUnrevealedMemorialSealEntry(
    enabledEntries,
    revealed,
    score
  );
  const menuEntries = enabledEntries
    .filter(
      (entry) =>
        revealed.has(entry.id) || score >= entry.scoreThreshold
    )
    .map((entry) => ({
      id: entry.id,
      proxy: `${CONTEMPLATIVE_ARCHIVE_SEAL_PROXY_PREFIX}${entry.id}`,
      labelKey: entry.menuLabelKey || entry.cardTitleKey || entry.id,
      unlocked: score >= entry.scoreThreshold,
      revealed: revealed.has(entry.id)
    }));
  return {
    score,
    summary,
    nextEntry,
    shouldAutoReveal: nextEntry != null,
    menuEntries
  };
}

/**
 * @param {{
 *   completed?: boolean,
 *   shouldAutoReveal?: boolean
 * }} opts
 * @returns {boolean}
 */
export function shouldOfferContemplativeArchiveSealAfterCeremony(opts = {}) {
  return opts.completed === true && opts.shouldAutoReveal === true;
}
