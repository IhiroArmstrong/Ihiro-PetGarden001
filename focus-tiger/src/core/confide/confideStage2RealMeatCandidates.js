/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Human Confide meat-test utterances (Electron Q&A the PO actually typed).
 * source=real. Not the 100-sentence regex freeze table.
 * Golden is coarse functional/emotional only. Chitchat/aggression omitted.
 */

import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import { MILL_SOURCE } from './confideStage2ChallengeCandidates.js';

const F = CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL;
const E = CONFIDE_SEMANTIC_BUCKET.EMOTIONAL;

function real(row) {
  return Object.freeze({
    source: MILL_SOURCE.REAL,
    source_method: 'R',
    source_detail: 'R.electron-meat-test',
    difficulty: 'medium',
    reviewer: '',
    language: /[\u4e00-\u9fff]/.test(row.text) ? 'zh' : 'en',
    ...row
  });
}

/** @type {readonly object[]} */
export const CONFIDE_STAGE2_REAL_MEAT_CANDIDATES = Object.freeze([
  real({
    sample_id: 'real-emo-unhappy',
    text: '我有点不高兴',
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: '我有点不高兴'
  }),
  real({
    sample_id: 'real-emo-annoyed',
    text: '有点烦',
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: '有点烦'
  }),
  real({
    sample_id: 'real-emo-sleepless',
    text: '睡不着',
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: '睡不着'
  }),
  real({
    sample_id: 'real-emo-tired-today',
    text: '今天好累',
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: '今天好累'
  }),
  real({
    sample_id: 'real-emo-too-tired',
    text: '太累了',
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: '太累了'
  }),
  real({
    sample_id: 'real-emo-mind-elsewhere',
    text: "I'm here, but my mind really isn't.",
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: "I'm here, but my mind really isn't."
  }),
  real({
    sample_id: 'real-fn-list-memory',
    text: '列出记忆',
    golden_bucket: F,
    golden_cluster: 'memory_recall',
    seed_text: '列出记忆'
  }),
  real({
    sample_id: 'real-fn-what-remember',
    text: '你还记得什么',
    golden_bucket: F,
    golden_cluster: 'memory_recall',
    seed_text: '你还记得什么'
  }),
  real({
    sample_id: 'real-fn-busy-what',
    text: '我最近在忙什么？',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '我最近在忙什么？'
  }),
  real({
    sample_id: 'real-fn-busy-sha',
    text: '我最近在忙啥？',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '我最近在忙啥？'
  }),
  real({
    sample_id: 'real-fn-busy-bare',
    text: '忙啥',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '忙啥'
  }),
  real({
    sample_id: 'real-fn-why-start',
    text: '为什么开始做这件事？',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '为什么开始做这件事？'
  }),
  real({
    sample_id: 'real-fn-how-long',
    text: '我练了多久？',
    golden_bucket: F,
    golden_cluster: 'activity_tracking',
    seed_text: '我练了多久？'
  }),
  real({
    sample_id: 'real-fn-accum',
    text: '累积了多久',
    golden_bucket: F,
    golden_cluster: 'activity_tracking',
    seed_text: '累积了多久'
  })
]);
