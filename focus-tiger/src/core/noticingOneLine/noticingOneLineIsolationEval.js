/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { scoreSemanticCrisisVectors } from '../confide/confideSemanticCrisisLayer.js';
import {
  computeVectorCentroid,
  cosineSimilarity
} from '../confide/confideSemanticRouting.js';
import { NOTICING_ONE_LINE_ISOLATION } from './noticingOneLineIsolationThresholds.js';

/**
 * @param {number[][]} vectors
 */
function meanPairwiseCosine(vectors) {
  if (!Array.isArray(vectors) || vectors.length < 2) return 0;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < vectors.length; i += 1) {
    for (let j = i + 1; j < vectors.length; j += 1) {
      sum += cosineSimilarity(vectors[i], vectors[j]);
      count += 1;
    }
  }
  return count ? sum / count : 0;
}

/**
 * @typedef {{
 *   id: string,
 *   calibrationVectors: number[][],
 *   paraphraseVectors?: number[][]
 * }} NoticingOneLineIsolationClassVectors
 */

/**
 * @param {{
 *   classes: NoticingOneLineIsolationClassVectors[],
 *   crisisProtoVectors?: { id: string, vector: number[] }[],
 *   thresholds?: typeof NOTICING_ONE_LINE_ISOLATION
 * }} input
 */
export function evaluateNoticingOneLineIsolation(input) {
  const thresholds = input.thresholds ?? NOTICING_ONE_LINE_ISOLATION;
  /** @type {string[]} */
  const failures = [];
  const classMetrics = [];
  const classes = input.classes || [];

  for (const cls of classes) {
    const nCal = cls.calibrationVectors?.length ?? 0;
    if (nCal < thresholds.minCalibrationPerClass) {
      failures.push(`class:${cls.id}:calibration_count`);
    }
    const nPara = cls.paraphraseVectors?.length ?? 0;
    if (
      cls.id !== thresholds.crisisClassId &&
      nPara < thresholds.minParaphrasePerNonCrisisClass
    ) {
      failures.push(`class:${cls.id}:paraphrase_count`);
    }
    const cohesion = meanPairwiseCosine(cls.calibrationVectors || []);
    classMetrics.push({
      id: cls.id,
      calibrationCount: nCal,
      paraphraseCount: nPara,
      cohesionMeanPairwiseCosine: cohesion,
      cohesionPass: cohesion >= thresholds.cohesionMinMeanPairwiseCosine
    });
    if (cohesion < thresholds.cohesionMinMeanPairwiseCosine) {
      failures.push(`class:${cls.id}:cohesion`);
    }
  }

  /** @type {Array<{ a: string, b: string, centroidCosine: number, maxAllowedCentroidCosine: number, pass: boolean }>} */
  const separations = [];
  for (let i = 0; i < classMetrics.length; i += 1) {
    for (let j = i + 1; j < classMetrics.length; j += 1) {
      const a = classes[i];
      const b = classes[j];
      const centroidA = computeVectorCentroid(a.calibrationVectors);
      const centroidB = computeVectorCentroid(b.calibrationVectors);
      const sepCos =
        centroidA && centroidB ? cosineSimilarity(centroidA, centroidB) : 1;
      const minCohesion = Math.min(
        classMetrics[i].cohesionMeanPairwiseCosine,
        classMetrics[j].cohesionMeanPairwiseCosine
      );
      const maxAllowed = minCohesion - thresholds.separationMarginBelowMinCohesion;
      const sepPass = sepCos <= maxAllowed;
      const pair = {
        a: classMetrics[i].id,
        b: classMetrics[j].id,
        centroidCosine: sepCos,
        maxAllowedCentroidCosine: maxAllowed,
        pass: sepPass
      };
      separations.push(pair);
      if (!sepPass) {
        failures.push(`separation:${pair.a}:${pair.b}`);
      }
    }
  }

  const [critA, critB] = thresholds.productCriticalPair;
  const critical = separations.find(
    (s) =>
      (s.a === critA && s.b === critB) || (s.a === critB && s.b === critA)
  );
  if (!critical) {
    failures.push('separation:hold:invite_sit:missing');
  } else if (!critical.pass) {
    failures.push('separation:hold:invite_sit:product_critical');
  }

  const crisisProtos = input.crisisProtoVectors || [];
  const nonCrisis = classes.filter((c) => c.id !== thresholds.crisisClassId);
  let crisisFalsePositiveHits = 0;
  let crisisScored = 0;
  let crisisMaxNonCrisisCosine = 0;
  for (const cls of nonCrisis) {
    const pool = [
      ...(cls.calibrationVectors || []),
      ...(cls.paraphraseVectors || [])
    ];
    for (const vec of pool) {
      crisisScored += 1;
      const { score } = scoreSemanticCrisisVectors(vec, crisisProtos);
      if (score > crisisMaxNonCrisisCosine) crisisMaxNonCrisisCosine = score;
      if (score >= thresholds.crisisFalsePositiveMaxCosine) {
        crisisFalsePositiveHits += 1;
      }
    }
  }
  const crisisFpPass =
    crisisProtos.length > 0 && crisisFalsePositiveHits === 0 && crisisScored > 0;
  if (crisisProtos.length === 0) {
    failures.push('crisis:prototypes_missing');
  } else if (!crisisFpPass) {
    failures.push('crisis:false_positive');
  }

  return {
    isolationPassed: failures.length === 0,
    failures,
    classes: classMetrics,
    separations,
    productCriticalSeparation: critical || null,
    crisisFalsePositive: {
      scored: crisisScored,
      hits: crisisFalsePositiveHits,
      maxCosine: crisisMaxNonCrisisCosine,
      threshold: thresholds.crisisFalsePositiveMaxCosine,
      pass: crisisFpPass
    }
  };
}

/**
 * @param {ReturnType<typeof evaluateNoticingOneLineIsolation>} report
 */
export function summarizeNoticingOneLineIsolationForExport(report) {
  return {
    brief: NOTICING_ONE_LINE_ISOLATION.brief,
    isolationPassed: Boolean(report.isolationPassed),
    failures: [...(report.failures || [])],
    classes: (report.classes || []).map((c) => ({
      id: c.id,
      calibrationCount: c.calibrationCount,
      paraphraseCount: c.paraphraseCount,
      cohesionMeanPairwiseCosine: c.cohesionMeanPairwiseCosine,
      cohesionPass: c.cohesionPass
    })),
    separations: report.separations || [],
    productCriticalSeparation: report.productCriticalSeparation,
    crisisFalsePositive: report.crisisFalsePositive,
    thresholds: NOTICING_ONE_LINE_ISOLATION
  };
}

/**
 * @param {unknown} json
 */
export function readNoticingOneLineIsolationPassed(json) {
  if (!json || typeof json !== 'object') return false;
  return /** @type {{ isolationPassed?: boolean }} */ (json).isolationPassed === true;
}
