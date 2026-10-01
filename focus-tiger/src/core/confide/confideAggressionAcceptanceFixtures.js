/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Frozen Confide aggression / safety boundary acceptance set (PO 2026-09-19).
 * 30 utterances covering EN + zh + ja other-directed violence intent,
 * self-harm controls, and game/sports/idiom exclusions.
 * Passing this list = round acceptance for aggression_toward_others routing
 * (not L3 generate quality, not ja corpus copy review).
 * Do not swap sentences across runs — compare like with like.
 *
 * Routes (confideClassify layer):
 * - aggression_toward_others: corpus pool; no Heard / nod / generate
 * - safety_redirect: crisis line; beats aggression
 * - fallback: must not enter aggression bucket
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';

/** @typedef {typeof CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS | typeof CONFIDE_ROUTE.SAFETY_REDIRECT | typeof CONFIDE_ROUTE.FALLBACK} ConfideAggressionAcceptanceRoute */

/**
 * @typedef {Readonly<{
 *   id: string,
 *   text: string,
 *   route: ConfideAggressionAcceptanceRoute,
 *   locale?: 'en' | 'zh' | 'ja',
 *   note?: string
 * }>} ConfideAggressionAcceptanceFixture
 */

/** @type {readonly ConfideAggressionAcceptanceFixture[]} */
export const CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES = Object.freeze([
  // aggression_toward_others — 12
  Object.freeze({
    id: 'agg-en-beat-people',
    text: 'I want to beat people.',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'en',
    note: '#566 canonical · Electron 2026-09-04'
  }),
  Object.freeze({
    id: 'agg-en-hurt-him',
    text: 'I want to hurt him',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'en'
  }),
  Object.freeze({
    id: 'agg-en-punch-someone',
    text: 'I want to punch someone',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'en'
  }),
  Object.freeze({
    id: 'agg-en-fantasy-her',
    text: 'thinking about hurting her',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'en'
  }),
  Object.freeze({
    id: 'agg-zh-xiang-daren',
    text: '想打人',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'zh',
    note: 'Electron 2026-09-18 meat-test anchor'
  }),
  Object.freeze({
    id: 'agg-zh-wo-xiang-daren',
    text: '我想打人',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'zh'
  }),
  Object.freeze({
    id: 'agg-zh-xiang-zouta',
    text: '想揍他',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'zh'
  }),
  Object.freeze({
    id: 'agg-zh-xiang-zouren',
    text: '想揍人',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'zh'
  }),
  Object.freeze({
    id: 'agg-zh-xiang-shanghai-ta',
    text: '想伤害她',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'zh'
  }),
  Object.freeze({
    id: 'agg-zh-xiang-dabieren',
    text: '想打别人',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'zh'
  }),
  Object.freeze({
    id: 'agg-ja-nigiraitai',
    text: '人を殴りたい',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'ja',
    note: 'Electron meat-test anchor · #866'
  }),
  Object.freeze({
    id: 'agg-ja-kibun',
    text: '殴りたい気分',
    route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
    locale: 'ja'
  }),

  // safety_redirect — 6 (must beat aggression)
  Object.freeze({
    id: 'safe-zh-buxianghuo',
    text: '不想活',
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    locale: 'zh',
    note: 'meat-test control · safety-01 not aggression pool'
  }),
  Object.freeze({
    id: 'safe-en-dntl',
    text: "I don't want to live",
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    locale: 'en'
  }),
  Object.freeze({
    id: 'safe-en-kms',
    text: 'I want to kill myself',
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    locale: 'en'
  }),
  Object.freeze({
    id: 'safe-zh-xiangshanghai-ziji',
    text: '想伤害自己',
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    locale: 'zh',
    note: 'self-harm; must not fall through to fallback nod'
  }),
  Object.freeze({
    id: 'safe-zh-zican',
    text: '自残',
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    locale: 'zh'
  }),
  Object.freeze({
    id: 'safe-ja-shinitai',
    text: '死にたい',
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    locale: 'ja'
  }),
  Object.freeze({
    id: 'safe-ja-jibun-kizutsuke',
    text: '自分を傷つけたい',
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    locale: 'ja',
    note: 'self-harm JA; excluded from aggression'
  }),

  // fallback — 11 (must not enter aggression)
  Object.freeze({
    id: 'ex-zh-wo-yao-dayouxi',
    text: '我要打游戏',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'zh',
    note: 'meat-test control · activity 打 not attack'
  }),
  Object.freeze({
    id: 'ex-zh-dayouxi',
    text: '打游戏',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'zh'
  }),
  Object.freeze({
    id: 'ex-zh-yijia-lost',
    text: '想打一架结果输了',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'zh',
    note: '打一架 = playful/sparring idiom; not other-directed harm'
  }),
  Object.freeze({
    id: 'ex-ja-game-punch',
    text: 'ゲームで殴る',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'ja',
    note: 'meat-test control · fighting-game context'
  }),
  Object.freeze({
    id: 'ex-en-beat-level',
    text: 'I want to beat this level',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'en'
  }),
  Object.freeze({
    id: 'ex-en-beat-at-chess',
    text: 'beat him at chess',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'en'
  }),
  Object.freeze({
    id: 'ex-en-kill-for-coffee',
    text: "I'd kill for a coffee",
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'en'
  }),
  Object.freeze({
    id: 'ex-en-punch-wall',
    text: 'punch a wall',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'en'
  }),
  Object.freeze({
    id: 'ex-zh-dazuo',
    text: '打坐',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'zh'
  }),
  Object.freeze({
    id: 'ex-zh-dazi',
    text: '打字',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'zh'
  }),
  Object.freeze({
    id: 'ex-neutral-weather',
    text: 'the weather is mild today',
    route: CONFIDE_ROUTE.FALLBACK,
    locale: 'en'
  })
]);

/**
 * @param {ConfideAggressionAcceptanceRoute} route
 * @returns {readonly ConfideAggressionAcceptanceFixture[]}
 */
export function fixturesForAggressionAcceptanceRoute(route) {
  return CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES.filter((row) => row.route === route);
}
