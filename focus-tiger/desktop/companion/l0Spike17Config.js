/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 1.7B production-like spike constants only.
 * Does NOT replace `l0Config.js` (production L0/L1 still use 0.6B until a separate wiring task).
 */

export const SPIKE_17_MODEL_ID = 'Qwen3-1.7B-Q4_K_M';

export const SPIKE_17_MODEL_FILENAME = 'Qwen3-1.7B-Q4_K_M.gguf';

/** Locked size from 2026-08-24 selection (`compare-1787541422867.json`). */
export const SPIKE_17_EXPECTED_BYTES = 1_107_409_472;

export const SPIKE_17_MODEL_MIN_BYTES = 1_100_000_000;

export const SPIKE_17_MODEL_URL =
  'https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf';

export const SPIKE_17_MODEL_URLS = [
  SPIKE_17_MODEL_URL,
  'https://hf-mirror.com/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf'
];

export const SPIKE_17_CACHE_DIRNAME = 'companion-spike-17b';

export const SPIKE_17_GENERATION_COUNT = 5;

export const SPIKE_17_MAX_TOKENS = 48;

/** Confide-like one-shot prompts (unmatched small talk). */
export const SPIKE_17_PROMPTS = [
  '/no_think Reply as Yin with one or two warm short sentences. User: "My brain has too many tabs open today." Do not give advice.',
  '/no_think Reply as Yin with one short sentence. User: "Whom do you like?" Do not invent facts.',
  '/no_think Reply as Yin with one short sentence. User: "Do you eat anything?" Stay playful, no advice.',
  '/no_think Reply as Yin with one short sentence. User: "What is the weather like in Beijing this week?" Do not forecast.',
  '/no_think Reply as Yin with one short sentence. User: "I feel scattered again." Be warm, no coaching list.'
];

/**
 * @param {string} userDataParent
 * @returns {string}
 */
export function spike17ModelDir(userDataParent) {
  return `${userDataParent}/${SPIKE_17_CACHE_DIRNAME}`;
}
