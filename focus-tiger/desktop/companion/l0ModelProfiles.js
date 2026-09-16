/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Switchable L0 GGUF profiles for Electron companion download + L1 hold.
 * Active profile: `FT_COMPANION_L0_MODEL` (default `gemma4-e4b`).
 */

/** @typedef {'qwen' | 'gemma'} L0PromptFamily */

/**
 * @typedef {{
 *   key: string,
 *   modelId: string,
 *   filename: string,
 *   expectedBytes: number,
 *   minBytes: number,
 *   urls: string[],
 *   promptFamily: L0PromptFamily,
 *   displayCode: string,
 *   lockedNote: string
 * }} L0ModelProfile
 */

/** @type {Readonly<Record<string, L0ModelProfile>>} */
export const L0_MODEL_PROFILES = Object.freeze({
  'gemma4-e4b': {
    key: 'gemma4-e4b',
    modelId: 'Gemma-4-E4B-it-Q4_K_M',
    filename: 'Gemma-4-E4B-it-Q4_K_M.gguf',
    /** jc-builds/Gemma-4-E4B-it-GGUF · Hugging Face API 2026-09-16 */
    expectedBytes: 5_335_290_592,
    minBytes: 5_000_000_000,
    urls: [
      'https://huggingface.co/jc-builds/Gemma-4-E4B-it-GGUF/resolve/main/Gemma-4-E4B-it-Q4_K_M.gguf',
      'https://hf-mirror.com/jc-builds/Gemma-4-E4B-it-GGUF/resolve/main/Gemma-4-E4B-it-Q4_K_M.gguf'
    ],
    promptFamily: 'gemma',
    displayCode: 'Model4E4',
    lockedNote: '2026-09-16 PO: Mac-first companion L3 default; multiling. Gemma4-E4B'
  },
  'qwen3-1.7b': {
    key: 'qwen3-1.7b',
    modelId: 'Qwen3-1.7B-Q4_K_M',
    filename: 'Qwen3-1.7B-Q4_K_M.gguf',
    expectedBytes: 1_107_409_472,
    minBytes: 1_100_000_000,
    urls: [
      'https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf',
      'https://hf-mirror.com/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf'
    ],
    promptFamily: 'qwen',
    displayCode: 'Model317',
    lockedNote: '2026-08-24 fallback: Qwen3-1.7B unsloth after spike + M5 Focusing hitch'
  }
});

export const L0_DEFAULT_MODEL_KEY = 'gemma4-e4b';

const PROFILE_ALIASES = Object.freeze({
  gemma: 'gemma4-e4b',
  gemma4: 'gemma4-e4b',
  e4b: 'gemma4-e4b',
  qwen: 'qwen3-1.7b',
  'qwen3': 'qwen3-1.7b',
  '1.7b': 'qwen3-1.7b',
  '17b': 'qwen3-1.7b'
});

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {L0ModelProfile}
 */
export function resolveL0ModelProfile(env = process.env) {
  const raw = String(env.FT_COMPANION_L0_MODEL || L0_DEFAULT_MODEL_KEY)
    .trim()
    .toLowerCase();
  const key = PROFILE_ALIASES[raw] || raw;
  return L0_MODEL_PROFILES[key] || L0_MODEL_PROFILES[L0_DEFAULT_MODEL_KEY];
}
