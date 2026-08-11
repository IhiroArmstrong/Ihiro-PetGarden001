/**
 * Seasonal Theme · Christmas copy pool (retrieve-not-generate).
 * Tone: quiet winter presence / shared stillness — not Santa commerce or romance.
 * Human-authored; review=ok required before contentReady may ship.
 *
 * Four checks (same as Confide): 说教 / 留白 / 越界 / 节奏克制.
 */

/**
 * @typedef {{
 *   id: string,
 *   en: string,
 *   ja: string,
 *   review: 'ok' | 'draft' | 'pending-reconfirm'
 * }} SeasonalCopyLine
 */

/** @type {readonly SeasonalCopyLine[]} */
export const CHRISTMAS_CORPUS = Object.freeze([
  Object.freeze({
    id: 'christmas-01',
    en: 'Long night. Soft light still finds the room.',
    ja: '長い夜。やわらかい光は、まだ部屋を見つける。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'christmas-02',
    en: 'Quiet holds, whether the day is marked or not.',
    ja: '静けさは、その日に印がなくても、ここにいる。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'christmas-03',
    en: 'Yin sits. The cushion stays warm enough.',
    ja: '寅は坐る。座布団は、まだ温かい。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'christmas-04',
    en: 'A pause in the cold season is still a pause.',
    ja: '寒い季節の一休みも、やはり一休み。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'christmas-05',
    en: 'Snow or no snow — breath is the same.',
    ja: '雪があってもなくても——息は同じ。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'christmas-06',
    en: 'Company without noise. That is enough for now.',
    ja: '騒がしくない同席。今は、それで足りる。',
    review: 'ok'
  })
]);

/**
 * @returns {boolean}
 */
export function isChristmasCorpusOk() {
  return CHRISTMAS_CORPUS.every((line) => line.review === 'ok');
}

/**
 * Deterministic pick for a calendar day (stable across reloads).
 * @param {string} dayIso YYYY-MM-DD
 * @param {readonly SeasonalCopyLine[]} [pool]
 * @returns {SeasonalCopyLine | null}
 */
export function pickChristmasLineForDay(dayIso, pool = CHRISTMAS_CORPUS) {
  const ok = pool.filter((l) => l.review === 'ok');
  if (!ok.length) return null;
  const raw = String(dayIso || '');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return ok[hash % ok.length] ?? null;
}

/**
 * @param {SeasonalCopyLine} line
 * @param {string} [locale]
 * @returns {string}
 */
export function seasonalLineText(line, locale = 'en') {
  if (!line) return '';
  const loc = String(locale || 'en').toLowerCase();
  if (loc.startsWith('ja') && line.ja) return line.ja;
  return line.en || '';
}
