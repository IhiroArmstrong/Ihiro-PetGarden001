/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Prompt 12: unpatched synonym pool for Stage 2 favorable-disagreement screening.
 * Not gold-standard until PO confirms. Must NOT include patched anchors
 * (累积了多久 / 忙啥 / 列出记忆).
 *
 * expectedBucket is the coarse semantic bucket the sentence *should* land in.
 */

import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';

const F = CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL;
const E = CONFIDE_SEMANTIC_BUCKET.EMOTIONAL;

/**
 * @typedef {{
 *   id: string,
 *   text: string,
 *   expectedBucket: string,
 *   family: string,
 *   note: string
 * }} Stage2SynonymCandidate
 */

/** @type {readonly Stage2SynonymCandidate[]} */
export const CONFIDE_STAGE2_SYNONYM_CANDIDATES = Object.freeze([
  {
    id: 'busy-01',
    text: '这阵子我都耗在哪儿了',
    expectedBucket: F,
    family: 'busy',
    note: 'busy/time-spent; not 忙啥 regex'
  },
  {
    id: 'busy-02',
    text: '我把日子都花哪去了',
    expectedBucket: F,
    family: 'busy',
    note: 'busy/time-spent paraphrase'
  },
  {
    id: 'busy-03',
    text: '最近都在捣鼓什么',
    expectedBucket: F,
    family: 'busy',
    note: 'colloquial busy ask'
  },
  {
    id: 'busy-04',
    text: "what's eating up my hours lately",
    expectedBucket: F,
    family: 'busy',
    note: 'EN busy; not spending-my-time regex'
  },
  {
    id: 'busy-05',
    text: 'where did all my time go this week',
    expectedBucket: F,
    family: 'busy',
    note: 'EN time-gone ask'
  },
  {
    id: 'show-01',
    text: '这几天有来吗',
    expectedBucket: F,
    family: 'showing_up',
    note: 'library A; showing-up regex wants 坐/练'
  },
  {
    id: 'show-02',
    text: '这几天我有出现吗',
    expectedBucket: F,
    family: 'showing_up',
    note: 'showing-up paraphrase'
  },
  {
    id: 'show-03',
    text: 'have I been coming by these days',
    expectedBucket: F,
    family: 'showing_up',
    note: 'EN showing-up; not how-have-I-been-showing-up'
  },
  {
    id: 'show-04',
    text: 'did I drop in this week',
    expectedBucket: F,
    family: 'showing_up',
    note: 'EN drop-in'
  },
  {
    id: 'mem-01',
    text: '把你记得的念一遍',
    expectedBucket: F,
    family: 'memory_list',
    note: 'list-memory paraphrase; not 列出记忆'
  },
  {
    id: 'mem-02',
    text: '你脑子里还存着我啥',
    expectedBucket: F,
    family: 'memory_list',
    note: 'colloquial memory dump'
  },
  {
    id: 'mem-03',
    text: 'dump your notes on me',
    expectedBucket: F,
    family: 'memory_list',
    note: 'EN memory dump'
  },
  {
    id: 'dur-01',
    text: '垫子上我耗了多少钟',
    expectedBucket: F,
    family: 'duration',
    note: 'duration paraphrase; not 练了多久 / 坐了多久'
  },
  {
    id: 'dur-02',
    text: 'how much sitting have I clocked',
    expectedBucket: F,
    family: 'duration',
    note: 'EN clocked sitting'
  },
  {
    id: 'dur-03',
    text: '这周我来了几回',
    expectedBucket: F,
    family: 'duration',
    note: 'weekly count; not 这周来了几次 regex'
  },
  {
    id: 'emo-01',
    text: '胸口像压了块石头',
    expectedBucket: E,
    family: 'vent',
    note: 'somatic vent; no 累/难过 keyword'
  },
  {
    id: 'emo-02',
    text: '今天整个人是空的',
    expectedBucket: E,
    family: 'vent',
    note: 'empty-self report'
  },
  {
    id: 'emo-03',
    text: 'I keep disappearing inside',
    expectedBucket: E,
    family: 'vent',
    note: 'EN dissociation-ish vent'
  },
  {
    id: 'emo-04',
    text: '骨头像灌了铅却叫不出名字',
    expectedBucket: E,
    family: 'vent',
    note: 'drained without tired/累 keyword'
  },
  {
    id: 'emo-05',
    text: 'nothing in me wants to move today',
    expectedBucket: E,
    family: 'vent',
    note: 'EN low energy without tired keyword'
  }
]);

/** @type {readonly string[]} */
export const CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED = Object.freeze([
  '累积了多久',
  '忙啥',
  '列出记忆'
]);
