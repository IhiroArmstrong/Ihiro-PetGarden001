/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · New Year / New Year's Eve shared copy pool.
 * Tone: quiet turn of the year / fresh beginning — not countdown FOMO or party hype.
 * Human-authored; review=ok required before contentReady may ship.
 *
 * Four checks (same as Confide): 说教 / 留白 / 越界 / 节奏克制.
 */

/**
 * @typedef {import('./christmasCorpus.js').SeasonalCopyLine} SeasonalCopyLine
 */

/** @type {readonly SeasonalCopyLine[]} */
export const NEW_YEAR_CORPUS = Object.freeze([
  Object.freeze({
    id: 'new-year-01',
    en: 'The year turns without asking. You may turn with it, slowly.',
    ja: '年は頼まず巡る。あなたも、ゆっくり一緒に。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'new-year-02',
    en: 'No countdown required. The next breath is already new.',
    ja: 'カウントダウンは要らない。次の息は、すでに新しい。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'new-year-03',
    en: 'Last page, blank page — Yin stays on the cushion.',
    ja: '終わったページ、白いページ——寅は座布団にいる。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'new-year-04',
    en: 'Midnight is a line on a map. Here, only this sit.',
    ja: '真夜中は地図の線。ここでは、この一坐だけ。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'new-year-05',
    en: 'Carry little. The room is already enough.',
    ja: '少なく持てばいい。部屋は、すでに足りている。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'new-year-06',
    en: 'A quiet threshold. Step when you are ready.',
    ja: '静かな境。準備ができたら、一歩。',
    review: 'ok'
  })
]);

/**
 * @returns {boolean}
 */
export function isNewYearCorpusOk() {
  return NEW_YEAR_CORPUS.every((line) => line.review === 'ok');
}

/**
 * Deterministic pick for a calendar day (stable across reloads).
 * @param {string} dayIso YYYY-MM-DD
 * @param {readonly SeasonalCopyLine[]} [pool]
 * @returns {SeasonalCopyLine | null}
 */
export function pickNewYearLineForDay(dayIso, pool = NEW_YEAR_CORPUS) {
  const ok = pool.filter((l) => l.review === 'ok');
  if (!ok.length) return null;
  const raw = String(dayIso || '');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return ok[hash % ok.length] ?? null;
}
