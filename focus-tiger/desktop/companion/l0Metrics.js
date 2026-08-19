/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import {
  L0_RAF_P95_DELTA_FAIL_MS,
  L0_TOK_S_FAIL,
  L0_TTFT_FAIL_MS
} from './l0Config.js';

/**
 * @param {number} bytes
 * @returns {number}
 */
export function rssMb(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round((n / (1024 * 1024)) * 10) / 10;
}

/**
 * @param {number} tokenCount
 * @param {number} genMs
 * @returns {number}
 */
export function tokensPerSecond(tokenCount, genMs) {
  const tokens = Number(tokenCount);
  const ms = Number(genMs);
  if (!Number.isFinite(tokens) || tokens <= 0) return 0;
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.round((tokens / ms) * 1000 * 10) / 10;
}

/**
 * @param {number[]} intervalsMs
 * @returns {{ count: number, avgMs: number, p95Ms: number, maxMs: number }}
 */
export function summarizeFrameIntervals(intervalsMs) {
  const list = Array.isArray(intervalsMs)
    ? intervalsMs.filter((n) => Number.isFinite(n) && n >= 0)
    : [];
  if (list.length === 0) {
    return { count: 0, avgMs: 0, p95Ms: 0, maxMs: 0 };
  }
  const sorted = [...list].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, n) => acc + n, 0);
  const p95Index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor(sorted.length * 0.95) - 1)
  );
  return {
    count: sorted.length,
    avgMs: Math.round((sum / sorted.length) * 10) / 10,
    p95Ms: Math.round(sorted[p95Index] * 10) / 10,
    maxMs: Math.round(sorted[sorted.length - 1] * 10) / 10
  };
}

/**
 * @param {{
 *   loadError?: string | null,
 *   ttftMs?: number | null,
 *   tokensPerSec?: number | null,
 *   rafP95DeltaMs?: number | null
 * }} row
 * @returns {{ ok: boolean, fails: string[] }}
 */
export function evaluateL0Verdict(row = {}) {
  const fails = [];
  if (row.loadError) fails.push('load_error');
  if (row.ttftMs != null && Number(row.ttftMs) > L0_TTFT_FAIL_MS) {
    fails.push('ttft_over_3s');
  }
  if (row.tokensPerSec != null && Number(row.tokensPerSec) < L0_TOK_S_FAIL) {
    fails.push('too_slow');
  }
  if (
    row.rafP95DeltaMs != null &&
    Number(row.rafP95DeltaMs) > L0_RAF_P95_DELTA_FAIL_MS
  ) {
    fails.push('raf_regression');
  }
  return { ok: fails.length === 0, fails };
}
