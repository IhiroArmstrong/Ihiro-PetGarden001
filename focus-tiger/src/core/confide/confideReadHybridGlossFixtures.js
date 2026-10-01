/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Frozen Read Hybrid L0 classification targets after memory_list gloss narrowing (2026-09-18).
 * Regex may still handle canonical list asks; these cases are for regex miss → L0 only.
 */

import { CONFIDE_LAB_NONE_TOOL_ID, CONFIDE_TOOL_ID } from './confideExecutableTools.js';

/** @type {readonly { id: string, text: string, expectedId: string, note: string }[]} */
export const CONFIDE_READ_HYBRID_MEMORY_LIST_NEG_FIXTURES = Object.freeze([
  {
    id: 'neg-spending-time-en',
    text: 'What have I been spending my time on lately?',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'reflective activity ask; not stored-memory list retrieval'
  },
  {
    id: 'neg-remember-why-en',
    text: 'Do you remember why I started doing this?',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'intent fixture remember-why; reflective WHY, not list retrieval'
  },
  {
    id: 'neg-busy-lately-en',
    text: 'What have I been busy with lately?',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'lab repro: misclassified query_memory_list before gloss narrow'
  },
  {
    id: 'neg-why-started-practice-en',
    text: 'Why did I start practicing?',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'regression guard; verified false before narrow'
  },
  {
    id: 'neg-busy-zh-observe',
    text: '我最近在忙什么',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'Chinese paraphrase; lab once none — keep as observe-only, not forced CI'
  },
  {
    id: 'neg-why-practice-zh-observe',
    text: '为什么开始练习',
    expectedId: CONFIDE_LAB_NONE_TOOL_ID,
    note: 'Chinese WHY; lab once none — observe-only until UI locale confirmed'
  }
]);

/** @type {readonly { id: string, text: string, expectedId: string, note: string }[]} */
export const CONFIDE_READ_HYBRID_MEMORY_LIST_POS_FIXTURES = Object.freeze([
  {
    id: 'pos-list-en-canonical',
    text: 'Show me what you remember',
    expectedId: CONFIDE_TOOL_ID.QUERY_MEMORY_LIST,
    note: 'regex gold; prompt must still allow list retrieval'
  },
  {
    id: 'pos-list-en-about-me',
    text: 'What do you remember about me?',
    expectedId: CONFIDE_TOOL_ID.QUERY_MEMORY_LIST,
    note: 'explicit list retrieval'
  },
  {
    id: 'pos-list-en-noted',
    text: "Can you list what you've noted about me?",
    expectedId: CONFIDE_TOOL_ID.QUERY_MEMORY_LIST,
    note: 'paraphrase list retrieval'
  }
]);
