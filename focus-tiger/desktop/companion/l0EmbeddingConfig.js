/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Embedding model constants for Confide semantic shadow (Electron only).
 */

import {
  L0_EMBEDDING_DEFAULT_KEY,
  L0_EMBEDDING_PROFILES,
  resolveL0EmbeddingProfile
} from './l0EmbeddingProfiles.js';

const ACTIVE = resolveL0EmbeddingProfile();

export const L0_EMBEDDING_PROFILE_KEY = ACTIVE.key;
export const L0_EMBEDDING_MODEL_ID = ACTIVE.modelId;
export const L0_EMBEDDING_MODEL_FILENAME = ACTIVE.filename;
export const L0_EMBEDDING_MODEL_EXPECTED_BYTES = ACTIVE.expectedBytes;
export const L0_EMBEDDING_MODEL_MIN_BYTES = ACTIVE.minBytes;
export const L0_EMBEDDING_MODEL_URLS = ACTIVE.urls;

/** Confide user turns are short; keep headroom under known Qwen3 512-token ith fallback edge. */
export const L0_EMBEDDING_CONTEXT_SIZE = 512;
export const L0_EMBEDDING_BATCH_SIZE = 512;

/** Post-ready classify wall clock only — cold embedding load waits separately (Prompt 11). */
export const L0_SEMANTIC_SHADOW_TIMEOUT_MS = 15_000;

export {
  L0_EMBEDDING_DEFAULT_KEY,
  L0_EMBEDDING_PROFILES,
  resolveL0EmbeddingProfile
};
