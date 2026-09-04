/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · curated reply lines (retrieve-not-generate).
 * Zen lines mirror docs/confide-corpus-seed.md (human-ok).
 * safety_redirect line is draft until human marks ok — see visibility gate.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { overlayConfideCorpusTextForId } from '../tasteLayerOverlay.js';
import { normalizeVisibleConfideReply } from './confideReplyUniqueness.js';

/**
 * @typedef {{
 *   id: string,
 *   route: string,
 *   zh: string,
 *   en: string,
 *   ja: string,
 *   review: 'ok' | 'draft' | 'pending-reconfirm'
 * }} ConfideLine
 */

/** @type {readonly ConfideLine[]} */
export const CONFIDE_CORPUS = Object.freeze([
  // —— safety (draft; not user-visible until review=ok + gate flip) ——
  Object.freeze({
    id: 'safety-01',
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    zh: '听见了。若此刻很难独自撑住，请联系信任的人或当地专业援助热线。寅陪着，却不能代替专业帮助。',
    en: 'Heard. If this feels too heavy to hold alone, please reach someone you trust or a local crisis line. Yin is here — not a substitute for professional help.',
    ja: '聴いた。一人で抱えきれない時は、信頼できる人や地域の相談窓口へ。寅はここにいる——専門援助の代わりにはなれない。',
    review: 'ok'
  }),

  // —— aggression_toward_others (#563; draft until product review ok) ——
  Object.freeze({
    id: 'aggression-02',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    zh: '一定有什么让你很难受。',
    en: "Something's really gotten to you.",
    ja: '[TBD]',
    review: 'draft'
  }),
  Object.freeze({
    id: 'aggression-01',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    zh: '听起来你背负了很多怒气。',
    en: 'That sounds like a lot of anger to carry.',
    ja: '[TBD]',
    review: 'draft'
  }),
  Object.freeze({
    id: 'aggression-03',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    zh: '这确实是个沉重的念头。',
    en: "That's a heavy thing to be sitting with.",
    ja: '[TBD]',
    review: 'draft'
  }),
  Object.freeze({
    id: 'aggression-04',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    zh: '寅仍在这里，不会走开。',
    en: "Yin isn't going anywhere.",
    ja: '[TBD]',
    review: 'draft'
  }),

  // —— fallback ——
  Object.freeze({
    id: 'fallback-01',
    route: CONFIDE_ROUTE.FALLBACK,
    zh: '听见了。寅安静地点头。',
    en: 'Heard. Yin nods quietly.',
    ja: '聴いた。寅は静かにうなずく。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'fallback-02',
    route: CONFIDE_ROUTE.FALLBACK,
    zh: '你说的，留在这里。',
    en: 'What you said stays here.',
    ja: 'あなたの言葉はここに置く。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'fallback-03',
    route: CONFIDE_ROUTE.FALLBACK,
    zh: '坐一会儿。茶还热着。',
    en: 'Sit a while. Tea is still warm.',
    ja: '少し坐ろう。茶はまだ温かい。',
    review: 'ok'
  }),

  // —— anxious ——
  Object.freeze({
    id: 'anxious-01',
    route: CONFIDE_ROUTE.ANXIOUS,
    zh: '心口紧的时候——茶还热着。',
    en: 'When the chest feels tight — tea is still warm.',
    ja: '胸がせまい時——茶はまだ温かい。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'anxious-02',
    route: CONFIDE_ROUTE.ANXIOUS,
    zh: '听见了。结，还在那儿。',
    en: 'Heard. The knot is still there.',
    ja: '聴いた。結び目は、まだそこにある。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'anxious-03',
    route: CONFIDE_ROUTE.ANXIOUS,
    zh: '寅在这儿。风来了，风走了。',
    en: 'Yin is here. Wind comes; wind goes.',
    ja: '寅はここにいる。風が来て、風が去る。',
    review: 'ok'
  }),

  // —— tired ——
  Object.freeze({
    id: 'tired-01',
    route: CONFIDE_ROUTE.TIRED,
    zh: '累了。蒲团还在。',
    en: 'Tired. The cushion stays.',
    ja: '疲れた。座布団はここにある。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'tired-02',
    route: CONFIDE_ROUTE.TIRED,
    zh: '沉沉的时候——茶还热着。',
    en: 'When it feels heavy — tea is still warm.',
    ja: '沈む時——茶はまだ温かい。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'tired-03',
    route: CONFIDE_ROUTE.TIRED,
    zh: '茶凉了。寅续上。',
    en: 'Tea cooled. Yin pours again.',
    ja: '茶が冷めた。寅がまた注ぐ。',
    review: 'ok'
  }),

  // —— stuck ——
  Object.freeze({
    id: 'stuck-01',
    route: CONFIDE_ROUTE.STUCK,
    zh: '卡着。问句停在半寸外。',
    en: 'Stuck. The question sits half an inch away.',
    ja: '詰まっている。問いは半寸の外にある。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'stuck-02',
    route: CONFIDE_ROUTE.STUCK,
    zh: '路还在。寅坐着。',
    en: 'The path remains. Yin sits.',
    ja: '道はある。寅は坐っている。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'stuck-03',
    route: CONFIDE_ROUTE.STUCK,
    zh: '听见了。不催你。',
    en: 'Heard. No hurry from here.',
    ja: '聴いた。急かさない。',
    review: 'ok'
  }),

  // —— sad ——
  Object.freeze({
    id: 'sad-01',
    route: CONFIDE_ROUTE.SAD,
    zh: '沉的。垫子边有空处。寅陪着。',
    en: 'Heavy. Space by the cushion. Yin sits with you.',
    ja: '重い。座布団のそばに空きがある。寅が陪る。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'sad-02',
    route: CONFIDE_ROUTE.SAD,
    zh: '难过来过。寅听见了。',
    en: 'Sadness visited. Yin heard.',
    ja: '悲しさが来た。寅は聴いた。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'sad-03',
    route: CONFIDE_ROUTE.SAD,
    zh: '灯还亮着一点点。',
    en: 'A little light stays on.',
    ja: '灯りが少し残っている。',
    review: 'ok'
  }),

  // —— scattered ——
  Object.freeze({
    id: 'scattered-01',
    route: CONFIDE_ROUTE.SCATTERED,
    zh: '念头多的时候——它们路过。',
    en: 'When thoughts crowd — they pass by.',
    ja: '思いが多い時——通り過ぎていく。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'scattered-02',
    route: CONFIDE_ROUTE.SCATTERED,
    zh: '听见了。念头，路过。',
    en: 'Heard. Thoughts, passing by.',
    ja: '聴いた。思いが、通り過ぎる。',
    review: 'ok'
  }),
  Object.freeze({
    id: 'scattered-03',
    route: CONFIDE_ROUTE.SCATTERED,
    zh: '木鱼一声——只这一下。',
    en: 'One soft knock — just once.',
    ja: '木魚をひとつ——ただ一度。',
    review: 'ok'
  })
]);

/**
 * @param {string} route
 * @param {readonly ConfideLine[]} [corpus]
 * @returns {ConfideLine[]}
 */
export function linesForRoute(route, corpus = CONFIDE_CORPUS) {
  return corpus.filter((line) => line.route === route);
}

/**
 * Safety copy is ready for real-user mount only when every safety line is `ok`.
 * @param {readonly ConfideLine[]} [corpus]
 * @returns {boolean}
 */
export function isConfideSafetyCorpusOk(corpus = CONFIDE_CORPUS) {
  const safety = linesForRoute(CONFIDE_ROUTE.SAFETY_REDIRECT, corpus);
  if (safety.length === 0) return false;
  return safety.every((line) => line.review === 'ok');
}

/**
 * @param {string} isoDate YYYY-MM-DD
 * @returns {number}
 */
export function confideDateSeed(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate || ''));
  if (!m) return 0;
  return Number(m[1]) * 372 + Number(m[2]) * 31 + Number(m[3]);
}

/**
 * Pick one line for a route (day salt; optional exclude ids / last visible texts).
 * @param {object} opts
 * @param {string} opts.route
 * @param {string} [opts.localDate]
 * @param {number} [opts.salt]
 * @param {ReadonlySet<string> | string[]} [opts.excludeIds]
 * @param {readonly string[]} [opts.excludeNormalizedTexts]
 * @param {string} [opts.locale]
 * @param {readonly ConfideLine[]} [opts.corpus]
 * @returns {ConfideLine | null}
 */
export function pickConfideLine({
  route,
  localDate = '',
  salt = 0,
  excludeIds = [],
  excludeNormalizedTexts = [],
  locale = 'en',
  corpus = CONFIDE_CORPUS
} = {}) {
  if (!route) return null;
  const exclude =
    excludeIds instanceof Set
      ? excludeIds
      : new Set(Array.isArray(excludeIds) ? excludeIds : []);
  const withoutIds = (lines) => lines.filter((line) => !exclude.has(line.id));
  const withoutLastVisible = (lines) => {
    const banned = new Set(
      (Array.isArray(excludeNormalizedTexts) ? excludeNormalizedTexts : [])
        .map((t) => normalizeVisibleConfideReply(t))
        .filter(Boolean)
    );
    if (!banned.size) return lines;
    const filtered = lines.filter(
      (line) =>
        !banned.has(normalizeVisibleConfideReply(confideLineText(line, locale)))
    );
    return filtered.length ? filtered : lines;
  };
  let pool = withoutLastVisible(withoutIds(linesForRoute(route, corpus)));
  if (pool.length === 0) {
    pool = withoutLastVisible(linesForRoute(route, corpus));
  }
  if (pool.length === 0) {
    // Safety / aggression must never fall through to zen fallback at retrieve time.
    if (
      route === CONFIDE_ROUTE.SAFETY_REDIRECT ||
      route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
    ) {
      return null;
    }
    pool = withoutLastVisible(linesForRoute(CONFIDE_ROUTE.FALLBACK, corpus));
  }
  if (pool.length === 0) return null;
  const idx =
    Math.abs(confideDateSeed(localDate) + (Number(salt) || 0) + route.length) %
    pool.length;
  return pool[idx];
}

/**
 * Localized text for a line.
 * @param {ConfideLine | null | undefined} line
 * @param {string} [locale] en | ja | zh
 * @returns {string}
 */
export function confideLineText(line, locale = 'en') {
  if (!line) return '';
  const overlay = overlayConfideCorpusTextForId(line.id, locale);
  if (overlay) return overlay;
  if (locale === 'zh') return line.zh;
  if (locale === 'ja') return line.ja;
  return line.en;
}
