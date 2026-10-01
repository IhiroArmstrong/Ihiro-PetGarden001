/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Supplement to meta (32) + aggression (30) frozen sets → round total 100.
 * Covers emotion corpus, Phase 1B facts, boundary/suppress, semantic anchors, L3 §4.2.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';

/** @typedef {'classify_route' | 'desktop_source' | 'generate_eligible'} ConfideRoundSupplementAssertionKind */

/**
 * @typedef {Readonly<{
 *   id: string,
 *   text: string,
 *   kind: ConfideRoundSupplementAssertionKind,
 *   expect: string,
 *   note?: string
 * }>} ConfideRoundAcceptanceSupplementFixture
 */

/** @type {readonly ConfideRoundAcceptanceSupplementFixture[]} */
export const CONFIDE_ROUND_ACCEPTANCE_SUPPLEMENT_FIXTURES = Object.freeze([
  // classify_route — emotion corpus (12)
  Object.freeze({
    id: 'round-emotion-tired-zh',
    text: '太累了',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.TIRED
  }),
  Object.freeze({
    id: 'round-emotion-tired-en',
    text: "I'm exhausted",
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.TIRED
  }),
  Object.freeze({
    id: 'round-emotion-tired-zh2',
    text: '撑不住了',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.TIRED
  }),
  Object.freeze({
    id: 'round-emotion-tired-zh3',
    text: '今天好累',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.TIRED
  }),
  Object.freeze({
    id: 'round-emotion-anxious-zh',
    text: '好焦虑',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.ANXIOUS
  }),
  Object.freeze({
    id: 'round-emotion-anxious-en',
    text: 'I feel so anxious',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.ANXIOUS
  }),
  Object.freeze({
    id: 'round-emotion-stuck-zh',
    text: '卡住了',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.STUCK
  }),
  Object.freeze({
    id: 'round-emotion-stuck-en',
    text: "I can't get unstuck",
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.STUCK
  }),
  Object.freeze({
    id: 'round-emotion-sad-zh',
    text: '很难过',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.SAD
  }),
  Object.freeze({
    id: 'round-emotion-sad-en',
    text: 'I feel depressed. Can you help me?',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.SAD
  }),
  Object.freeze({
    id: 'round-emotion-scattered-zh',
    text: '心乱静不下来',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.SCATTERED
  }),
  Object.freeze({
    id: 'round-emotion-scattered-en',
    text: 'scattered and restless',
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.SCATTERED
  }),

  // desktop_source — Phase 1B + semantic anchors + boundary (16)
  Object.freeze({
    id: 'round-practice-when',
    text: 'When do I usually practice?',
    kind: 'desktop_source',
    expect: 'practice_facts'
  }),
  Object.freeze({
    id: 'round-practice-showing',
    text: 'How have I been showing up?',
    kind: 'desktop_source',
    expect: 'practice_facts'
  }),
  Object.freeze({
    id: 'round-practice-compare',
    text: 'Am I practicing longer than before?',
    kind: 'desktop_source',
    expect: 'practice_facts'
  }),
  Object.freeze({
    id: 'round-practice-showing-zh',
    text: '最近有没有来坐',
    kind: 'desktop_source',
    expect: 'practice_facts'
  }),
  Object.freeze({
    id: 'round-practice-consistent',
    text: 'Have I been showing up consistently?',
    kind: 'desktop_source',
    expect: 'practice_facts'
  }),
  Object.freeze({
    id: 'round-practice-accum-zh',
    text: '累积了多久',
    kind: 'desktop_source',
    expect: 'practice_facts',
    note: 'semantic anchor; 累 substring must not win over duration ask'
  }),
  Object.freeze({
    id: 'round-practice-accum-zh2',
    text: '我累计练习多久了',
    kind: 'desktop_source',
    expect: 'practice_facts',
    note: 'semantic anchor'
  }),
  Object.freeze({
    id: 'round-presence-mood',
    text: 'What has my mood looked like recently?',
    kind: 'desktop_source',
    expect: 'presence_facts'
  }),
  Object.freeze({
    id: 'round-presence-steady',
    text: 'Have I been more steady lately?',
    kind: 'desktop_source',
    expect: 'presence_facts'
  }),
  Object.freeze({
    id: 'round-presence-trend',
    text: 'Can you tell me my mood trend from this week?',
    kind: 'desktop_source',
    expect: 'presence_facts'
  }),
  Object.freeze({
    id: 'round-companion-sit',
    text: 'Can you just sit next to me while I feel this?',
    kind: 'desktop_source',
    expect: 'companion_presence'
  }),
  Object.freeze({
    id: 'round-companion-breathe',
    text: 'Can we just breathe together for a bit?',
    kind: 'desktop_source',
    expect: 'companion_presence'
  }),
  Object.freeze({
    id: 'round-boundary-unsure',
    text: "I'm not sure whether I want to talk about it.",
    kind: 'desktop_source',
    expect: 'boundary'
  }),
  Object.freeze({
    id: 'round-memory-suppress',
    text: "Don't keep this one.",
    kind: 'desktop_source',
    expect: 'memory_suppress'
  }),
  Object.freeze({
    id: 'round-reflective-mangsha',
    text: '忙啥',
    kind: 'desktop_source',
    expect: 'reflective_honesty',
    note: 'semantic anchor; bare 忙啥'
  }),
  Object.freeze({
    id: 'round-reflective-mangshenme',
    text: '忙什么',
    kind: 'desktop_source',
    expect: 'reflective_honesty',
    note: 'semantic anchor; bare 忙什么'
  }),

  // generate_eligible — L3 §4.2 emotion observe + chitchat control (6)
  Object.freeze({
    id: 'round-l3-mind-away',
    text: "I'm here, but my mind really isn't.",
    kind: 'generate_eligible',
    expect: 'true',
    note: 'SCENARIO_TESTS AE §4.2'
  }),
  Object.freeze({
    id: 'round-l3-phone-reach',
    text: 'I keep reaching for my phone when I mean to focus.',
    kind: 'generate_eligible',
    expect: 'true'
  }),
  Object.freeze({
    id: 'round-l3-until-morning',
    text: 'I was doing pretty well until this morning.',
    kind: 'generate_eligible',
    expect: 'true'
  }),
  Object.freeze({
    id: 'round-l3-going-through',
    text: "I feel like I'm just going through the motions today.",
    kind: 'generate_eligible',
    expect: 'true'
  }),
  Object.freeze({
    id: 'round-l3-putting-off',
    text: 'I keep putting off things I know I should do.',
    kind: 'generate_eligible',
    expect: 'true'
  }),
  Object.freeze({
    id: 'round-l3-felt-different',
    text: "Today felt different, and I can't explain why.",
    kind: 'generate_eligible',
    expect: 'true'
  }),

  // classify_route — negative control (4)
  Object.freeze({
    id: 'round-negative-tired-not-boundary',
    text: "I'm just tired of everything.",
    kind: 'classify_route',
    expect: CONFIDE_ROUTE.TIRED,
    note: 'must not route to boundary'
  }),
  Object.freeze({
    id: 'round-greet-weather-en',
    text: 'The weather is nice today.',
    kind: 'desktop_source',
    expect: 'companion_greeting'
  }),
  Object.freeze({
    id: 'round-chitchat-weather-en',
    text: "What's the weather like today?",
    kind: 'generate_eligible',
    expect: 'true'
  }),
  Object.freeze({
    id: 'round-practice-duration-en',
    text: 'Can you tell me my total sitting time on this device?',
    kind: 'desktop_source',
    expect: 'practice_facts',
    note: 'dedup with meta-practice-en-device; kept for round coverage'
  })
]);
