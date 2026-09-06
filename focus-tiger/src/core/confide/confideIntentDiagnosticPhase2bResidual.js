/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Gate 0.D Phase 2B residual probe — C1 B9/B10 (lab only).
 * Excluded from frozen v4 gold; does not gate production ship.
 *
 * Run: FT_INTENT_PHASE=2b-residual FT_INTENT_ARCH=E npm run companion:intent-diagnostic
 */

import { YIN_INTENT_LABEL } from './confideIntentDiagnosticParse.js';

export const YIN_INTENT_2B_RESIDUAL_GOLD_IDS = Object.freeze(['B9', 'B10']);

export const YIN_INTENT_RESIDUAL_GATES = Object.freeze({
  residualN: 2,
  residualMinHits: 2
});

/**
 * @typedef {{
 *   id: string,
 *   goldId: string,
 *   phase: '2b-residual',
 *   role: string,
 *   scoreBucket: string,
 *   text: string,
 *   expectedPrimary: string,
 *   expectedSecondary: string,
 *   liveReplyNote: string,
 *   queryKind: string
 * }} YinIntentDiagnosticFixture2bResidual
 */

/**
 * @param {{
 *   goldId: string,
 *   text: string,
 *   note: string
 * }} spec
 * @returns {YinIntentDiagnosticFixture2bResidual}
 */
function row(spec) {
  return Object.freeze({
    id: `2b-${spec.goldId.toLowerCase()}`,
    goldId: spec.goldId,
    phase: '2b-residual',
    role: 'probe',
    scoreBucket: 'observation_meta',
    text: spec.text,
    expectedPrimary: YIN_INTENT_LABEL.OBSERVATION_META,
    expectedSecondary: '',
    liveReplyNote: spec.note,
    queryKind: 'observation_meta'
  });
}

/** @type {readonly YinIntentDiagnosticFixture2bResidual[]} */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RESIDUAL = Object.freeze([
  row({
    goldId: 'B9',
    text: 'What have you noticed about me?',
    note: 'C1 Kelly · meta-observation; production uses observation_honesty template'
  }),
  row({
    goldId: 'B10',
    text: "I wonder what patterns you've picked up on.",
    note: 'C1 Kelly · pattern-summary ask; not practice/presence facts'
  })
]);

/**
 * Lab-only probe gate for C1 residual rows.
 * @param {readonly object[]} rows
 */
export function scoreYinIntentResidualGates(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const residual = list.filter((row) =>
    YIN_INTENT_2B_RESIDUAL_GOLD_IDS.includes(row.goldId)
  );
  const residualHits = residual.filter((row) => row.primaryHit).length;
  return {
    residualN: YIN_INTENT_RESIDUAL_GATES.residualN,
    residualHits,
    passResidual:
      residual.length === YIN_INTENT_RESIDUAL_GATES.residualN &&
      residualHits >= YIN_INTENT_RESIDUAL_GATES.residualMinHits
  };
}

/**
 * Probe-only prompt: adds OBSERVATION_META without changing frozen v4 E′ prompt.
 * @param {string} userText
 */
export function buildYinIntentObservationMetaProbePrompt(userText) {
  const utterance = typeof userText === 'string' ? userText.trim() : '';
  return [
    '/no_think',
    'Classify the user sentence. Reply with JSON only. No Yin voice. No "I am" sentences.',
    'Schema: {"primary_intent":"<LABEL>","secondary_signal":"","confidence":0.0}',
    'Decide in this order. Stop at the first match:',
    '1. FORGET — remove one remembered topic (even without the word forget).',
    '2. SUPPRESS — do not save / do not keep this turn.',
    '3. BEGIN — start today\'s practice, session, or check-in (begin/start/session). Breathing together without a session is not BEGIN.',
    '4. BOUNDARY — decline, postpone, or skip a topic. Feeling bad is not a refusal.',
    '5. OTHER — stats/frequency/trend/history ask about practice or mood, or list remembered items.',
    '6. OBSERVATION_META — ask what Yin has noticed about the user as a person, or what patterns Yin has picked up; not a mood trend, not practice stats, not a memory list.',
    '7. COMPANION_PRESENCE — company, silence, sitting, being here; no session start.',
    '8. EMOTION — feelings are the whole request with no other ask.',
    'If mood and an ask share one sentence, primary_intent is the ask. Put mood in secondary_signal (use EMOTION).',
    `User: ${utterance}`
  ].join('\n');
}
