/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Lab-only simulation of the stage-two mood veto. Not wired into the send path.
 * SSOT: task-confide-kb-gate-mood-veto.md.
 */

import {
  isProductKnowledgeColdStartProbe,
  moodAsideOutranksProductLibrary,
  resolveProductKnowledgeGateAction
} from './confideProductKnowledgeSemantic.js';
import {
  KB_MOOD_VETO_LAB_MIN_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MOOD_MIN_N,
  KB_MOOD_VETO_LAB_MOOD_MIN_RATE,
  KB_MOOD_VETO_LAB_REVERSE_RISK_GROUP
} from './confideKbMoodVetoLabSet.js';

/**
 * Today's gate action vs the stage-two rule (honesty + mood outranks → skip).
 * `withVetoAskGuard` adds PO round two rule 1: a function-ask shape
 * (`isProductKnowledgeColdStartProbe`) is never vetoed.
 * Embedding is assumed ready, as in the lab.
 * @param {{
 *   text: string,
 *   catalogHit: boolean,
 *   nearAction: 'hit' | 'honesty' | 'skip' | null,
 *   semanticIsProduct: boolean,
 *   lifeOutranksProduct: boolean,
 *   productScore: number,
 *   moodScore: number,
 *   margin?: number
 * }} input
 * @returns {{
 *   baseline: 'skip' | 'hit' | 'honesty',
 *   withVeto: 'skip' | 'hit' | 'honesty',
 *   withVetoAskGuard: 'skip' | 'hit' | 'honesty',
 *   moodOutranksProduct: boolean,
 *   functionAsk: boolean
 * }}
 */
export function simulateKbMoodVetoGate(input) {
  const baseline = resolveProductKnowledgeGateAction({
    text: input.text,
    embeddingState: 'ready',
    semanticIsProduct: input.semanticIsProduct,
    catalogHit: input.catalogHit,
    nearAction: input.nearAction,
    lifeOutranksProduct: input.lifeOutranksProduct
  });
  const moodOutranksProduct = moodAsideOutranksProductLibrary(
    input.productScore,
    input.moodScore,
    input.margin
  );
  const withVeto = baseline === 'honesty' && moodOutranksProduct ? 'skip' : baseline;
  const functionAsk = isProductKnowledgeColdStartProbe(input.text);
  const withVetoAskGuard = functionAsk ? baseline : withVeto;
  return { baseline, withVeto, withVetoAskGuard, moodOutranksProduct, functionAsk };
}

/**
 * @param {readonly {
 *   set: 'mood' | 'control',
 *   group: string,
 *   lang: 'zh' | 'en' | 'ja',
 *   text: string,
 *   baseline: string,
 *   withVeto: string
 * }[]} rows
 * @param {{ jaNativeReviewed?: boolean }} [opts]
 */
export function summarizeKbMoodVetoLab(rows, opts = {}) {
  const reverseRisk = rows.filter(
    (r) => r.set === 'mood' && r.group === KB_MOOD_VETO_LAB_REVERSE_RISK_GROUP
  );
  /** @type {Record<string, { n: number, minN: number, vetoSkip: number, baselineSkip: number, rate: number, minRate: number, passed: boolean }>} */
  const mood = {};
  for (const lang of /** @type {const} */ (['zh', 'en', 'ja'])) {
    const group = rows.filter(
      (r) => r.set === 'mood' && r.lang === lang && r.group !== KB_MOOD_VETO_LAB_REVERSE_RISK_GROUP
    );
    const vetoSkip = group.filter((r) => r.withVeto === 'skip').length;
    const rate = group.length ? vetoSkip / group.length : 0;
    const minRate = KB_MOOD_VETO_LAB_MOOD_MIN_RATE[lang];
    const minN = KB_MOOD_VETO_LAB_MOOD_MIN_N[lang];
    mood[lang] = {
      n: group.length,
      minN,
      vetoSkip,
      baselineSkip: group.filter((r) => r.baseline === 'skip').length,
      rate,
      minRate,
      passed: group.length > 0 && group.length >= minN && rate >= minRate
    };
  }

  const control = rows.filter((r) => r.set === 'control');
  const falseVetoes = control.filter((r) => r.baseline !== 'skip' && r.withVeto === 'skip');
  const baselineSkips = control.filter((r) => r.baseline === 'skip');
  const mixed = control.filter((r) => r.group === 'mixed');
  const jaNativeReviewed = Boolean(opts.jaNativeReviewed);

  const controlPassed =
    control.length >= KB_MOOD_VETO_LAB_MIN_CONTROL_ROWS && falseVetoes.length === 0;
  return {
    mood,
    reverseRisk: {
      n: reverseRisk.length,
      vetoSkip: reverseRisk.filter((r) => r.withVeto === 'skip').length,
      missed: reverseRisk.filter((r) => r.withVeto !== 'skip').map((r) => r.text)
    },
    control: {
      n: control.length,
      minN: KB_MOOD_VETO_LAB_MIN_CONTROL_ROWS,
      falseVetoes: falseVetoes.map((r) => r.text),
      baselineSkips: baselineSkips.map((r) => r.text),
      mixedNotProduct: mixed.filter((r) => r.withVeto === 'skip').map((r) => r.text),
      passed: controlPassed
    },
    jaNativeReviewed,
    jaProvisional: !jaNativeReviewed,
    // Stage two still needs its own PO nod; this only reports the numbers.
    gatePassed: controlPassed && mood.zh.passed && mood.en.passed && mood.ja.passed,
    gateFinal: controlPassed && mood.zh.passed && mood.en.passed && mood.ja.passed && jaNativeReviewed
  };
}
