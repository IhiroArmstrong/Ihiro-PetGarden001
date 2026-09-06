/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Memorial Seal directory — machine-readable SSOT for Contemplative Archive seals.
 * Content spec + candidate table: `docs/CONTEMPLATIVE_ARCHIVE.md`.
 *
 * New seal on screen = append one enabled record here (no trigger/UI code change).
 */

/** @typedef {'stillness' | 'smallness-vastness' | 'time-continuity' | 'imperfection-return'} MemorialSealToneTag */

/**
 * @typedef {{
 *   id: string,
 *   sealSceneId: string,
 *   scoreThreshold: number,
 *   poemZh?: readonly string[],
 *   poemJa?: readonly string[],
 *   poemEn: readonly string[],
 *   attributionZh: string,
 *   attributionEn: string,
 *   badgeDir: string,
 *   badgeAsset: string,
 *   toneTag: MemorialSealToneTag,
 *   enabled: boolean
 * }} MemorialSealEntry
 */

export const MEMORIAL_SEAL_BADGE_PUBLIC_DIR =
  '/ui/support/mustard-seed-seal';

export const MEMORIAL_SEAL_DEFAULT_BADGE_FILE =
  'yin-badge-square-gold-on-silver-alt.png';

/** Mustard Seed · Sumeru scene (three verse cases, same card). */
export const MEMORIAL_SEAL_SCENE_MUSTARD_SEED = 'mustard-seed-sumeru';

/** Future seal 02 · The Old Pond (CA-01). */
export const MEMORIAL_SEAL_SCENE_OLD_POND = 'old-pond';

export const MEMORIAL_SEAL_ENTRY_MUSTARD_SEED_SUMERU = 'mustard-seed-sumeru';
export const MEMORIAL_SEAL_ENTRY_HERO = 'hero-not-pond';
export const MEMORIAL_SEAL_ENTRY_NO_TRACE = 'no-trace-might';
export const MEMORIAL_SEAL_ENTRY_OLD_POND = 'ca-01-old-pond';

/** @type {readonly MemorialSealEntry[]} */
export const MEMORIAL_SEAL_DIRECTORY = Object.freeze([
  Object.freeze({
    id: MEMORIAL_SEAL_ENTRY_MUSTARD_SEED_SUMERU,
    sealSceneId: MEMORIAL_SEAL_SCENE_MUSTARD_SEED,
    scoreThreshold: 21,
    poemZh: Object.freeze([
      '大鵬展翅九萬里，',
      '十方世界共菩提。',
      '誰言我心不無量，',
      '芥子亦足納須彌。'
    ]),
    poemEn: Object.freeze([
      'A roc spreads its wings for ninety thousand miles;',
      'In every direction, the worlds share one Bodhi.',
      'Who says this heart is not immeasurable?',
      'A mustard seed can hold Mount Sumeru.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    badgeDir: MEMORIAL_SEAL_BADGE_PUBLIC_DIR,
    badgeAsset: MEMORIAL_SEAL_DEFAULT_BADGE_FILE,
    toneTag: 'smallness-vastness',
    enabled: true
  }),
  Object.freeze({
    id: MEMORIAL_SEAL_ENTRY_HERO,
    sealSceneId: MEMORIAL_SEAL_SCENE_MUSTARD_SEED,
    scoreThreshold: 21,
    poemZh: Object.freeze([
      '山海奇雲風幡舞，',
      '紅塵如電亦如露。',
      '芥子無量納須彌，',
      '英雄豈是池中物。'
    ]),
    poemEn: Object.freeze([
      'Strange clouds over mountains and seas; wind-banners dance.',
      'Red dust is like lightning, and like dew.',
      'Immeasurable, a mustard seed holds Mount Sumeru.',
      'How could a hero remain a creature of the pond?'
    ]),
    attributionZh: '樂五齋七言歌行',
    attributionEn: 'Song Verse of Le Wu Zhai',
    badgeDir: MEMORIAL_SEAL_BADGE_PUBLIC_DIR,
    badgeAsset: MEMORIAL_SEAL_DEFAULT_BADGE_FILE,
    toneTag: 'smallness-vastness',
    enabled: true
  }),
  Object.freeze({
    id: MEMORIAL_SEAL_ENTRY_NO_TRACE,
    sealSceneId: MEMORIAL_SEAL_SCENE_MUSTARD_SEED,
    scoreThreshold: 21,
    poemZh: Object.freeze([
      '乾坤縱橫九萬里，',
      '芥子唯微納須彌。',
      '英雄何需青龍手，',
      '所向無痕皆披靡。'
    ]),
    poemEn: Object.freeze([
      'Heaven and earth span ninety thousand miles;',
      'Minute as a mustard seed, it still holds Mount Sumeru.',
      "Why would a hero need the Azure Dragon's hand?",
      'Wherever one goes, unmarked, all yield.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai · 0902',
    badgeDir: MEMORIAL_SEAL_BADGE_PUBLIC_DIR,
    badgeAsset: MEMORIAL_SEAL_DEFAULT_BADGE_FILE,
    toneTag: 'smallness-vastness',
    enabled: true
  }),
  Object.freeze({
    id: MEMORIAL_SEAL_ENTRY_OLD_POND,
    sealSceneId: MEMORIAL_SEAL_SCENE_OLD_POND,
    scoreThreshold: 30,
    poemJa: Object.freeze(['古池や蛙飛びこむ水の音']),
    poemEn: Object.freeze([
      'AN OLD POND—',
      'A FROG JUMPS IN,',
      'THE SOUND OF WATER.'
    ]),
    attributionZh: '',
    attributionEn: 'Matsuo Bashō · Adapted for product EN',
    badgeDir: MEMORIAL_SEAL_BADGE_PUBLIC_DIR,
    badgeAsset: MEMORIAL_SEAL_DEFAULT_BADGE_FILE,
    toneTag: 'stillness',
    enabled: false
  })
]);

/**
 * @param {string | null | undefined} id
 * @returns {MemorialSealEntry | null}
 */
export function getMemorialSealEntry(id) {
  if (typeof id !== 'string' || !id) return null;
  return MEMORIAL_SEAL_DIRECTORY.find((entry) => entry.id === id) ?? null;
}

/**
 * @param {string} sealSceneId
 * @returns {readonly MemorialSealEntry[]}
 */
export function listMemorialSealEntriesForScene(sealSceneId) {
  return MEMORIAL_SEAL_DIRECTORY.filter(
    (entry) => entry.sealSceneId === sealSceneId && entry.enabled
  );
}

/**
 * Lowest score gate among enabled entries in a scene (mustard seed unlock).
 * @param {string} sealSceneId
 * @returns {number | null}
 */
export function memorialSealSceneUnlockThreshold(sealSceneId) {
  const enabled = listMemorialSealEntriesForScene(sealSceneId);
  if (enabled.length === 0) return null;
  return enabled.reduce(
    (min, entry) => Math.min(min, entry.scoreThreshold),
    enabled[0].scoreThreshold
  );
}

/**
 * First enabled entry in directory order that meets score and is not yet revealed.
 * @param {readonly MemorialSealEntry[]} entries
 * @param {ReadonlySet<string> | readonly string[]} revealedIds
 * @param {number} score
 * @returns {MemorialSealEntry | null}
 */
export function nextUnrevealedMemorialSealEntry(entries, revealedIds, score) {
  const revealed = revealedIds instanceof Set
    ? revealedIds
    : new Set(revealedIds);
  return (
    entries.find(
      (entry) =>
        entry.enabled &&
        score >= entry.scoreThreshold &&
        !revealed.has(entry.id)
    ) ?? null
  );
}

/**
 * Map directory entry → mustard-seed card verse case shape.
 * @param {MemorialSealEntry} entry
 */
export function memorialSealEntryToVerseCase(entry) {
  return {
    id: entry.id,
    poemZh: entry.poemZh ?? [],
    poemEn: entry.poemEn,
    attributionZh: entry.attributionZh,
    attributionEn: entry.attributionEn
  };
}
