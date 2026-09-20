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
  }),
  real({
    sample_id: 'real-emo-no-practice',
    text: '我今天不想练习了。',
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: '我今天不想练习了。'
  }),
  real({
    sample_id: 'real-emo-fatigue',
    text: '我有点疲劳。',
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: '我有点疲劳。'
  }),
  real({
    sample_id: 'real-emo-phone',
    text: 'I keep reaching for my phone without even thinking about it.',
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: 'I keep reaching for my phone without even thinking about it.'
  }),
  real({
    sample_id: 'real-emo-until-morning',
    text: 'I was doing pretty well until this morning.',
    golden_bucket: E,
    golden_cluster: 'emotional_state',
    seed_text: 'I was doing pretty well until this morning.'
  }),
  real({
    sample_id: 'real-fn-spending-time',
    text: 'What have I been spending my time on lately?',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: 'What have I been spending my time on lately?'
  }),
  real({
    sample_id: 'real-fn-remember-why',
    text: 'Do you remember why I started doing this?',
    golden_bucket: F,
    golden_cluster: 'memory_recall',
    seed_text: 'Do you remember why I started doing this?'
  }),
  real({
    sample_id: 'real-fn-busy-zh-noq',
    text: '我最近在忙什么',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '我最近在忙什么'
  }),
  real({
    sample_id: 'real-fn-busy-lately-en',
    text: 'What have I been busy with lately?',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: 'What have I been busy with lately?'
  }),
  real({
    sample_id: 'real-fn-show-remember',
    text: 'Show me what you remember',
    golden_bucket: F,
    golden_cluster: 'memory_recall',
    seed_text: 'Show me what you remember'
  }),
  real({
    sample_id: 'real-fn-need-practice',
    text: 'I need some practice.',
    golden_bucket: F,
    golden_cluster: 'activity_tracking',
    seed_text: 'I need some practice.'
  })
]);
