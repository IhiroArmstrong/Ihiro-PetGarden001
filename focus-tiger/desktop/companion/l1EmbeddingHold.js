/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Independent Qwen3-Embedding hold for Confide semantic shadow routing.
 * Uses createEmbeddingContext / getEmbeddingFor — never reuses Gemma4 chat weights.
 */

import {
  CONFIDE_SEMANTIC_LIBRARY_A,
  CONFIDE_SEMANTIC_LIBRARY_B,
  CONFIDE_SEMANTIC_LIBRARY_C
} from '../../src/core/confide/confideSemanticExamples.js';
import { classifyProductKnowledgeSemantic } from '../../src/core/confide/confideProductKnowledgeSemantic.js';
import { OBSERVE_CLICHE_EXAMPLES } from '../../src/core/confide/observeClicheExamples.js';
import {
  classifyConfideSemanticCoarse,
  formatQwen3EmbeddingInput
} from '../../src/core/confide/confideSemanticRouting.js';
import {
  maxObserveClicheCosine,
  resolveObserveClicheCosineThreshold
} from '../../src/core/confide/observeClicheGate.js';
import { resolveConfideSemanticRoutingConfig } from '../../src/core/confide/confideSemanticRoutingConfig.js';
import {
  L0_EMBEDDING_BATCH_SIZE,
  L0_EMBEDDING_CONTEXT_SIZE
} from './l0EmbeddingConfig.js';
import { disposeContextQuietly } from './l1ChatSequence.js';

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

/**
 * @param {{
 *   modelPath: string,
 *   onProgress?: (msg: string) => void,
 *   env?: NodeJS.ProcessEnv
 * }} opts
 */
export async function loadEmbeddingHold(opts) {
  const onProgress = opts.onProgress || (() => {});
  const routingConfig = resolveConfideSemanticRoutingConfig(opts.env);
  const clicheThreshold = resolveObserveClicheCosineThreshold(opts.env);

  onProgress('import node-llama-cpp (embedding)');
  const { getLlama } = await import('node-llama-cpp');

  onProgress('getLlama (embedding)');
  const llama = await getLlama();

  onProgress('loadEmbeddingModel');
  const model = await llama.loadModel({ modelPath: opts.modelPath });

  let context = await model.createEmbeddingContext({
    contextSize: L0_EMBEDDING_CONTEXT_SIZE,
    batchSize: L0_EMBEDDING_BATCH_SIZE
  });

  /**
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async function embedText(text) {
    const input = formatQwen3EmbeddingInput(text);
    const result = await context.getEmbeddingFor(input);
    const vector = result?.vector;
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error('embedding_empty_vector');
    }
    return vector;
  }

  onProgress('precomputeLibraryA');
  /** @type {number[][]} */
  const vectorsA = [];
  for (const example of CONFIDE_SEMANTIC_LIBRARY_A) {
    vectorsA.push(await embedText(example));
  }

  onProgress('precomputeLibraryB');
  /** @type {number[][]} */
  const vectorsB = [];
  for (const example of CONFIDE_SEMANTIC_LIBRARY_B) {
    vectorsB.push(await embedText(example));
  }

  onProgress('precomputeLibraryC');
  /** @type {number[][]} */
  const vectorsC = [];
  for (const example of CONFIDE_SEMANTIC_LIBRARY_C) {
    vectorsC.push(await embedText(example));
  }

  onProgress('precomputeObserveClicheBank');
  /** @type {number[][]} */
  const clicheVectors = [];
  for (const example of OBSERVE_CLICHE_EXAMPLES) {
    clicheVectors.push(await embedText(example));
  }

  let disposed = false;

  return {
    librarySizeA: vectorsA.length,
    librarySizeB: vectorsB.length,
    librarySizeC: vectorsC.length,
    vectorsA,
    vectorsB,
    vectorsC,
    embedText,
    /**
     * @param {string} text
     * @returns {Promise<ReturnType<typeof classifyConfideSemanticCoarse>>}
     */
    async classifyUserText(text) {
      if (disposed) throw new Error('embedding_session_disposed');
      const embedStarted = Date.now();
      const userVector = await embedText(text);
      const embedMs = Date.now() - embedStarted;
      const result = classifyConfideSemanticCoarse(
        userVector,
        vectorsA,
        vectorsB,
        routingConfig
      );
      return { ...result, embedMs };
    },
    /**
     * @param {string} text
     * @returns {Promise<ReturnType<typeof classifyProductKnowledgeSemantic> & { embedMs: number }>}
     */
    async classifyProductKnowledgeGate(text) {
      if (disposed) throw new Error('embedding_session_disposed');
      const embedStarted = Date.now();
      const userVector = await embedText(text);
      const result = classifyProductKnowledgeSemantic(userVector, vectorsC, { env: opts.env });
      return { ...result, embedMs: Date.now() - embedStarted };
    },
    /**
     * @param {string} text
     * @returns {Promise<{ score: number, flagged: boolean, threshold: number, embedMs: number }>}
     */
    async scoreObserveCliche(text) {
      if (disposed) throw new Error('embedding_session_disposed');
      const embedStarted = Date.now();
      const replyVector = await embedText(text);
      const score = maxObserveClicheCosine(replyVector, clicheVectors);
      return {
        score,
        flagged: score >= clicheThreshold,
        threshold: clicheThreshold,
        embedMs: Date.now() - embedStarted
      };
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      await disposeContextQuietly(context);
      context = null;
      try {
        if (model && typeof model.dispose === 'function') await model.dispose();
      } catch {
        /* already failed */
      }
      try {
        if (llama && typeof llama.dispose === 'function') await llama.dispose();
      } catch {
        /* already failed */
      }
    }
  };
}

export { errorMessage };
