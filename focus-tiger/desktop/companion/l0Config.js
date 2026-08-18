/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L0 probe constants. Model id is a starting candidate — lock after measurements.
 * Not a product entry; Web / PWA must not import this file.
 */

export const L0_MODEL_ID = 'Qwen3-0.6B-Q4_K_M';

export const L0_MODEL_FILENAME = 'Qwen_Qwen3-0.6B-Q4_K_M.gguf';

/** Hugging Face resolve URL (follows to CDN). */
export const L0_MODEL_URL =
  'https://huggingface.co/bartowski/Qwen_Qwen3-0.6B-GGUF/resolve/main/Qwen_Qwen3-0.6B-Q4_K_M.gguf';

/** Try these in order if the official resolve stream dies. */
export const L0_MODEL_URLS = [
  L0_MODEL_URL,
  'https://hf-mirror.com/bartowski/Qwen_Qwen3-0.6B-GGUF/resolve/main/Qwen_Qwen3-0.6B-Q4_K_M.gguf'
];

/** Reject HTML error pages pretending to be GGUF. */
export const L0_MODEL_MIN_BYTES = 400_000_000;

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
