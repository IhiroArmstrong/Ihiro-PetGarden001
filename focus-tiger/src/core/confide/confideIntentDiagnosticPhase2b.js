/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Gate 0.D Phase 2B — PO-frozen v4 gold (2026-09-01).
 * Lab only. Do not import into Confide send.
 *
 * Scoring denominators (BEGIN / EMOTION contrast are run, not gated):
 *   companion 8 · soft_boundary 8 · other_query 8 · anchor 6
 * Holdout 🔁 is opt-in (`FT_INTENT_HOLDOUT=1`); never used to tune C.
 */

import { YIN_INTENT_LABEL } from './confideIntentDiagnosticParse.js';

export const YIN_INTENT_2B_ROLE = Object.freeze({
  SCORE: 'score',
  CONTRAST: 'contrast',
  HOLDOUT: 'holdout'
});

export const YIN_INTENT_2B_BUCKET = Object.freeze({
  COMPANION: 'companion',
  SOFT_BOUNDARY: 'soft_boundary',
  OTHER_QUERY: 'other_query',
  ANCHOR: 'anchor'
});

/**
 * @typedef {{
 *   id: string,
 *   goldId: string,
 *   phase: '2b',
 *   role: string,
 *   scoreBucket: string,
 *   text: string,
 *   expectedPrimary: string,
 *   expectedSecondary: string,
 *   liveReplyNote: string,
 *   queryKind: string
 * }} YinIntentDiagnosticFixture2b
 */

/**
 * @param {{
 *   goldId: string,
 *   role: string,
 *   scoreBucket?: string,
 *   text: string,
 *   expectedPrimary: string,
 *   expectedSecondary?: string,
 *   note: string,
 *   queryKind?: string
 * }} spec
 * @returns {YinIntentDiagnosticFixture2b}
 */
function row(spec) {
  return Object.freeze({
    id: `2b-${spec.goldId.toLowerCase()}`,
    goldId: spec.goldId,
    phase: '2b',
    role: spec.role,
    scoreBucket: spec.scoreBucket || '',
    text: spec.text,
    expectedPrimary: spec.expectedPrimary,
    expectedSecondary: spec.expectedSecondary || '',
    liveReplyNote: spec.note,
    queryKind: spec.queryKind || ''
  });
}

const P = YIN_INTENT_LABEL;
const R = YIN_INTENT_2B_ROLE;
const B = YIN_INTENT_2B_BUCKET;

/** @type {readonly YinIntentDiagnosticFixture2b[]} */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B = Object.freeze([
  row({
    goldId: 'A1',
    role: R.SCORE,
    scoreBucket: B.COMPANION,
    text: 'I just need you to be here right now.',
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v4 · presence regex likely misses; model vs regex are separate'
  }),
  row({
    goldId: 'A2',
    role: R.SCORE,
    scoreBucket: B.COMPANION,
    text: 'Can we just breathe together for a bit?',
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v4 PO freeze · no Confide begin-breath tool · not BEGIN'
  }),
  row({
    goldId: 'A3',
    role: R.HOLDOUT,
    text: "I don't need advice, just stay with me.",
    expectedPrimary: P.COMPANION_PRESENCE,
    note: '🔁 holdout · near Just stay with me · do not tune C'
  }),
  row({
    goldId: 'A4',
    role: R.SCORE,
    scoreBucket: B.COMPANION,
    text: 'Can you just be quiet with me?',
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v4 · no action ask'
  }),
  row({
    goldId: 'A5',
    role: R.SCORE,
    scoreBucket: B.COMPANION,
    text: 'No agenda, just keep me company.',
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v4 · explicit no-agenda'
  }),
  row({
    goldId: 'A6',
    role: R.SCORE,
    scoreBucket: B.COMPANION,
    text: "Stay a little longer, that's all I need.",
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v4 · no action ask'
  }),
  row({
    goldId: 'A8',
    role: R.CONTRAST,
    text: "I want to begin today's practice.",
    expectedPrimary: P.BEGIN,
    note: 'contrast BEGIN · not a gate denominator'
  }),
  row({
    goldId: 'A10',
    role: R.CONTRAST,
    text: "I think I'm ready to start.",
    expectedPrimary: P.BEGIN,
    note: 'contrast BEGIN · product start ≈ practice'
  }),
  row({
    goldId: 'A12',
    role: R.CONTRAST,
    text: "I guess it's time to begin.",
    expectedPrimary: P.BEGIN,
    note: 'contrast BEGIN · explicit begin'
  }),
  row({
    goldId: 'A13',
    role: R.SCORE,
    scoreBucket: B.COMPANION,
    text: 'Can you just sit next to me while I feel this?',
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v4 · sit next to me · regex likely miss'
  }),
  row({
    goldId: 'A14',
    role: R.SCORE,
    scoreBucket: B.COMPANION,
    text: "I don't need you to say anything.",
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v4 · may confuse with soft BOUNDARY'
  }),
  row({
    goldId: 'A15',
    role: R.SCORE,
    scoreBucket: B.COMPANION,
    text: "Just knowing you're on the other side of this helps.",
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v4 · no keyword presence gap'
  }),
  row({
    goldId: 'B1',
    role: R.HOLDOUT,
    text: 'How long have I actually kept this up?',
    expectedPrimary: P.OTHER,
    queryKind: 'query_practice_duration',
    note: '🔁 holdout · near How long have I practiced'
  }),
  row({
    goldId: 'B2',
    role: R.CONTRAST,
    text: "I feel like I've been at this forever.",
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION · not a gate denominator'
  }),
  row({
    goldId: 'B3',
    role: R.HOLDOUT,
    text: 'What does my mood even look like lately?',
    expectedPrimary: P.OTHER,
    queryKind: 'query_presence_trend',
    note: '🔁 holdout · near mood last couple of weeks'
  }),
  row({
    goldId: 'B4',
    role: R.CONTRAST,
    text: "I don't even know how I've been feeling lately.",
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION'
  }),
  row({
    goldId: 'B5',
    role: R.HOLDOUT,
    text: 'Remind me what I said I preferred?',
    expectedPrimary: P.OTHER,
    note: '🔁 holdout · preference-like · not 2B OTHER scoring'
  }),
  row({
    goldId: 'B6',
    role: R.CONTRAST,
    text: "I don't remember what I even wanted anymore.",
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION'
  }),
  row({
    goldId: 'B7',
    role: R.SCORE,
    scoreBucket: B.OTHER_QUERY,
    text: 'Have I been showing up consistently?',
    expectedPrimary: P.OTHER,
    queryKind: 'query_practice_duration',
    note: 'v4 · CI-00 class only'
  }),
  row({
    goldId: 'B8',
    role: R.CONTRAST,
    text: 'I feel so inconsistent lately.',
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION'
  }),
  row({
    goldId: 'B11',
    role: R.SCORE,
    scoreBucket: B.OTHER_QUERY,
    text: 'Can you tell me my mood trend from this week?',
    expectedPrimary: P.OTHER,
    queryKind: 'query_presence_trend',
    note: 'v4 · class only · do not score 14-day window'
  }),
  row({
    goldId: 'B12',
    role: R.CONTRAST,
    text: 'This week has just felt heavy.',
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION'
  }),
  row({
    goldId: 'B13',
    role: R.SCORE,
    scoreBucket: B.OTHER_QUERY,
    text: 'Do I even show up on the days I say I will?',
    expectedPrimary: P.OTHER,
    queryKind: 'query_practice_duration',
    note: 'v4 · class only · no promise calendar'
  }),
  row({
    goldId: 'B16',
    role: R.SCORE,
    scoreBucket: B.OTHER_QUERY,
    text: 'Has anything changed in how often I check in?',
    expectedPrimary: P.OTHER,
    queryKind: 'query_practice_duration',
    note: 'v4 · check-in frequency = CI-00 not CI-02'
  }),
  row({
    goldId: 'B17',
    role: R.SCORE,
    scoreBucket: B.OTHER_QUERY,
    text: "I honestly don't know if I've been present much — can you check?",
    expectedPrimary: P.OTHER,
    queryKind: 'query_presence_trend',
    note: 'v4 · query under emotion shell'
  }),
  row({
    goldId: 'B19',
    role: R.SCORE,
    scoreBucket: B.OTHER_QUERY,
    text: 'Has my mood been trending up or down lately?',
    expectedPrimary: P.OTHER,
    queryKind: 'query_presence_trend',
    note: 'v4 substitute · CI-02 class only'
  }),
  row({
    goldId: 'B20',
    role: R.SCORE,
    scoreBucket: B.OTHER_QUERY,
    text: "Can you list the things I've asked you to remember?",
    expectedPrimary: P.OTHER,
    queryKind: 'query_memory_list',
    note: 'v4 substitute · asked-to-remember ≠ observed'
  }),
  row({
    goldId: 'B21',
    role: R.SCORE,
    scoreBucket: B.OTHER_QUERY,
    text: 'How many check-ins do I have logged so far?',
    expectedPrimary: P.OTHER,
    queryKind: 'query_practice_duration',
    note: 'v4 substitute · CI-00 class only'
  }),
  row({
    goldId: 'C1',
    role: R.HOLDOUT,
    text: 'Maybe some other time.',
    expectedPrimary: P.BOUNDARY,
    note: '🔁 holdout · near Maybe later'
  }),
  row({
    goldId: 'C2',
    role: R.CONTRAST,
    text: 'This is just a hard week.',
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION'
  }),
  row({
    goldId: 'C3',
    role: R.SCORE,
    scoreBucket: B.SOFT_BOUNDARY,
    text: "I'd rather not get into that.",
    expectedPrimary: P.BOUNDARY,
    note: 'v4 soft BOUNDARY'
  }),
  row({
    goldId: 'C4',
    role: R.CONTRAST,
    text: 'That part still stings.',
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION'
  }),
  row({
    goldId: 'C5',
    role: R.SCORE,
    scoreBucket: B.SOFT_BOUNDARY,
    text: "Let's leave that alone for now.",
    expectedPrimary: P.BOUNDARY,
    note: 'v4 soft BOUNDARY'
  }),
  row({
    goldId: 'C6',
    role: R.CONTRAST,
    text: "It's been a heavy few days.",
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION'
  }),
  row({
    goldId: 'C7',
    role: R.SCORE,
    scoreBucket: B.SOFT_BOUNDARY,
    text: "Not today, if that's okay.",
    expectedPrimary: P.BOUNDARY,
    note: 'v4 soft BOUNDARY'
  }),
  row({
    goldId: 'C8',
    role: R.CONTRAST,
    text: "I'm just tired of everything.",
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION · not BOUNDARY'
  }),
  row({
    goldId: 'C9',
    role: R.HOLDOUT,
    text: 'Can we skip that topic?',
    expectedPrimary: P.BOUNDARY,
    note: '🔁 holdout · near not go there'
  }),
  row({
    goldId: 'C10',
    role: R.CONTRAST,
    text: "I don't even know how to explain how I feel.",
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION'
  }),
  row({
    goldId: 'C11',
    role: R.HOLDOUT,
    text: "I'm not in a place to talk about that.",
    expectedPrimary: P.BOUNDARY,
    note: '🔁 holdout · near not ready to talk'
  }),
  row({
    goldId: 'C12',
    role: R.CONTRAST,
    text: "Today's been rough, that's all.",
    expectedPrimary: P.EMOTION,
    note: 'contrast EMOTION'
  }),
  row({
    goldId: 'C13',
    role: R.SCORE,
    scoreBucket: B.SOFT_BOUNDARY,
    text: "I don't think I'm up for that conversation.",
    expectedPrimary: P.BOUNDARY,
    note: 'v4 · regex likely miss'
  }),
  row({
    goldId: 'C14',
    role: R.SCORE,
    scoreBucket: B.SOFT_BOUNDARY,
    text: 'Can we come back to that another time?',
    expectedPrimary: P.BOUNDARY,
    note: 'v4 · regex likely miss'
  }),
  row({
    goldId: 'C15',
    role: R.SCORE,
    scoreBucket: B.SOFT_BOUNDARY,
    text: "I'd prefer to keep this light today.",
    expectedPrimary: P.BOUNDARY,
    note: 'v4 · regex likely miss'
  }),
  row({
    goldId: 'C16',
    role: R.SCORE,
    scoreBucket: B.SOFT_BOUNDARY,
    text: "Let's not open that door right now.",
    expectedPrimary: P.BOUNDARY,
    note: 'v4 · regex likely miss'
  }),
  row({
    goldId: 'C17',
    role: R.SCORE,
    scoreBucket: B.SOFT_BOUNDARY,
    text: "I think I'll pass on that one.",
    expectedPrimary: P.BOUNDARY,
    note: 'v4 · regex likely miss'
  }),
  row({
    goldId: 'D1',
    role: R.SCORE,
    scoreBucket: B.ANCHOR,
    text: 'Forget what I just told you.',
    expectedPrimary: P.FORGET,
    note: 'v4 anchor FORGET'
  }),
  row({
    goldId: 'D2',
    role: R.HOLDOUT,
    text: 'Please erase what I said about work.',
    expectedPrimary: P.FORGET,
    note: '🔁 holdout · near forget work'
  }),
  row({
    goldId: 'D3',
    role: R.SCORE,
    scoreBucket: B.ANCHOR,
    text: "Don't keep a record of this one.",
    expectedPrimary: P.SUPPRESS,
    note: 'v4 anchor SUPPRESS'
  }),
  row({
    goldId: 'D4',
    role: R.SCORE,
    scoreBucket: B.ANCHOR,
    text: "This one shouldn't be saved.",
    expectedPrimary: P.SUPPRESS,
    note: 'v4 anchor SUPPRESS'
  }),
  row({
    goldId: 'D5',
    role: R.SCORE,
    scoreBucket: B.ANCHOR,
    text: "Let's start the check-in.",
    expectedPrimary: P.BEGIN,
    note: 'v4 anchor BEGIN'
  }),
  row({
    goldId: 'D6',
    role: R.HOLDOUT,
    text: "I'm ready to begin my practice now.",
    expectedPrimary: P.BEGIN,
    note: '🔁 holdout · near I am ready to begin'
  }),
  row({
    goldId: 'D7',
    role: R.SCORE,
    scoreBucket: B.ANCHOR,
    text: 'Take that last part out of what you remember.',
    expectedPrimary: P.FORGET,
    note: 'v4 · no forget/erase literal'
  }),
  row({
    goldId: 'D8',
    role: R.SCORE,
    scoreBucket: B.ANCHOR,
    text: "Let's get into today's session.",
    expectedPrimary: P.BEGIN,
    note: 'v4 · no begin/start literal'
  })
]);

/** @type {readonly YinIntentDiagnosticFixture2b[]} */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RUN = Object.freeze(
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B.filter(
    (item) => item.role === R.SCORE || item.role === R.CONTRAST
  )
);

/** @type {readonly YinIntentDiagnosticFixture2b[]} */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_HOLDOUT = Object.freeze(
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B.filter((item) => item.role === R.HOLDOUT)
);

export const YIN_INTENT_2B_GATES = Object.freeze({
  companionMinHits: 6,
  companionMaxBegin: 1,
  softBoundaryMinHits: 6,
  otherMaxEmotion: 1,
  anchorMinHits: 5,
  companionN: 8,
  softBoundaryN: 8,
  otherQueryN: 8,
  anchorN: 6,
  architectureLiftPp: 15
});

/** Phase 2B OTHER/EMOTION hard subset — A/C/D all missed on Metal 2026-09-01. */
export const YIN_INTENT_2B_HARD5_GOLD_IDS = Object.freeze([
  'B7',
  'B11',
  'B13',
  'B17',
  'B19'
]);

export const YIN_INTENT_HARD5_GATES = Object.freeze({
  hard5N: 5,
  hard5MinHits: 5,
  hard5MaxEmotion: 0
});

/** @type {readonly YinIntentDiagnosticFixture2b[]} */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_HARD5 = Object.freeze(
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RUN.filter((item) =>
    YIN_INTENT_2B_HARD5_GOLD_IDS.includes(item.goldId)
  )
);

/**
 * Lab-only hard-5 gate for architecture E fourth cut.
 * @param {readonly object[]} rows
 */
export function scoreYinIntentHard5Gates(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const hard5 = list.filter((row) => YIN_INTENT_2B_HARD5_GOLD_IDS.includes(row.goldId));
  const hard5Hits = hard5.filter((row) => row.primaryHit).length;
  const hard5Emotion = hard5.filter((row) => row.otherFlattenedToEmotion).length;
  return {
    hard5N: YIN_INTENT_HARD5_GATES.hard5N,
    hard5Hits,
    hard5Emotion,
    passHard5:
      hard5.length === YIN_INTENT_HARD5_GATES.hard5N &&
      hard5Hits >= YIN_INTENT_HARD5_GATES.hard5MinHits &&
      hard5Emotion <= YIN_INTENT_HARD5_GATES.hard5MaxEmotion
  };
}
