/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * H3 home memorabilia preview: latest piece + count for Yin's Collections.
 * Does not invent a badge wall. Shop art / unscheduled gift-art stay out.
 */

import {
  getMemorialSealEntry,
  memorialSealBadgeSrcForEntry
} from './memorialSealDirectory.js';
import { readContemplativeArchiveSealState } from './contemplativeArchiveSeal.js';
import {
  PRACTICE_IMPRINT_NAME_KEYS,
  practiceImprintBadgeSrc,
  readPracticeImprintState
} from './practiceImprint.js';
import {
  mustardSeedSealBadgeSrc,
  readMustardSeedSealState
} from './mustardSeedSeal.js';

/**
 * @typedef {{
 *   id: string,
 *   at: string,
 *   nameKey: string,
 *   badgeSrc: string
 * }} HomeMemorabiliaItem
 */

/**
 * @typedef {{
 *   count: number,
 *   latest: HomeMemorabiliaItem | null
 * }} HomeMemorabiliaPreview
 */

/**
 * @param {{ storage?: Storage | null }} [deps]
 * @returns {HomeMemorabiliaPreview}
 */
export function listHomeMemorabiliaPreview(deps = {}) {
  const storage = deps.storage ?? safeLocalStorage();
  /** @type {HomeMemorabiliaItem[]} */
  const items = [];

  const mustard = readMustardSeedSealState(storage);
  for (const caseId of mustard.revealedCaseIds) {
    const entry = getMemorialSealEntry(caseId);
    items.push({
      id: `seal:${caseId}`,
      at: mustard.revealedAt || '',
      nameKey: 'HOME_MEMORABILIA_SEAL',
      badgeSrc: entry
        ? memorialSealBadgeSrcForEntry(entry)
        : mustardSeedSealBadgeSrc()
    });
  }

  const imprint = readPracticeImprintState(storage);
  for (const catalogId of imprint.awardedIds) {
    items.push({
      id: `imprint:${catalogId}`,
      at: imprint.awardedAt?.[catalogId] || '',
      nameKey: PRACTICE_IMPRINT_NAME_KEYS[catalogId] || 'HOME_MEMORABILIA_ITEM',
      badgeSrc: practiceImprintBadgeSrc()
    });
  }

  const archive = readContemplativeArchiveSealState(storage);
  for (const entryId of archive.revealedEntryIds) {
    const entry = getMemorialSealEntry(entryId);
    items.push({
      id: `archive:${entryId}`,
      at: '',
      nameKey: 'HOME_MEMORABILIA_ARCHIVE',
      badgeSrc: entry
        ? memorialSealBadgeSrcForEntry(entry)
        : mustardSeedSealBadgeSrc()
    });
  }

  items.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  return {
    count: items.length,
    latest: items[0] || null
  };
}

/**
 * @returns {Storage | null}
 */
function safeLocalStorage() {
  try {
    if (typeof globalThis.localStorage === 'undefined') return null;
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
