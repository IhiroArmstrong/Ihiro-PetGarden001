/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * @param {number[]} values
 * @param {number} p 0–100
 */
export function percentile(values, p) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  const w = rank - lo;
  return sorted[lo] * (1 - w) + sorted[hi] * w;
}

/**
 * @param {number[][]} coords rows of dim 2
 * @returns {number[][]}
 */
export function zScoreColumns2D(coords) {
  if (!coords.length) return [];
  const xs = coords.map((c) => c[0]);
  const ys = coords.map((c) => c[1]);
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
  const stdX = Math.sqrt(xs.reduce((a, x) => a + (x - meanX) ** 2, 0) / xs.length) || 1;
  const stdY = Math.sqrt(ys.reduce((a, y) => a + (y - meanY) ** 2, 0) / ys.length) || 1;
  return coords.map(([x, y]) => [(x - meanX) / stdX, (y - meanY) / stdY]);
}

/**
 * @param {number[]} a
 * @param {number[]} b
 */
export function euclidean2(a, b) {
  const dx = (a[0] ?? 0) - (b[0] ?? 0);
  const dy = (a[1] ?? 0) - (b[1] ?? 0);
  return Math.hypot(dx, dy);
}

/**
 * @param {number[][]} vectors
 * @returns {number[] | null}
 */
export function computeMeanVector(vectors) {
  if (!vectors?.length) return null;
  const dim = vectors[0].length;
  const sum = new Array(dim).fill(0);
  let n = 0;
  for (const v of vectors) {
    if (!Array.isArray(v) || v.length !== dim) continue;
    for (let i = 0; i < dim; i += 1) sum[i] += Number(v[i]) || 0;
    n += 1;
  }
  if (n === 0) return null;
  return sum.map((x) => x / n);
}

/**
 * Power iteration for one principal axis.
 * @param {number[][]} centered n x dim
 * @param {number[] | null} [deflateAgainst]
 */
function principalAxis(centered, deflateAgainst = null) {
  const dim = centered[0]?.length || 0;
  if (dim <= 0) return null;
  /** @type {number[]} */
  let w = new Array(dim).fill(0).map(() => Math.random() - 0.5);
  let norm = Math.hypot(...w) || 1;
  w = w.map((x) => x / norm);
  for (let iter = 0; iter < 40; iter += 1) {
    /** @type {number[]} */
    const next = new Array(dim).fill(0);
    for (const row of centered) {
      const dot = row.reduce((acc, x, i) => acc + x * w[i], 0);
      for (let i = 0; i < dim; i += 1) next[i] += dot * row[i];
    }
    if (deflateAgainst) {
      const d = next.reduce((acc, x, i) => acc + x * deflateAgainst[i], 0);
      for (let i = 0; i < dim; i += 1) next[i] -= d * deflateAgainst[i];
    }
    norm = Math.hypot(...next) || 1;
    w = next.map((x) => x / norm);
  }
  return w;
}

/**
 * First two PCA components (enough for Brief phase A/B).
 * @param {number[][]} vectors
 * @returns {{ mean: number[], components: [number[], number[]], coords: number[][] } | null}
 */
export function pcaProject2D(vectors) {
  if (!Array.isArray(vectors) || vectors.length < 2) return null;
  const dim = vectors[0]?.length || 0;
  if (dim < 2) return null;
  const mean = computeMeanVector(vectors);
  if (!mean) return null;
  const centered = vectors.map((v) => v.map((x, i) => (Number(x) || 0) - mean[i]));
  const pc1 = principalAxis(centered);
  if (!pc1) return null;
  const pc2 = principalAxis(centered, pc1);
  if (!pc2) return null;
  const coords = centered.map((row) => [
    row.reduce((acc, x, i) => acc + x * pc1[i], 0),
    row.reduce((acc, x, i) => acc + x * pc2[i], 0)
  ]);
  return { mean, components: [pc1, pc2], coords };
}

/**
 * @param {number[]} vector
 * @param {{ mean: number[], components: [number[], number[]] }} basis
 * @returns {number[]}
 */
export function projectVectorWithPcaBasis(vector, basis) {
  const centered = vector.map((x, i) => (Number(x) || 0) - basis.mean[i]);
  return [
    centered.reduce((acc, x, i) => acc + x * basis.components[0][i], 0),
    centered.reduce((acc, x, i) => acc + x * basis.components[1][i], 0)
  ];
}
