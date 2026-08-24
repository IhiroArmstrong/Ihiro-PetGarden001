/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L0 production constants (Electron companion download + probe).
 * Locked 2026-08-24: Qwen3-1.7B-Q4_K_M unsloth after spike + M5 Focusing hitch.
 * Not a product entry; Web / PWA must not import this file.
 */

export const L0_MODEL_ID = 'Qwen3-1.7B-Q4_K_M';

export const L0_MODEL_FILENAME = 'Qwen3-1.7B-Q4_K_M.gguf';

/** Locked size from 2026-08-24 selection (`compare-1787541422867.json`). */
export const L0_MODEL_EXPECTED_BYTES = 1_107_409_472;

/** Hugging Face resolve URL (follows to CDN). */
export const L0_MODEL_URL =
  'https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf';

/** Try these in order if the official resolve stream dies. */
export const L0_MODEL_URLS = [
  L0_MODEL_URL,
  'https://hf-mirror.com/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf'
];

/** Reject HTML error pages and truncated GGUF. */
export const L0_MODEL_MIN_BYTES = 1_100_000_000;

export const L0_PROMPT =
  '/no_think Reply with one short calm sentence, then stop. Do not give advice.';

export const L0_MAX_TOKENS = 48;

/** Fail the probe if first token is slower than this (ms). */
export const L0_TTFT_FAIL_MS = 3000;

/** Fail if decode is slower than this (tokens / sec). */
export const L0_TOK_S_FAIL = 8;

/**
 * Fail if Idle rAF p95 grows by more than this (ms) while the model is loaded.
 * Proxy for "Focusing will hitch"; real Sit→Focusing is still a manual check.
 */
export const L0_RAF_P95_DELTA_FAIL_MS = 24;

export const L0_RAF_SAMPLE_MS = 2500;

/**
 * 8 GB SKUs (Mac unified or Windows) count as low-spec.
 * 8.5 GiB catches 8 GB Windows reports that sit slightly under/over 8 GiB.
 * Unknown / non-positive totals are treated as low-spec (hide the entry).
 */
export const L0_LOW_SPEC_TOTAL_MEM_MB = 8704;

/**
 * @param {number} totalBytes `os.totalmem()` style
 * @returns {boolean}
 */
export function isLowSpecDesktopMemory(totalBytes) {
  const n = Number(totalBytes);
  if (!Number.isFinite(n) || n <= 0) return true;
  return n / (1024 * 1024) <= L0_LOW_SPEC_TOTAL_MEM_MB;
}
