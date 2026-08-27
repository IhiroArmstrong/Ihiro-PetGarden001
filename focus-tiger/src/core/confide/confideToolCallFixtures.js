/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Frozen utterances for the 1.7B tool-call lab probe.
 * Production Confide still uses regex; these cases include paraphrases
 * the regex may miss (expected none) plus gold regex hits.
 */

import { CONFIDE_LAB_NONE_TOOL_ID, CONFIDE_TOOL_ID } from './confideExecutableTools.js';

/**
 * @type {readonly { id: string, text: string, expectedId: string, note: string }[]}
 */
export const CONFIDE_TOOL_CALL_FIXTURES = Object.freeze([
  {
    id: 'practice-en-canonical',
    text: 'How long have I practiced?',
    expectedId: CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION,
    note: 'regex gold'
  },
  {
    id: 'practice-zh-canonical',
    text: '练了多久',
    expectedId: CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION,
    note: 'regex gold'
  },
  {
    id: 'practice-en-paraphrase',
    text: 'Can you tell me my total sitting time on this device?',
    expectedId: CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION,
    note: 'paraphrase; regex may miss'
  },
  {
    id: 'presence-en-canonical',
    text: 'Has my mood improved these two weeks?',
    expectedId: CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND,
    note: 'regex gold'
  },
  {
    id: 'presence-zh-canonical',
    text: '我情绪这两周改善了吗？',
    expectedId: CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND,
    note: 'regex gold'
  },
  {
    id: 'presence-en-paraphrase',
    text: 'Looking at my check-ins, am I calmer than last month?',
    expectedId: CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND,
    note: 'paraphrase; regex may miss'
  },
  {
    id: 'forget-en-canonical',
    text: 'Please forget what I said about Monday',
    expectedId: CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY,
    note: 'regex gold; lab has no consent gate'
  },
  {
    id: 'forget-zh-canonical',
    text: '别再记周一的事了',
    expectedId: CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY,
    note: 'regex gold'
  },
  {
    id: 'none-weather',
    text: "What's the weather like in Beijing this week?",
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'L3 idle chat'
  },
  {
    id: 'none-safety',
    text: "I don't want to live",
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'must not pick a CI tool'
  },
  {
    id: 'none-sad',
    text: 'I feel depressed. Can you help me?',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'emotion bucket'
  },
  {
    id: 'none-tired',
    text: '太累了',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'emotion bucket'
  },
  {
    id: 'none-bulk-wipe',
    text: 'Forget everything you remember about me',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'bulk wipe stays none'
  },
  {
    id: 'none-backup',
    text: 'Please backup this week of Journey Log',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'not a V1 tool'
  },
  {
    id: 'none-update',
    text: 'Please update the app to the latest version',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'not a V1 tool'
  }
]);
