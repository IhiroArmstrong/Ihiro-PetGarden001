/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  NATIVE_LLAMA_UNAVAILABLE,
  companionErrorDisablesSemanticScore,
  getLlamaOrMarkNativeDown,
  importNodeLlamaOrMarkDown,
  isNativeLlamaDown,
  isNativeLlamaLoadFailure,
  noteNativeLlamaFailure,
  resetNativeLlamaLatchForTest
} from '../../desktop/companion/nativeLlamaAvailability.js';

describe('native llama availability', () => {
  beforeEach(() => {
    resetNativeLlamaLatchForTest();
  });

  it('treats a missing model file as a local failure, not a binding failure', () => {
    const err = Object.assign(new Error('ENOENT: model.gguf'), { code: 'ENOENT' });
    assert.equal(isNativeLlamaLoadFailure(err), false);
    assert.equal(noteNativeLlamaFailure(err), false);
    assert.equal(isNativeLlamaDown(), false);
  });

  it('latches semantic score and short generation together after a binding load failure', async () => {
    const dlopen = Object.assign(new Error('dlopen(llama.node): symbol not found'), {
      code: 'ERR_DLOPEN_FAILED'
    });
    await assert.rejects(
      () => importNodeLlamaOrMarkDown(async () => {
        throw dlopen;
      }),
      (err) => err instanceof Error && err.message === NATIVE_LLAMA_UNAVAILABLE
    );
    assert.equal(isNativeLlamaDown(), true);
    assert.equal(companionErrorDisablesSemanticScore(NATIVE_LLAMA_UNAVAILABLE), true);

    await assert.rejects(
      () => getLlamaOrMarkNativeDown(async () => ({ gpu: 'metal' })),
      (err) => err instanceof Error && err.message === NATIVE_LLAMA_UNAVAILABLE
    );
  });

  it('does not disable semantic score for an unrelated companion error', () => {
    assert.equal(companionErrorDisablesSemanticScore('download_failed'), false);
    assert.equal(companionErrorDisablesSemanticScore(''), false);
  });

  it('recognizes an ABI mismatch and a missing prebuild', () => {
    assert.equal(
      isNativeLlamaLoadFailure(
        new Error('The module was compiled against a different Node.js version')
      ),
      true
    );
    const missing = new Error('NoBinaryFoundError');
    missing.name = 'NoBinaryFoundError';
    assert.equal(isNativeLlamaLoadFailure(missing), true);
    assert.equal(
      isNativeLlamaLoadFailure(
        Object.assign(new Error("Cannot find module 'node-llama-cpp'"), {
          code: 'MODULE_NOT_FOUND'
        })
      ),
      true
    );
  });
});
