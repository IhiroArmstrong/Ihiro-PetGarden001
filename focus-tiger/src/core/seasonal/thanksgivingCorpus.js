/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · Thanksgiving copy pool (US/CA shared).
 * Tone: quiet gratitude / shared table without noise — not retail or patriotism.
 * Human-authored; review=ok required before contentReady may ship.
 *
 * Four checks (same as Confide): 说教 / 留白 / 越界 / 节奏克制.
 */

/**
 * @typedef {import('./christmasCorpus.js').SeasonalCopyLine} SeasonalCopyLine
 */

/** @type {readonly SeasonalCopyLine[]} */
export const THANKSGIVING_CORPUS = Object.freeze([
  Object.freeze({
    id: 'thanksgiving-01',
    en: 'Enough can be quiet. Yin stays near.',
    ja: '足りることは、静かでもいい。寅は、そばにいる。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'thanksgiving-02',
    en: 'A table does not need to be full to feel warm.',
    ja: '温かさは、席が埋まらなくてもある。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'thanksgiving-03',
    en: 'Gratitude without performance — just breath, just here.',
    ja: '見せる感謝ではなく——息と、ここだけ。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'thanksgiving-04',
    en: 'Harvest light, low in the room. Stillness counts.',
    ja: '部屋の低い収穫の光。静けさも、数になる。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'thanksgiving-05',
    en: 'Someone sat with you before. The cushion remembers.',
    ja: '誰かが、以前ここに座った。座布団は覚えている。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'thanksgiving-06',
    en: 'No parade required. A pause is already a gift.',
    ja: '行列は要らない。一休みが、すでに贈り物。',
    review: 'ok'
  })
]);

/**
 * @returns {boolean}
 */
export function isThanksgivingCorpusOk() {
  return THANKSGIVING_CORPUS.every((line) => line.review === 'ok');
}

/**
 * Deterministic pick for a calendar day (stable across reloads).
 * @param {string} dayIso YYYY-MM-DD
 * @param {readonly SeasonalCopyLine[]} [pool]
 * @returns {SeasonalCopyLine | null}
 */
export function pickThanksgivingLineForDay(dayIso, pool = THANKSGIVING_CORPUS) {
  const ok = pool.filter((l) => l.review === 'ok');
  if (!ok.length) return null;
  const raw = String(dayIso || '');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return ok[hash % ok.length] ?? null;
}
