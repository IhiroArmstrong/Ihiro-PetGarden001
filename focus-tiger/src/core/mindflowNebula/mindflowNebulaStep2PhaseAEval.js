/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  cosineSimilarity,
  computeVectorCentroid
} from '../confide/confideSemanticRouting.js';
import { MINDFLOW_NEBULA_STEP2_PHASE_A } from './mindflowNebulaStep2Thresholds.js';
import {
  euclidean2,
  pcaProject2D,
  percentile,
  projectVectorWithPcaBasis,
  zScoreColumns2D
} from './mindflowNebulaStep2Pca.js';

/**
 * @param {number[][]} coords
 * @param {number[][]} reference
 */
function zScoreUsingReference(coords, reference) {
  const xs = reference.map((c) => c[0]);
  const ys = reference.map((c) => c[1]);
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
  const stdX =
    Math.sqrt(xs.reduce((a, x) => a + (x - meanX) ** 2, 0) / xs.length) || 1;
  const stdY =
    Math.sqrt(ys.reduce((a, y) => a + (y - meanY) ** 2, 0) / ys.length) || 1;
  return coords.map(([x, y]) => [(x - meanX) / stdX, (y - meanY) / stdY]);
}

/**
 * @param {number[][]} vectors
 */
function meanPairwiseCosine(vectors) {
  if (vectors.length < 2) return 0;
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
 * @param {number[][]} coords2d
 * @param {number[]} centroid2d
 */
function distancesToCentroid(coords2d, centroid2d) {
  return coords2d.map((c) => euclidean2(c, centroid2d));
}

/**
 * @param {number[][]} coords2d z-scored plane
 * @param {number[][]} boardCentroids2d
 */
function nearestBoardDistance(coord, boardCentroids2d) {
  let best = Infinity;
  for (const c of boardCentroids2d) {
    const d = euclidean2(coord, c);
    if (d < best) best = d;
  }
  return best;
}

/**
 * @typedef {{
 *   id: string,
 *   calibrationVectors: number[][],
 *   paraphraseVectors: number[][]
 * }} MindflowNebulaStep2BoardVectors
 */

/**
 * @param {{
 *   boards: MindflowNebulaStep2BoardVectors[],
 *   negativeVectors: number[][],
 *   thresholds?: typeof MINDFLOW_NEBULA_STEP2_PHASE_A
 * }} input
 */
export function evaluateMindflowNebulaStep2PhaseA(input) {
  const thresholds = input.thresholds ?? MINDFLOW_NEBULA_STEP2_PHASE_A;
  /** @type {string[]} */
  const failures = [];
  const boardMetrics = [];

  for (const board of input.boards) {
    const nCal = board.calibrationVectors?.length ?? 0;
    if (nCal < thresholds.minCalibrationPerBoard) {
      failures.push(`board:${board.id}:calibration_count`);
    }
    const nPara = board.paraphraseVectors?.length ?? 0;
    if (nPara < thresholds.minParaphrasePerBoard) {
      failures.push(`board:${board.id}:paraphrase_count`);
    }
    const cohesion = meanPairwiseCosine(board.calibrationVectors || []);
    boardMetrics.push({
      id: board.id,
      calibrationCount: nCal,
      paraphraseCount: nPara,
      cohesionMeanPairwiseCosine: cohesion,
      cohesionPass: cohesion >= thresholds.cohesionMinMeanPairwiseCosine
    });
    if (cohesion < thresholds.cohesionMinMeanPairwiseCosine) {
      failures.push(`board:${board.id}:cohesion`);
    }
  }

  if ((input.negativeVectors?.length ?? 0) < thresholds.minNegativeSamples) {
    failures.push('negatives:count');
  }

  for (let i = 0; i < boardMetrics.length; i += 1) {
    for (let j = i + 1; j < boardMetrics.length; j += 1) {
      const a = input.boards[i];
      const b = input.boards[j];
      const centroidA = computeVectorCentroid(a.calibrationVectors);
      const centroidB = computeVectorCentroid(b.calibrationVectors);
      const sepCos =
        centroidA && centroidB ? cosineSimilarity(centroidA, centroidB) : 1;
      const minCohesion = Math.min(
        boardMetrics[i].cohesionMeanPairwiseCosine,
        boardMetrics[j].cohesionMeanPairwiseCosine
      );
      const maxAllowed = minCohesion - thresholds.separationMarginBelowMinCohesion;
      const sepPass = sepCos <= maxAllowed;
      if (!sepPass) {
        failures.push(`separation:${boardMetrics[i].id}:${boardMetrics[j].id}`);
      }
      boardMetrics[i].separations = boardMetrics[i].separations || [];
      boardMetrics[i].separations.push({
        otherId: boardMetrics[j].id,
        centroidCosine: sepCos,
        maxAllowedCentroidCosine: maxAllowed,
        pass: sepPass
      });
    }
  }

  const allCalibration = input.boards.flatMap((b) => b.calibrationVectors || []);
  const pca = pcaProject2D(allCalibration);
  if (!pca) {
    failures.push('pca:failed');
    return {
      phaseAPassed: false,
      failures,
      boards: boardMetrics,
      novelty: null,
      paraphrase: null
    };
  }

  const calibCoords = pca.coords;
  const zCoords = zScoreColumns2D(calibCoords);
  /** @type {Array<{ id: string, centroid2d: number[], p75: number, p90: number }>} */
  const boardPlane = [];
  let offset = 0;
  for (const board of input.boards) {
    const n = board.calibrationVectors.length;
    const slice = zCoords.slice(offset, offset + n);
    offset += n;
    const cx = slice.reduce((a, c) => a + c[0], 0) / (slice.length || 1);
    const cy = slice.reduce((a, c) => a + c[1], 0) / (slice.length || 1);
    const centroid2d = [cx, cy];
    const dists = distancesToCentroid(slice, centroid2d);
    boardPlane.push({
      id: board.id,
      centroid2d,
      p75: percentile(dists, 75),
      p90: percentile(dists, 90)
    });
  }

  const centroidsOnly = boardPlane.map((b) => b.centroid2d);
  const negativeCoords = (input.negativeVectors || []).map((vec) =>
    projectVectorWithPcaBasis(vec, pca)
  );
  const negativeZ = zScoreUsingReference(negativeCoords, calibCoords);
  const negativeDists = negativeZ.map((c) => nearestBoardDistance(c, centroidsOnly));
  const negativeMedian = percentile(negativeDists, 50);
  const referenceP90 = Math.max(...boardPlane.map((b) => b.p90));
  const noveltyPass = negativeMedian >= referenceP90;
  if (!noveltyPass) failures.push('novelty:negatives');

  /** @type {Array<{ id: string, medianDistance: number, p75: number, pass: boolean }>} */
  const paraphraseRows = [];
  for (const board of input.boards) {
    const plane = boardPlane.find((b) => b.id === board.id);
    if (!plane) continue;
    const paraCoords = (board.paraphraseVectors || []).map((vec) =>
      projectVectorWithPcaBasis(vec, pca)
    );
    const paraZ = zScoreUsingReference(paraCoords, calibCoords);
    const dists = paraZ.map((c) => euclidean2(c, plane.centroid2d));
    const medianDistance = percentile(dists, 50);
    const pass = medianDistance <= plane.p75;
    paraphraseRows.push({
      id: board.id,
      medianDistance,
      p75: plane.p75,
      pass
    });
    if (!pass) failures.push(`paraphrase:${board.id}`);
  }

  return {
    phaseAPassed: failures.length === 0,
    failures,
    boards: boardMetrics,
    novelty: {
      negativeMedianDistance: negativeMedian,
      boardP90Reference: referenceP90,
      pass: noveltyPass
    },
    paraphrase: paraphraseRows,
    pcaBasis: {
      meanLength: pca.mean.length,
      componentCount: 2
    }
  };
}

/**
 * Export-safe summary (no utterances, no raw vectors).
 * @param {ReturnType<typeof evaluateMindflowNebulaStep2PhaseA>} report
 */
export function summarizeMindflowNebulaStep2PhaseAForExport(report) {
  return {
    brief: 't66-mindflow-step2-phase-a',
    phaseAPassed: Boolean(report.phaseAPassed),
    failures: [...(report.failures || [])],
    boards: (report.boards || []).map((b) => ({
      id: b.id,
      calibrationCount: b.calibrationCount,
      paraphraseCount: b.paraphraseCount,
      cohesionMeanPairwiseCosine: b.cohesionMeanPairwiseCosine,
      cohesionPass: b.cohesionPass,
      separations: b.separations || []
    })),
    novelty: report.novelty,
    paraphrase: report.paraphrase,
    pcaBasis: report.pcaBasis,
    thresholds: MINDFLOW_NEBULA_STEP2_PHASE_A
  };
}

/**
 * @param {unknown} json
 */
export function readMindflowNebulaStep2PhaseAPassed(json) {
  if (!json || typeof json !== 'object') return false;
  return /** @type {{ phaseAPassed?: boolean }} */ (json).phaseAPassed === true;
}
