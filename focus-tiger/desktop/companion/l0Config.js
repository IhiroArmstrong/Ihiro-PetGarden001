/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L0 production constants (Electron companion download + probe).
 * Default 2026-09-17: Gemma4-E4B-it UD-Q4_K_XL (unsloth QAT) for Mac companion L3.
 * Rollback: `FT_COMPANION_L0_MODEL=gemma4-e4b-jc` → jc-builds Q4_K_M.
 * Fallback: `FT_COMPANION_L0_MODEL=qwen3-1.7b` → Qwen3-1.7B unsloth.
 * Not a product entry; Web / PWA must not import this file.
 */

import {
  L0_DEFAULT_MODEL_KEY,
  L0_MODEL_PROFILES,
  resolveL0ModelProfile
} from './l0ModelProfiles.js';

const ACTIVE = resolveL0ModelProfile();

export const L0_MODEL_PROFILE_KEY = ACTIVE.key;

export const L0_MODEL_ID = ACTIVE.modelId;

export const L0_MODEL_FILENAME = ACTIVE.filename;

/**
 * Leftover production files from earlier eras.
 * Never loaded after the active dest is complete; unlinked so Confide cannot
 * look "ready" on an old GGUF.
 */
export const L0_LEGACY_MODEL_FILENAMES = Object.freeze([
  'Qwen_Qwen3-0.6B-Q4_K_M.gguf'
]);

export const L0_MODEL_EXPECTED_BYTES = ACTIVE.expectedBytes;

/** Hugging Face resolve URL (follows to CDN). */
export const L0_MODEL_URL = ACTIVE.urls[0];

/** Try these in order if the official resolve stream dies. */
export const L0_MODEL_URLS = ACTIVE.urls;

/** Reject HTML error pages and truncated GGUF. */
export const L0_MODEL_MIN_BYTES = ACTIVE.minBytes;

/** `qwen` = Qwen3 `/no_think`; `gemma` = Gemma4 chat template via node-llama-cpp. */
export const L0_PROMPT_FAMILY = ACTIVE.promptFamily;

export const L0_MODEL_DISPLAY_CODE = ACTIVE.displayCode;

export { L0_DEFAULT_MODEL_KEY, L0_MODEL_PROFILES, resolveL0ModelProfile };

export const L0_PROMPT =
  L0_PROMPT_FAMILY === 'qwen'
    ? '/no_think Reply with one short calm sentence, then stop. Do not give advice.'
    : 'Reply with one short calm sentence, then stop. Do not give advice.';

export const L0_MAX_TOKENS = 48;

/** Read-hybrid JSON classify (regex miss only); shorter than L2 generate. */
export const L0_TOOL_CLASSIFY_TIMEOUT_MS = 12_000;

/**
 * Chat-hold `ensure` handshake. Does not cover generate tokens.
 * Embedding load uses a separate child queue but shares getLlama().
 */
export const L1_ENSURE_READY_TIMEOUT_MS = 30_000;

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
