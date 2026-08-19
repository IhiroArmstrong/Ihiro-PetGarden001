/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Loads Qwen3-0.6B via node-llama-cpp, generates a short reply, disposes.
 * Dynamic import so unit tests never load the native addon.
 */

import { L0_MAX_TOKENS, L0_PROMPT } from './l0Config.js';
import { rssMb, tokensPerSecond } from './l0Metrics.js';

function rssBytes() {
  return process.memoryUsage().rss;
}

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

/**
 * @param {{ dispose?: () => Promise<void> } | null} model
 * @param {{ dispose?: () => Promise<void> } | null} llama
 * @param {number} timeoutMs
 */
async function disposeQuietly(model, llama, timeoutMs) {
  const work = (async () => {
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
  })();
  await Promise.race([
    work,
    new Promise((resolve) => setTimeout(resolve, timeoutMs))
  ]);
}

/**
 * @param {{
 *   modelPath: string,
 *   onProgress?: (msg: string) => void,
 *   onHolding?: () => Promise<void> | void,
 *   prompt?: string,
 *   maxTokens?: number
 * }} opts
 */
export async function runL0Inference(opts) {
  const onProgress = opts.onProgress || (() => {});
  const prompt = opts.prompt || L0_PROMPT;
  const maxTokens = opts.maxTokens ?? L0_MAX_TOKENS;
  const rssBefore = rssBytes();
  /** @type {string} */
  let gpu = 'unknown';
  /** @type {null | { dispose?: () => Promise<void> }} */
  let llama = null;
  /** @type {null | { dispose?: () => Promise<void> }} */
  let model = null;

  try {
    onProgress('import node-llama-cpp');
    const { getLlama, LlamaChatSession } = await import('node-llama-cpp');

    onProgress('getLlama');
    llama = await getLlama();
    gpu =
      llama && llama.gpu != null
        ? String(llama.gpu)
        : llama && llama.gpuType != null
          ? String(llama.gpuType)
          : 'unknown';

    onProgress('loadModel');
    const loadStarted = Date.now();
    model = await llama.loadModel({ modelPath: opts.modelPath });
    const loadMs = Date.now() - loadStarted;
    const rssAfterLoad = rssBytes();

    const context = await model.createContext();
    const session = new LlamaChatSession({
      contextSequence: context.getSequence()
    });

    if (typeof opts.onHolding === 'function') {
      onProgress('holding for frame sample');
      await opts.onHolding();
    }

    onProgress('generate');
    let firstTokenAt = null;
    let tokenCount = 0;
    const genStarted = Date.now();
    const text = await session.prompt(prompt, {
      maxTokens,
      onTextChunk() {
        if (firstTokenAt == null) firstTokenAt = Date.now();
        tokenCount += 1;
      }
    });
    const genEnded = Date.now();
    const ttftMs = firstTokenAt == null ? genEnded - genStarted : firstTokenAt - genStarted;
    const genMs = Math.max(1, genEnded - (firstTokenAt ?? genStarted));
    const rssAfterGen = rssBytes();
    const result = {
      gpu,
      loadMs,
      ttftMs,
      genMs,
      tokenCount,
      tokensPerSec: tokensPerSecond(tokenCount, genMs),
      text: String(text || '').slice(0, 400),
      rssMbBefore: rssMb(rssBefore),
      rssMbAfterLoad: rssMb(rssAfterLoad),
      rssMbAfterGen: rssMb(rssAfterGen),
      rssMbAfterUnload: null
    };

    onProgress('dispose');
    await disposeQuietly(model, llama, 8000);
    model = null;
    llama = null;
    result.rssMbAfterUnload = rssMb(rssBytes());
    return result;
  } catch (err) {
    return {
      loadError: errorMessage(err),
      gpu,
      rssMbBefore: rssMb(rssBefore),
      rssMbAfterLoad: rssMb(rssBytes())
    };
  } finally {
    await disposeQuietly(model, llama, 8000);
  }
}
