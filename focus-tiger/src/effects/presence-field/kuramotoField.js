/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

export const OSCILLATOR_COUNT = 16;
export const GOLD_BREATH_OMEGA = (Math.PI * 2) / 4;

/**
 * @param {number} n
 * @returns {number[]}
 */
export function createNaturalFrequencies(n = OSCILLATOR_COUNT) {
  const count = Math.max(12, Math.min(24, Math.round(n) || OSCILLATOR_COUNT));
  const freqs = [];
  const mid = (count - 1) / 2;
  for (let i = 0; i < count; i += 1) {
    freqs.push(GOLD_BREATH_OMEGA + (i - mid) * 0.07);
  }
  return freqs;
}

/**
 * @param {number} n
 * @param {() => number} [rng]
 * @returns {number[]}
 */
export function createPhases(n = OSCILLATOR_COUNT, rng = Math.random) {
  const count = Math.max(12, Math.min(24, Math.round(n) || OSCILLATOR_COUNT));
  return Array.from({ length: count }, () => rng() * Math.PI * 2);
}

/**
 * @param {number[]} thetas
 * @returns {{ r: number, psi: number }}
 */
export function meanField(thetas) {
  const n = thetas.length || 1;
  let re = 0;
  let im = 0;
  for (const th of thetas) {
    re += Math.cos(th);
    im += Math.sin(th);
  }
  re /= n;
  im /= n;
  return { r: Math.hypot(re, im), psi: Math.atan2(im, re) };
}

/**
 * @param {number[]} thetas
 * @param {number[]} omegas
 * @param {{ K: number, sigma: number, dt: number, rng?: () => number }} opts
 * @returns {{ thetas: number[], r: number, psi: number }}
 */
export function stepOscillators(thetas, omegas, opts) {
  const K = Number(opts.K) || 0;
  const sigma = Math.max(0, Number(opts.sigma) || 0);
  const dt = Math.max(0.001, Math.min(0.05, Number(opts.dt) || 1 / 60));
  const rng = opts.rng || Math.random;
  const { r, psi } = meanField(thetas);
  const next = thetas.map((th, i) => {
    const omega = omegas[i] ?? GOLD_BREATH_OMEGA;
    const noise = sigma * (rng() * 2 - 1) * Math.sqrt(dt);
    return th + (omega + K * r * Math.sin(psi - th)) * dt + noise;
  });
  const field = meanField(next);
  return { thetas: next, r: field.r, psi: field.psi };
}
