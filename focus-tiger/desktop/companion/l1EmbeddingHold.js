/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Independent Qwen3-Embedding hold for Confide semantic shadow routing.
 * Uses createEmbeddingContext / getEmbeddingFor — never reuses Gemma4 chat weights.
 */

import {
  CONFIDE_SEMANTIC_LIBRARY_A,
  CONFIDE_SEMANTIC_LIBRARY_B,
  CONFIDE_SEMANTIC_LIBRARY_C,
  CONFIDE_SEMANTIC_LIBRARY_LIFE,
  CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE
} from '../../src/core/confide/confideSemanticExamples.js';
import {
  classifyProductKnowledgeSemantic,
  lifeChatOutranksProductLibrary,
  moodAsideOutranksProductLibrary
} from '../../src/core/confide/confideProductKnowledgeSemantic.js';
import { listRetrievableProductKnowledgeEntries } from '../../src/core/confide/confideProductKnowledge.js';
import {
  classifyConfideProductAskRole,
  pickNearestCatalogEmbeddingMatch
} from '../../src/core/confide/confideProductAskRole.js';
import { catalogEntryEmbeddingPhrases } from '../../src/core/confide/kbNearMatch.js';
import {
  helpCenterEmbeddingPhrases,
  listHelpCenterExcerptArticles,
  pickNearestHelpCenterMatch
} from '../../src/core/confide/confideHelpCenterExcerpt.js';
import {
  CONFIDE_RECORD_INTENT_PROTOTYPES,
  pickNearestRecordIntent
} from '../../src/core/confide/confideRecordIntent.js';
import { OBSERVE_CLICHE_EXAMPLES } from '../../src/core/confide/observeClicheExamples.js';
import { CONFIDE_SEMANTIC_CRISIS_PROTOTYPES } from '../../src/core/confide/confideSemanticCrisisExamples.js';
import {
  resolveConfideSemanticCrisisCosine,
  scoreSemanticCrisisVectors
} from '../../src/core/confide/confideSemanticCrisisLayer.js';
import {
  classifyConfideSemanticCoarse,
  cosineSimilarity,
  formatQwen3EmbeddingInput,
  scoreLibraryTopK
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
  const crisisThreshold = resolveConfideSemanticCrisisCosine(opts.env);

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

  onProgress('precomputeLibraryLife');
  /** @type {number[][]} */
  const vectorsLife = [];
  for (const example of CONFIDE_SEMANTIC_LIBRARY_LIFE) {
    vectorsLife.push(await embedText(example));
  }

  onProgress('precomputeLibraryMoodAside');
  const moodStarted = Date.now();
  /** @type {number[][]} */
  const vectorsMood = [];
  for (const example of CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE) {
    vectorsMood.push(await embedText(example));
  }
  const moodPrecomputeMs = Date.now() - moodStarted;

  /**
   * Mood-aside scores. Live Chinese routing is the resolver switch, not this score.
   * @param {number[]} userVector
   * @param {number} productScore
   * @param {number} topK
   */
  function scoreMoodVeto(userVector, productScore, topK) {
    const moodScore = scoreLibraryTopK(userVector, vectorsMood, topK);
    return {
      moodScore,
      moodOutranksProduct: moodAsideOutranksProductLibrary(productScore, moodScore)
    };
  }

  onProgress('precomputeCatalogEntries');
  /** @type {{ id: string, entry: object, vector: number[] }[]} */
  const catalogVectors = [];
  for (const entry of listRetrievableProductKnowledgeEntries()) {
    const phrases = catalogEntryEmbeddingPhrases(entry);
    for (const phrase of phrases) {
      catalogVectors.push({ id: entry.id, entry, vector: await embedText(phrase) });
    }
  }

  onProgress('precomputeHelpCenterExcerpts');
  /** @type {{ id: string, vector: number[] }[]} */
  const helpVectors = [];
  for (const article of listHelpCenterExcerptArticles()) {
    for (const phrase of helpCenterEmbeddingPhrases(article)) {
      helpVectors.push({ id: article.id, vector: await embedText(phrase) });
    }
  }

  onProgress('precomputeRecordIntentPrototypes');
  /** @type {{ kind: string, vector: number[] }[]} */
  const recordVectors = [];
  for (const proto of CONFIDE_RECORD_INTENT_PROTOTYPES) {
    recordVectors.push({ kind: proto.kind, vector: await embedText(proto.text) });
  }

  onProgress('precomputeObserveClicheBank');
  /** @type {number[][]} */
  const clicheVectors = [];
  for (const example of OBSERVE_CLICHE_EXAMPLES) {
    clicheVectors.push(await embedText(example));
  }

  onProgress('precomputeSemanticCrisisBank');
  /** @type {{ id: string, vector: number[] }[]} */
  const crisisVectors = [];
  for (const proto of CONFIDE_SEMANTIC_CRISIS_PROTOTYPES) {
    crisisVectors.push({ id: proto.id, vector: await embedText(proto.text) });
  }

  let disposed = false;

  return {
    librarySizeA: vectorsA.length,
    librarySizeB: vectorsB.length,
    librarySizeC: vectorsC.length,
    librarySizeMood: vectorsMood.length,
    moodPrecomputeMs,
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
      const product = classifyProductKnowledgeSemantic(userVector, vectorsC, { env: opts.env });
      const mood = scoreMoodVeto(userVector, product.score, product.topK);
      return {
        ...result,
        kbProductScore: product.score,
        kbMoodScore: mood.moodScore,
        kbMoodOutranksProduct: mood.moodOutranksProduct,
        embedMs
      };
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
      const lifeScore = scoreLibraryTopK(userVector, vectorsLife, result.topK);
      const mood = scoreMoodVeto(userVector, result.score, result.topK);
      const askRole = classifyConfideProductAskRole(text);
      const nearest = pickNearestCatalogEmbeddingMatch(
        catalogVectors,
        userVector,
        cosineSimilarity,
        askRole
      );
      const nearestId = nearest.nearestId;
      const nearestScore = nearest.nearestScore;
      const help = pickNearestHelpCenterMatch(helpVectors, userVector, cosineSimilarity);
      const record = pickNearestRecordIntent(recordVectors, userVector, cosineSimilarity);
      return {
        ...result,
        nearestAskRole: nearest.askRole,
        nearestId,
        nearestScore,
        helpNearestId: help.nearestId,
        helpNearestScore: help.nearestScore,
        recordKind: record.kind,
        recordScore: record.score,
        lifeScore,
        lifeOutranksProduct: lifeChatOutranksProductLibrary(result.score, lifeScore),
        moodScore: mood.moodScore,
        moodOutranksProduct: mood.moodOutranksProduct,
        embedMs: Date.now() - embedStarted
      };
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
    /**
     * @param {string} text
     * @returns {Promise<{ score: number, protoId: string | null, hit: boolean, threshold: number, embedMs: number }>}
     */
    async scoreSemanticCrisis(text) {
      if (disposed) throw new Error('embedding_session_disposed');
      const embedStarted = Date.now();
      const userVector = await embedText(text);
      const scored = scoreSemanticCrisisVectors(userVector, crisisVectors);
      return {
        score: scored.score,
        protoId: scored.protoId,
        hit: scored.score >= crisisThreshold,
        threshold: crisisThreshold,
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
