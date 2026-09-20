/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createSemanticShadowEmbeddingGate,
  runSemanticShadowClassifyWithEmbeddingGate
} from './l1SemanticShadowEmbeddingGate.js';

describe('l1SemanticShadowEmbeddingGate', () => {
  it('waits for embedding_ready instead of failing during cold load', async () => {
    const gate = createSemanticShadowEmbeddingGate();
    let ensureSent = false;

    const resultPromise = runSemanticShadowClassifyWithEmbeddingGate({
      classifyTimeoutMs: 15,
      waitForEmbeddingReady: async () => {
        if (gate.isReady()) return { ok: true };
        const wait = gate.waitForReady();
        if (gate.shouldRequestEnsure()) {
          gate.markLoading();
          ensureSent = true;
        }
        return wait;
      },
      runClassify: async () => ({ event: 'semantic_shadow_classified', bucket: 'gray' }),
      sleep: async (ms) => {
        if (ms === 15) throw new Error('classify timeout should not fire during cold load');
      }
    });

    assert.equal(ensureSent, true);
    assert.equal(gate.snapshot().state, 'loading');

    setTimeout(() => {
      gate.applyEvent({ event: 'embedding_ready' });
    }, 20);

    const result = await resultPromise;
    assert.equal(result.ok, true);
    assert.equal(gate.snapshot().state, 'ready');
  });

  it('ends with embed_unavailable when embedding_error arrives', async () => {
    const gate = createSemanticShadowEmbeddingGate();
    gate.markLoading();

    const resultPromise = runSemanticShadowClassifyWithEmbeddingGate({
      classifyTimeoutMs: 15_000,
      waitForEmbeddingReady: () => gate.waitForReady(),
      runClassify: async () => {
        throw new Error('classify must not run');
      }
    });

    gate.applyEvent({ event: 'embedding_error', message: 'download_failed' });
    const result = await resultPromise;
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'embed_unavailable');
    assert.equal(result.message, 'download_failed');
  });

  it('applies classify timeout only after embedding is ready', async () => {
    const gate = createSemanticShadowEmbeddingGate();
    gate.applyEvent({ event: 'embedding_ready' });

    const result = await runSemanticShadowClassifyWithEmbeddingGate({
      classifyTimeoutMs: 5,
      waitForEmbeddingReady: () => gate.waitForReady(),
      runClassify: () => new Promise(() => {}),
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    });

    assert.equal(result.ok, false);
    assert.equal(result.reason, 'timeout');
  });

  it('simulates cold-start burst: five waits then classify succeeds (2026-09-19 log shape)', async () => {
    const gate = createSemanticShadowEmbeddingGate();
    const coldLoadMs = 20;
    let classifyCalls = 0;

    async function classifyOnce() {
      return runSemanticShadowClassifyWithEmbeddingGate({
        classifyTimeoutMs: 15,
        waitForEmbeddingReady: async () => {
          if (gate.isReady()) return { ok: true };
          if (gate.shouldRequestEnsure()) {
            gate.markLoading();
            setTimeout(() => gate.applyEvent({ event: 'embedding_ready' }), coldLoadMs);
          }
          return gate.waitForReady();
        },
        runClassify: async () => {
          classifyCalls += 1;
          return { event: 'semantic_shadow_classified', bucket: 'emotional' };
        },
        sleep: async (ms) => {
          if (ms === 15) throw new Error('legacy 15s wall timeout must not discard cold-load samples');
        }
      });
    }

    const results = [];
    for (let i = 0; i < 5; i += 1) {
      results.push(await classifyOnce());
    }

    assert.equal(classifyCalls, 5);
    assert.ok(results.every((row) => row.ok));
    assert.equal(gate.snapshot().state, 'ready');
  });
});
