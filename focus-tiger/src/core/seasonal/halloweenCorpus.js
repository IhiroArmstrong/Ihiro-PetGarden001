/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · Halloween copy pool.
 * Tone: quiet autumn dusk / companionship — not horror, arcade, or jump-scare.
 * Human-authored; review=ok required before contentReady may ship.
 *
 * Four checks (same as Confide): 说教 / 留白 / 越界 / 节奏克制.
 */

/**
 * @typedef {import('./christmasCorpus.js').SeasonalCopyLine} SeasonalCopyLine
 */

/** @type {readonly SeasonalCopyLine[]} */
export const HALLOWEEN_CORPUS = Object.freeze([
  Object.freeze({
    id: 'halloween-01',
    en: 'Dusk gathers early. Yin stays — no masks needed here.',
    ja: '夕暮れが早い。寅はいる——ここでは仮面は要らない。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'halloween-02',
    en: 'The lantern is small. Enough to see the cushion.',
    ja: '灯は小さい。座布団が見えるだけで足りる。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'halloween-03',
    en: 'Leaves turn without asking. So can you, quietly.',
    ja: '葉は頼まず色づく。あなたも、静かに。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'halloween-04',
    en: 'Not every shadow is a story. Some are just evening.',
    ja: '影はすべて物語ではない。ただの夕方もある。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'halloween-05',
    en: 'A soft hour before winter. Breath is still yours.',
    ja: '冬の前の、やわらかな時間。息は、まだあなたのもの。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'halloween-06',
    en: 'Costumes pass. The room remembers who sat.',
    ja: '仮装は過ぎる。部屋は、誰が座ったかを覚えている。',
    review: 'ok'
  })
]);

/**
 * @returns {boolean}
 */
export function isHalloweenCorpusOk() {
  return HALLOWEEN_CORPUS.every((line) => line.review === 'ok');
}

/**
 * Deterministic pick for a calendar day (stable across reloads).
 * @param {string} dayIso YYYY-MM-DD
 * @param {readonly SeasonalCopyLine[]} [pool]
 * @returns {SeasonalCopyLine | null}
 */
export function pickHalloweenLineForDay(dayIso, pool = HALLOWEEN_CORPUS) {
  const ok = pool.filter((l) => l.review === 'ok');
  if (!ok.length) return null;
  const raw = String(dayIso || '');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return ok[hash % ok.length] ?? null;
}
