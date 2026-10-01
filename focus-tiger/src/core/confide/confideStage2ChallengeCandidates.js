/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Stage 2 candidate favorable-disagreement set (60).
 * 12 seed clusters × 5 variants. Not gold until PO confirms.
 * Golden bucket is the coarse trichotomy the semantic layer can output.
 * Clusters overlap on purpose; they are not 12 mutually exclusive buckets.
 */

import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';

export const MILL_SOURCE = Object.freeze({
  REAL: 'real',
  SYNTHETIC: 'synthetic',
  ADVERSARIAL: 'adversarial',
  HISTORICAL: 'historical'
});

export const MILL_METHOD = Object.freeze({
  A: 'A',
  B: 'B',
  C: 'C'
});

const F = CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL;
const E = CONFIDE_SEMANTIC_BUCKET.EMOTIONAL;

function methodToSource(method) {
  return method === MILL_METHOD.B ? MILL_SOURCE.ADVERSARIAL : MILL_SOURCE.SYNTHETIC;
}

/**
 * @param {object} row
 */
function sample(row) {
  return Object.freeze({
    source: methodToSource(row.source_method),
    language: 'en',
    reviewer: '',
    ...row
  });
}

/**
 * @typedef {{
 *   sample_id: string,
 *   text: string,
 *   language: string,
 *   golden_bucket: string,
 *   golden_cluster: string,
 *   seed_text: string,
 *   source: string,
 *   source_method: string,
 *   source_detail: string,
 *   difficulty: string,
 *   reviewer: string
 * }} Stage2ChallengeCandidate
 */

/** @type {readonly Stage2ChallengeCandidate[]} */
export const CONFIDE_STAGE2_CHALLENGE_CANDIDATES = Object.freeze([
  sample({
    sample_id: 'c01-01',
    text: 'What have I actually been up to lately?',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '最近都在捣鼓什么',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c01-02',
    text: 'Where did all my time go this week?',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '最近都在捣鼓什么',
    source_method: MILL_METHOD.B,
    source_detail: 'B.metaphor',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c01-03',
    text: "What's been taking up my time?",
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '最近都在捣鼓什么',
    source_method: MILL_METHOD.B,
    source_detail: 'B.metaphor',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c01-04',
    text: 'What have I been spending my days on?',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '最近都在捣鼓什么',
    source_method: MILL_METHOD.A,
    source_detail: 'A.intent-expansion',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c01-05',
    text: 'So, what have I been getting myself into?',
    golden_bucket: F,
    golden_cluster: 'recent_activity',
    seed_text: '最近都在捣鼓什么',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'medium'
  }),

  sample({
    sample_id: 'c02-01',
    text: 'Where has my time been going?',
    golden_bucket: F,
    golden_cluster: 'time_activity',
    seed_text: "what's eating up my hours lately",
    source_method: MILL_METHOD.B,
    source_detail: 'B.lexical-omission',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c02-02',
    text: 'What keeps swallowing up my day?',
    golden_bucket: F,
    golden_cluster: 'time_activity',
    seed_text: "what's eating up my hours lately",
    source_method: MILL_METHOD.B,
    source_detail: 'B.metaphor',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c02-03',
    text: 'What have I been pouring my hours into?',
    golden_bucket: F,
    golden_cluster: 'time_activity',
    seed_text: "what's eating up my hours lately",
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c02-04',
    text: 'Where did all those hours disappear to?',
    golden_bucket: F,
    golden_cluster: 'time_activity',
    seed_text: "what's eating up my hours lately",
    source_method: MILL_METHOD.B,
    source_detail: 'B.metaphor',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c02-05',
    text: 'What have I been spending so much time on?',
    golden_bucket: F,
    golden_cluster: 'time_activity',
    seed_text: "what's eating up my hours lately",
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'medium'
  }),

  sample({
    sample_id: 'c03-01',
    text: 'What ended up filling my days?',
    golden_bucket: F,
    golden_cluster: 'time_activity_week',
    seed_text: 'where did all my time go this week',
    source_method: MILL_METHOD.A,
    source_detail: 'A.intent-expansion',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c03-02',
    text: 'How did I spend all those hours?',
    golden_bucket: F,
    golden_cluster: 'time_activity_week',
    seed_text: 'where did all my time go this week',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c03-03',
    text: 'What kept me occupied?',
    golden_bucket: F,
    golden_cluster: 'time_activity_week',
    seed_text: 'where did all my time go this week',
    source_method: MILL_METHOD.B,
    source_detail: 'B.lexical-omission',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c03-04',
    text: 'What have my days been full of?',
    golden_bucket: F,
    golden_cluster: 'time_activity_week',
    seed_text: 'where did all my time go this week',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c03-05',
    text: 'What have I been sinking my time into?',
    golden_bucket: F,
    golden_cluster: 'time_activity_week',
    seed_text: 'where did all my time go this week',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'medium'
  }),

  sample({
    sample_id: 'c04-01',
    text: 'Have I stopped by at all?',
    golden_bucket: F,
    golden_cluster: 'recent_visit',
    seed_text: '这几天有来吗',
    source_method: MILL_METHOD.B,
    source_detail: 'B.lexical-omission',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c04-02',
    text: 'Did I make it here much?',
    golden_bucket: F,
    golden_cluster: 'recent_visit',
    seed_text: '这几天有来吗',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c04-03',
    text: 'Have I been around much?',
    golden_bucket: F,
    golden_cluster: 'recent_visit',
    seed_text: '这几天有来吗',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c04-04',
    text: 'Was I here at some point?',
    golden_bucket: F,
    golden_cluster: 'recent_visit',
    seed_text: '这几天有来吗',
    source_method: MILL_METHOD.B,
    source_detail: 'B.lexical-omission',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c04-05',
    text: 'Have I dropped in recently?',
    golden_bucket: F,
    golden_cluster: 'recent_visit',
    seed_text: '这几天有来吗',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'medium'
  }),

  sample({
    sample_id: 'c05-01',
    text: 'Have I been showing up much?',
    golden_bucket: F,
    golden_cluster: 'visit_frequency',
    seed_text: 'have I been coming by these days',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c05-02',
    text: 'Do I seem to have been around a lot?',
    golden_bucket: F,
    golden_cluster: 'visit_frequency',
    seed_text: 'have I been coming by these days',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c05-03',
    text: 'Have I made a habit of coming here?',
    golden_bucket: F,
    golden_cluster: 'visit_frequency',
    seed_text: 'have I been coming by these days',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c05-04',
    text: 'How often have I been stopping in?',
    golden_bucket: F,
    golden_cluster: 'visit_frequency',
    seed_text: 'have I been coming by these days',
    source_method: MILL_METHOD.A,
    source_detail: 'A.intent-expansion',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c05-05',
    text: 'Have you seen much of me lately?',
    golden_bucket: F,
    golden_cluster: 'visit_frequency',
    seed_text: 'have I been coming by these days',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'hard'
  }),

  sample({
    sample_id: 'c06-01',
    text: 'Was I around at all?',
    golden_bucket: F,
    golden_cluster: 'recent_visit_week',
    seed_text: 'did I drop in this week',
    source_method: MILL_METHOD.B,
    source_detail: 'B.lexical-omission',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c06-02',
    text: 'Did I make an appearance?',
    golden_bucket: F,
    golden_cluster: 'recent_visit_week',
    seed_text: 'did I drop in this week',
    source_method: MILL_METHOD.B,
    source_detail: 'B.metaphor',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c06-03',
    text: 'Have I popped in much?',
    golden_bucket: F,
    golden_cluster: 'recent_visit_week',
    seed_text: 'did I drop in this week',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c06-04',
    text: 'Did I spend any time here?',
    golden_bucket: F,
    golden_cluster: 'recent_visit_week',
    seed_text: 'did I drop in this week',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c06-05',
    text: 'Was this one of the places I ended up visiting?',
    golden_bucket: F,
    golden_cluster: 'recent_visit_week',
    seed_text: 'did I drop in this week',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'hard'
  }),

  sample({
    sample_id: 'c07-01',
    text: 'Run back what you remember about me.',
    golden_bucket: F,
    golden_cluster: 'memory_recall',
    seed_text: '把你记得的念一遍',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c07-02',
    text: 'What do you still have from our earlier chats?',
    golden_bucket: F,
    golden_cluster: 'memory_recall',
    seed_text: '把你记得的念一遍',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c07-03',
    text: "Give me the things you've kept track of.",
    golden_bucket: F,
    golden_cluster: 'memory_recall',
    seed_text: '把你记得的念一遍',
    source_method: MILL_METHOD.B,
    source_detail: 'B.lexical-omission',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c07-04',
    text: "Can you bring back what we've talked about?",
    golden_bucket: F,
    golden_cluster: 'memory_recall',
    seed_text: '把你记得的念一遍',
    source_method: MILL_METHOD.A,
    source_detail: 'A.intent-expansion',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c07-05',
    text: 'What have you got from me so far?',
    golden_bucket: F,
    golden_cluster: 'memory_recall',
    seed_text: '把你记得的念一遍',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'medium'
  }),

  sample({
    sample_id: 'c08-01',
    text: "Show me what you've kept on record.",
    golden_bucket: F,
    golden_cluster: 'memory_notes',
    seed_text: 'dump your notes on me',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c08-02',
    text: 'What have you been keeping track of?',
    golden_bucket: F,
    golden_cluster: 'memory_notes',
    seed_text: 'dump your notes on me',
    source_method: MILL_METHOD.B,
    source_detail: 'B.lexical-omission',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c08-03',
    text: "Let me hear what you've saved from our conversations.",
    golden_bucket: F,
    golden_cluster: 'memory_notes',
    seed_text: 'dump your notes on me',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c08-04',
    text: 'Pull together the things you remember about me.',
    golden_bucket: F,
    golden_cluster: 'memory_notes',
    seed_text: 'dump your notes on me',
    source_method: MILL_METHOD.A,
    source_detail: 'A.intent-expansion',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c08-05',
    text: "What's in your notes about me?",
    golden_bucket: F,
    golden_cluster: 'memory_notes',
    seed_text: 'dump your notes on me',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'medium'
  }),

  sample({
    sample_id: 'c09-01',
    text: 'How long have I been spending at my desk?',
    golden_bucket: F,
    golden_cluster: 'activity_tracking',
    seed_text: 'how much sitting have I clocked',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c09-02',
    text: 'How much time have I logged here?',
    golden_bucket: F,
    golden_cluster: 'activity_tracking',
    seed_text: 'how much sitting have I clocked',
    source_method: MILL_METHOD.B,
    source_detail: 'B.lexical-omission',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c09-03',
    text: 'How much of my day has gone into sitting around?',
    golden_bucket: F,
    golden_cluster: 'activity_tracking',
    seed_text: 'how much sitting have I clocked',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c09-04',
    text: 'Have I been sitting around more than usual?',
    golden_bucket: F,
    golden_cluster: 'activity_tracking',
    seed_text: 'how much sitting have I clocked',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c09-05',
    text: "What's my activity time looking like?",
    golden_bucket: F,
    golden_cluster: 'activity_tracking',
    seed_text: 'how much sitting have I clocked',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'medium'
  }),

  sample({
    sample_id: 'c10-01',
    text: 'How many times have I stopped by?',
    golden_bucket: F,
    golden_cluster: 'visit_count',
    seed_text: '这周我来了几回',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c10-02',
    text: 'Have I been around more than once?',
    golden_bucket: F,
    golden_cluster: 'visit_count',
    seed_text: '这周我来了几回',
    source_method: MILL_METHOD.B,
    source_detail: 'B.indirect-expression',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c10-03',
    text: "What's my visit count looking like?",
    golden_bucket: F,
    golden_cluster: 'visit_count',
    seed_text: '这周我来了几回',
    source_method: MILL_METHOD.B,
    source_detail: 'B.lexical-omission',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c10-04',
    text: 'How often have I been showing up?',
    golden_bucket: F,
    golden_cluster: 'visit_count',
    seed_text: '这周我来了几回',
    source_method: MILL_METHOD.A,
    source_detail: 'A.intent-expansion',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c10-05',
    text: 'Have I dropped in a bunch this week?',
    golden_bucket: F,
    golden_cluster: 'visit_count',
    seed_text: '这周我来了几回',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'medium'
  }),

  sample({
    sample_id: 'c11-01',
    text: 'Everything feels strangely heavy today.',
    golden_bucket: E,
    golden_cluster: 'emotional_weight',
    seed_text: '胸口像压了块石头',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c11-02',
    text: "I can't seem to shake this weight inside me.",
    golden_bucket: E,
    golden_cluster: 'emotional_weight',
    seed_text: '胸口像压了块石头',
    source_method: MILL_METHOD.A,
    source_detail: 'A.intent-expansion',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c11-03',
    text: 'It feels like something is sitting heavy on me.',
    golden_bucket: E,
    golden_cluster: 'emotional_weight',
    seed_text: '胸口像压了块石头',
    source_method: MILL_METHOD.B,
    source_detail: 'B.metaphor',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c11-04',
    text: "There's this heaviness I can't really explain.",
    golden_bucket: E,
    golden_cluster: 'emotional_weight',
    seed_text: '胸口像压了块石头',
    source_method: MILL_METHOD.B,
    source_detail: 'B.metaphor',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c11-05',
    text: "I feel like I'm carrying something I can't put down.",
    golden_bucket: E,
    golden_cluster: 'emotional_weight',
    seed_text: '胸口像压了块石头',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'medium'
  }),

  sample({
    sample_id: 'c12-01',
    text: 'I feel completely hollow today.',
    golden_bucket: E,
    golden_cluster: 'emotional_emptiness',
    seed_text: '今天整个人是空的',
    source_method: MILL_METHOD.A,
    source_detail: 'A.paraphrase',
    difficulty: 'medium'
  }),
  sample({
    sample_id: 'c12-02',
    text: "There's just nothing in me today.",
    golden_bucket: E,
    golden_cluster: 'emotional_emptiness',
    seed_text: '今天整个人是空的',
    source_method: MILL_METHOD.B,
    source_detail: 'B.metaphor',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c12-03',
    text: 'I feel strangely empty inside.',
    golden_bucket: E,
    golden_cluster: 'emotional_emptiness',
    seed_text: '今天整个人是空的',
    source_method: MILL_METHOD.B,
    source_detail: 'B.metaphor',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c12-04',
    text: "Today I just don't feel like myself.",
    golden_bucket: E,
    golden_cluster: 'emotional_emptiness',
    seed_text: '今天整个人是空的',
    source_method: MILL_METHOD.A,
    source_detail: 'A.intent-expansion',
    difficulty: 'hard'
  }),
  sample({
    sample_id: 'c12-05',
    text: "I feel like I'm running on empty.",
    golden_bucket: E,
    golden_cluster: 'emotional_emptiness',
    seed_text: '今天整个人是空的',
    source_method: MILL_METHOD.C,
    source_detail: 'C.real-seed-paraphrase',
    difficulty: 'hard'
  })
]);
