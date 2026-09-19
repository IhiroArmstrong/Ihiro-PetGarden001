/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Qwen3-Embedding GGUF profile for Confide semantic shadow routing.
 * Apache 2.0 — aligned with Gemma4 companion license posture (no EmbeddingGemma ToU).
 */

/** @typedef {{
 *   key: string,
 *   modelId: string,
 *   filename: string,
 *   expectedBytes: number,
 *   minBytes: number,
 *   urls: string[],
 *   displayCode: string,
 *   lockedNote: string
 * }} L0EmbeddingProfile
 */

/** @type {Readonly<Record<string, L0EmbeddingProfile>>} */
export const L0_EMBEDDING_PROFILES = Object.freeze({
  'qwen3-embedding-0.6b': {
    key: 'qwen3-embedding-0.6b',
    modelId: 'Qwen3-Embedding-0.6B-Q8_0',
    filename: 'Qwen3-Embedding-0.6B-Q8_0.gguf',
    /** Qwen/Qwen3-Embedding-0.6B-GGUF · Hugging Face API 2026-09-19 */
    expectedBytes: 639_150_592,
    minBytes: 600_000_000,
    urls: [
      'https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF/resolve/main/Qwen3-Embedding-0.6B-Q8_0.gguf',
      'https://hf-mirror.com/Qwen/Qwen3-Embedding-0.6B-GGUF/resolve/main/Qwen3-Embedding-0.6B-Q8_0.gguf'
    ],
    displayCode: 'EmbedQwen06',
    lockedNote:
      '2026-09-19 PO: Qwen3-Embedding-0.6B Q8_0 for Confide semantic shadow; Apache 2.0'
  }
});

export const L0_EMBEDDING_DEFAULT_KEY = 'qwen3-embedding-0.6b';

const PROFILE_ALIASES = Object.freeze({
  qwen3: 'qwen3-embedding-0.6b',
  embedding: 'qwen3-embedding-0.6b',
  'qwen3-embed': 'qwen3-embedding-0.6b',
  '0.6b': 'qwen3-embedding-0.6b'
});

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {L0EmbeddingProfile}
 */
export function resolveL0EmbeddingProfile(env = process.env) {
  const raw = String(env.FT_COMPANION_EMBEDDING_MODEL || L0_EMBEDDING_DEFAULT_KEY)
    .trim()
    .toLowerCase();
  const key = PROFILE_ALIASES[raw] || raw;
  return L0_EMBEDDING_PROFILES[key] || L0_EMBEDDING_PROFILES[L0_EMBEDDING_DEFAULT_KEY];
}
