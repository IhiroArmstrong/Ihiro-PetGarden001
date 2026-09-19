/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  L0_EMBEDDING_DEFAULT_KEY,
  L0_EMBEDDING_PROFILES,
  resolveL0EmbeddingProfile
} from '../../desktop/companion/l0EmbeddingProfiles.js';
import {
  L0_EMBEDDING_MODEL_FILENAME,
  L0_EMBEDDING_MODEL_ID,
  L0_EMBEDDING_PROFILE_KEY,
  resolveL0EmbeddingProfile as resolveFromConfig
} from '../../desktop/companion/l0EmbeddingConfig.js';

describe('L0 embedding profiles', () => {
  it('defaults to Qwen3-Embedding-0.6B Q8_0 for semantic shadow', () => {
    assert.equal(L0_EMBEDDING_DEFAULT_KEY, 'qwen3-embedding-0.6b');
    assert.equal(L0_EMBEDDING_PROFILE_KEY, 'qwen3-embedding-0.6b');
    assert.equal(L0_EMBEDDING_MODEL_ID, 'Qwen3-Embedding-0.6B-Q8_0');
    assert.equal(L0_EMBEDDING_MODEL_FILENAME, 'Qwen3-Embedding-0.6B-Q8_0.gguf');
  });

  it('resolves embedding profile aliases via env', () => {
    assert.equal(
      resolveL0EmbeddingProfile({ FT_COMPANION_EMBEDDING_MODEL: 'embedding' }).key,
      'qwen3-embedding-0.6b'
    );
    assert.equal(
      resolveL0EmbeddingProfile({ FT_COMPANION_EMBEDDING_MODEL: 'qwen3-embed' }).modelId,
      'Qwen3-Embedding-0.6B-Q8_0'
    );
  });

  it('keeps embedding profile on Hugging Face GGUF URLs', () => {
    for (const profile of Object.values(L0_EMBEDDING_PROFILES)) {
      assert.match(profile.urls[0], /huggingface\.co/);
      assert.match(profile.urls[0], /Qwen3-Embedding-0\.6B/);
      assert.match(profile.urls[0], /\.gguf$/);
    }
  });

  it('re-exports resolveL0EmbeddingProfile from l0EmbeddingConfig', () => {
    assert.equal(
      resolveFromConfig({ FT_COMPANION_EMBEDDING_MODEL: 'qwen3-embedding-0.6b' }).key,
      'qwen3-embedding-0.6b'
    );
  });
});
