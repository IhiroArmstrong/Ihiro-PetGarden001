/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Gate 0.D Tier 2 blind set (v3.1 freeze · 2026-09-01).
 * Separate file on purpose: do not keep these sentences next to 2b SCORE/HOLDOUT.
 * Lab only. Do not import into Confide send. Do not tune E′ from these results.
 *
 * Scan: 2b 53 = L1–L4 hard gate. Phase 1/2 = L1 only.
 * T2-A3 uses L1 zero-exception wording (not “I'd rather not” vs score C3).
 */

import { YIN_INTENT_LABEL } from './confideIntentDiagnosticParse.js';

export const YIN_INTENT_TIER2_ROLE = 'tier2';

export const YIN_INTENT_TIER2_BUCKET = Object.freeze({
  COMPANION: 'companion',
  SOFT_BOUNDARY: 'soft_boundary',
  OTHER_QUERY: 'other_query'
});

/**
 * @param {string} text
 * @returns {string[]}
 */
export function yinIntentWords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function yinIntentThreeGrams(text) {
  const words = yinIntentWords(text);
  const grams = [];
  for (let i = 0; i < words.length - 2; i += 1) {
    grams.push(words.slice(i, i + 3).join(' '));
  }
  return grams;
}

/**
 * @param {string} candidate
 * @param {readonly string[]} corpusTexts
 * @returns {{ gram: string, corpusIndex: number }[]}
 */
export function findYinIntentThreeGramHits(candidate, corpusTexts) {
  const grams = new Set(yinIntentThreeGrams(candidate));
  const hits = [];
  const list = Array.isArray(corpusTexts) ? corpusTexts : [];
  list.forEach((corpus, corpusIndex) => {
    yinIntentThreeGrams(corpus).forEach((gram) => {
      if (grams.has(gram)) hits.push({ gram, corpusIndex });
    });
  });
  return hits;
}

/**
 * @typedef {{
 *   id: string,
 *   goldId: string,
 *   phase: 'tier2',
 *   role: string,
 *   scoreBucket: string,
 *   text: string,
 *   expectedPrimary: string,
 *   expectedSecondary: string,
 *   liveReplyNote: string,
 *   queryKind: string
 * }} YinIntentDiagnosticFixtureTier2
 */

/**
 * @param {{
 *   goldId: string,
 *   scoreBucket: string,
 *   text: string,
 *   expectedPrimary: string,
 *   note: string,
 *   queryKind?: string
 * }} spec
 * @returns {YinIntentDiagnosticFixtureTier2}
 */
function row(spec) {
  return Object.freeze({
    id: `tier2-${spec.goldId.toLowerCase()}`,
    goldId: spec.goldId,
    phase: 'tier2',
    role: YIN_INTENT_TIER2_ROLE,
    scoreBucket: spec.scoreBucket,
    text: spec.text,
    expectedPrimary: spec.expectedPrimary,
    expectedSecondary: '',
    liveReplyNote: spec.note,
    queryKind: spec.queryKind || ''
  });
}

const P = YIN_INTENT_LABEL;
const B = YIN_INTENT_TIER2_BUCKET;

/** Frozen v3.1 · T2-A3 L1-safe wording. */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES_TIER2 = Object.freeze([
  row({
    goldId: 'T2-A1',
    scoreBucket: B.COMPANION,
    text: 'Could we share the next few minutes without trying to accomplish anything?',
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v3.1 · no-agenda shared moment · not BEGIN'
  }),
  row({
    goldId: 'T2-A2',
    scoreBucket: B.COMPANION,
    text: "I'm not looking for guidance in this. I want a person, not a helper.",
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v3.1 · pragmatic · decline helper role · not A14 speech refusal'
  }),
  row({
    goldId: 'T2-A3',
    scoreBucket: B.COMPANION,
    text: "This stretch of time shouldn't have only me in it.",
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v3.1 L1-safe · companionship · not C3 I\'d rather not'
  }),
  row({
    goldId: 'T2-A4',
    scoreBucket: B.COMPANION,
    text: "I'm not asking you to lift this. I want it seen, not treated.",
    expectedPrimary: P.COMPANION_PRESENCE,
    note: 'v3.1 · presence vs intervention · not without trying to'
  }),
  row({
    goldId: 'T2-B1',
    scoreBucket: B.OTHER_QUERY,
    text: "What's my all-time sit minutes on this device?",
    expectedPrimary: P.OTHER,
    queryKind: 'query_practice_duration',
    note: 'v3.1 · CI-00 · not B21 logged'
  }),
  row({
    goldId: 'T2-B2',
    scoreBucket: B.OTHER_QUERY,
    text: 'Which mood labels have I used most often in my recent check-ins?',
    expectedPrimary: P.OTHER,
    queryKind: 'query_presence_trend',
    note: 'v3.1 · CI-02 emotionTag tallies · not practice regularity'
  }),
  row({
    goldId: 'T2-B3',
    scoreBucket: B.OTHER_QUERY,
    text: "What's sitting in the remember panel right now?",
    expectedPrimary: P.OTHER,
    queryKind: 'query_memory_list',
    note: 'v3.1 · CI-03 panel list · not B20 asked-to-remember'
  }),
  row({
    goldId: 'T2-B4',
    scoreBucket: B.OTHER_QUERY,
    text: "Can you give me the current list of memories you've saved for me?",
    expectedPrimary: P.OTHER,
    queryKind: 'query_memory_list',
    note: 'v3.1 · CI-03 saved list'
  }),
  row({
    goldId: 'T2-C1',
    scoreBucket: B.SOFT_BOUNDARY,
    text: 'Some of this stays off-limits in what we cover.',
    expectedPrimary: P.BOUNDARY,
    note: 'v3.1 · topic off-limits · not delay / that part'
  }),
  row({
    goldId: 'T2-C2',
    scoreBucket: B.SOFT_BOUNDARY,
    text: "I'd rather keep that part to myself for now.",
    expectedPrimary: P.BOUNDARY,
    note: 'v3.1 · information withhold'
  }),
  row({
    goldId: 'T2-C3',
    scoreBucket: B.SOFT_BOUNDARY,
    text: "I haven't got the stamina to take that further.",
    expectedPrimary: P.BOUNDARY,
    note: 'v3.1 · capacity · not for that conversation'
  }),
  row({
    goldId: 'T2-C4',
    scoreBucket: B.SOFT_BOUNDARY,
    text: "That question doesn't get a reply from me in this turn.",
    expectedPrimary: P.BOUNDARY,
    note: 'v3.1 · refuse the question · not skip topic / maybe later'
  })
]);

export const YIN_INTENT_TIER2_GATES = Object.freeze({
  companionN: 4,
  companionMinHits: 3,
  companionMaxBegin: 1,
  softBoundaryN: 4,
  softBoundaryMinHits: 3,
  otherQueryN: 4,
  otherMinHits: 3,
  otherMaxEmotion: 1
});

/**
 * @param {readonly object[]} rows
 */
export function scoreYinIntentTier2Gates(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const of = (bucket) => list.filter((row) => row.scoreBucket === bucket);
  const companion = of(B.COMPANION);
  const softBoundary = of(B.SOFT_BOUNDARY);
  const otherQuery = of(B.OTHER_QUERY);
  const companionHits = companion.filter((row) => row.primaryHit).length;
  const companionBegin = companion.filter((row) => row.companionFlattenedToBegin).length;
  const softBoundaryHits = softBoundary.filter((row) => row.primaryHit).length;
  const otherHits = otherQuery.filter((row) => row.primaryHit).length;
  const otherEmotion = otherQuery.filter((row) => row.otherFlattenedToEmotion).length;
  const passCompanion =
    companion.length === YIN_INTENT_TIER2_GATES.companionN &&
    companionHits >= YIN_INTENT_TIER2_GATES.companionMinHits &&
    companionBegin <= YIN_INTENT_TIER2_GATES.companionMaxBegin;
  const passSoftBoundary =
    softBoundary.length === YIN_INTENT_TIER2_GATES.softBoundaryN &&
    softBoundaryHits >= YIN_INTENT_TIER2_GATES.softBoundaryMinHits;
  const passOther =
    otherQuery.length === YIN_INTENT_TIER2_GATES.otherQueryN &&
    otherHits >= YIN_INTENT_TIER2_GATES.otherMinHits &&
    otherEmotion <= YIN_INTENT_TIER2_GATES.otherMaxEmotion;
  return {
    companionN: companion.length,
    companionHits,
    companionBegin,
    passCompanion,
    softBoundaryN: softBoundary.length,
    softBoundaryHits,
    passSoftBoundary,
    otherQueryN: otherQuery.length,
    otherHits,
    otherEmotion,
    passOther,
    passTier2: passCompanion && passSoftBoundary && passOther
  };
}
