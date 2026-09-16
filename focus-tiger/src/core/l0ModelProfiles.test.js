/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  L0_DEFAULT_MODEL_KEY,
  L0_MODEL_PROFILES,
  resolveL0ModelProfile
} from '../../desktop/companion/l0ModelProfiles.js';
import {
  L0_MODEL_ID,
  L0_MODEL_PROFILE_KEY,
  L0_PROMPT_FAMILY,
  resolveL0ModelProfile as resolveFromConfig
} from '../../desktop/companion/l0Config.js';
import {
  joinL3PromptLines,
  l3PromptLead
} from '../../desktop/companion/l2PromptAdapter.js';

describe('L0 model profiles', () => {
  it('defaults to Gemma4-E4B for Mac companion L3', () => {
    assert.equal(L0_DEFAULT_MODEL_KEY, 'gemma4-e4b');
    assert.equal(L0_MODEL_PROFILE_KEY, 'gemma4-e4b');
    assert.equal(L0_MODEL_ID, 'Gemma-4-E4B-it-Q4_K_M');
    assert.equal(L0_PROMPT_FAMILY, 'gemma');
  });

  it('resolves qwen3-1.7b fallback via env alias', () => {
    const profile = resolveL0ModelProfile({ FT_COMPANION_L0_MODEL: 'qwen3-1.7b' });
    assert.equal(profile.modelId, 'Qwen3-1.7B-Q4_K_M');
    assert.equal(profile.promptFamily, 'qwen');
    assert.equal(resolveL0ModelProfile({ FT_COMPANION_L0_MODEL: '1.7b' }).key, 'qwen3-1.7b');
  });

  it('keeps both profiles on Hugging Face GGUF URLs', () => {
    for (const profile of Object.values(L0_MODEL_PROFILES)) {
      assert.match(profile.urls[0], /huggingface\.co/);
      assert.match(profile.urls[0], /\.gguf$/);
    }
  });

  it('l3 prompt adapter drops /no_think for Gemma', () => {
    assert.equal(l3PromptLead('qwen'), '/no_think');
    assert.equal(l3PromptLead('gemma'), '');
    const gemmaPrompt = joinL3PromptLines(['You are Yin.', 'User: hi', 'Yin:'], 'gemma');
    assert.doesNotMatch(gemmaPrompt, /\/no_think/);
    const qwenPrompt = joinL3PromptLines(['You are Yin.', 'User: hi', 'Yin:'], 'qwen');
    assert.match(qwenPrompt, /^\/no_think/);
  });

  it('re-exports resolveL0ModelProfile from l0Config', () => {
    assert.equal(resolveFromConfig({ FT_COMPANION_L0_MODEL: 'gemma4-e4b' }).key, 'gemma4-e4b');
  });
});
