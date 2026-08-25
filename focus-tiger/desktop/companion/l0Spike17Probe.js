/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Production-like 1.7B spike: download → load once → N generates → unload.
 * Isolated from `l0Config.js` / L1 child wiring.
 */

import os from 'node:os';
import path from 'node:path';
import {
  SPIKE_17_EXPECTED_BYTES,
  SPIKE_17_GENERATION_COUNT,
  SPIKE_17_MAX_TOKENS,
  SPIKE_17_MODEL_FILENAME,
  SPIKE_17_MODEL_MIN_BYTES,
  SPIKE_17_MODEL_URLS,
  SPIKE_17_PROMPTS
} from './l0Spike17Config.js';
import { ensureGgufDownloaded, isGgufDownloadComplete } from './l0Download.js';
import { evaluateL0Verdict, rssMb, tokensPerSecond } from './l0Metrics.js';

function rssBytes() {
  return process.memoryUsage().rss;
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
      /* ignore */
    }
    try {
      if (llama && typeof llama.dispose === 'function') await llama.dispose();
    } catch {
      /* ignore */
    }
  })();
  await Promise.race([
    work,
    new Promise((resolve) => setTimeout(resolve, timeoutMs))
  ]);
}

/**
 * @param {string} modelPath
 * @param {(msg: string) => void} onProgress
 */
async function openSpikeSession(modelPath, onProgress) {
  onProgress('import node-llama-cpp');
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  onProgress('getLlama');
  const llama = await getLlama();
  const gpu =
    llama && llama.gpu != null
      ? String(llama.gpu)
      : llama && llama.gpuType != null
        ? String(llama.gpuType)
        : 'unknown';
  onProgress('loadModel');
  const model = await llama.loadModel({ modelPath });
  const context = await model.createContext();
  const chat = new LlamaChatSession({
    contextSequence: context.getSequence()
  });

  return {
    gpu,
    async generate(prompt, maxTokens = SPIKE_17_MAX_TOKENS) {
      if (typeof chat.resetChatHistory === 'function') {
        await chat.resetChatHistory();
      }
      let firstTokenAt = null;
      let tokenCount = 0;
      const genStarted = Date.now();
      const text = await chat.prompt(String(prompt || ''), {
        maxTokens,
        onTextChunk() {
          if (firstTokenAt == null) firstTokenAt = Date.now();
          tokenCount += 1;
        }
      });
      const genEnded = Date.now();
      const ttftMs =
        firstTokenAt == null ? genEnded - genStarted : firstTokenAt - genStarted;
      const genMs = Math.max(1, genEnded - (firstTokenAt ?? genStarted));
      return {
        text: String(text || ''),
        ttftMs,
        genMs,
        tokenCount,
        tokensPerSec: tokensPerSecond(tokenCount, genMs)
      };
    },
    async dispose() {
      await disposeQuietly(context, null, 4000);
      await disposeQuietly(model, llama, 8000);
    }
  };
}

/**
 * @param {string} modelDir
 * @param {{
 *   onProgress?: (msg: string) => void,
 *   generationCount?: number
 * }} [opts]
 */
export async function runSpike17Probe(modelDir, opts = {}) {
  const onProgress = opts.onProgress || (() => {});
  const generationCount = opts.generationCount ?? SPIKE_17_GENERATION_COUNT;
  const modelPath = path.join(modelDir, SPIKE_17_MODEL_FILENAME);
  const startedAt = Date.now();
  const rssBaselineMb = rssMb(rssBytes());
  let peakRssMb = rssBaselineMb;

  const bumpPeak = () => {
    peakRssMb = Math.max(peakRssMb, rssMb(rssBytes()));
  };

  onProgress('download');
  const downloadStarted = Date.now();
  const dl = await ensureGgufDownloaded(modelPath, SPIKE_17_MODEL_URLS, {
    minBytes: SPIKE_17_MODEL_MIN_BYTES,
    onProgress: ({ received, total }) => {
      onProgress(`download ${received}${total ? `/${total}` : ''}`);
    }
  });
  const downloadMs = Date.now() - downloadStarted;
  bumpPeak();

  const downloadComplete = isGgufDownloadComplete(
    dl.bytes,
    SPIKE_17_EXPECTED_BYTES,
    SPIKE_17_MODEL_MIN_BYTES
  );
  const bytesMatchExpected = dl.bytes === SPIKE_17_EXPECTED_BYTES;

  onProgress('load');
  const loadStarted = Date.now();
  /** @type {null | Awaited<ReturnType<typeof openSpikeSession>>} */
  let session = null;
  /** @type {Array<object>} */
  const generations = [];
  let gpu = 'unknown';
  let loadMs = null;

  try {
    session = await openSpikeSession(dl.path, onProgress);
    loadMs = Date.now() - loadStarted;
    gpu = session.gpu;
    bumpPeak();

    const prompts = SPIKE_17_PROMPTS.slice(0, generationCount);
    for (let i = 0; i < prompts.length; i += 1) {
      onProgress(`generate ${i + 1}/${prompts.length}`);
      const row = await session.generate(prompts[i]);
      bumpPeak();
      generations.push({
        index: i + 1,
        ttftMs: row.ttftMs,
        genMs: row.genMs,
        tokenCount: row.tokenCount,
        tokensPerSec: row.tokensPerSec,
        textPreview: row.text.slice(0, 200),
        rssMbAfterGen: rssMb(rssBytes())
      });
    }

    onProgress('unload');
    const rssBeforeUnloadMb = rssMb(rssBytes());
    const unloadStarted = Date.now();
    await session.dispose();
    session = null;
    const unloadMs = Date.now() - unloadStarted;
    await new Promise((resolve) => setTimeout(resolve, 500));
    bumpPeak();
    const rssAfterUnloadMb = rssMb(rssBytes());

    const first = generations[0] || {};
    const verdict = evaluateL0Verdict({
      loadError: null,
      ttftMs: first.ttftMs ?? null,
      tokensPerSec: first.tokensPerSec ?? null,
      rafP95DeltaMs: null
    });

    return {
      ok: downloadComplete && generations.length === generationCount && verdict.ok,
      host: {
        platform: process.platform,
        arch: process.arch,
        node: process.version,
        totalMemMb: Math.round(os.totalmem() / (1024 * 1024)),
        cpus: os.cpus()?.[0]?.model || ''
      },
      download: {
        path: dl.path,
        bytes: dl.bytes,
        expectedBytes: SPIKE_17_EXPECTED_BYTES,
        downloadedThisRun: dl.downloaded,
        downloadMs,
        complete: downloadComplete,
        bytesMatchExpected
      },
      loadMs,
      unloadMs,
      gpu,
      generations,
      rssMbBaseline: rssBaselineMb,
      rssMbPeak: peakRssMb,
      rssMbBeforeUnload: rssBeforeUnloadMb,
      rssMbAfterUnload: rssAfterUnloadMb,
      unloadReleasedMb:
        Math.round((rssBeforeUnloadMb - rssAfterUnloadMb) * 10) / 10,
      totalMs: Date.now() - startedAt,
      verdict,
      modelId: 'Qwen3-1.7B-Q4_K_M-unsloth'
    };
  } catch (err) {
    if (session) {
      try {
        await session.dispose();
      } catch {
        /* ignore */
      }
    }
    return {
      ok: false,
      loadError: err instanceof Error ? err.message : String(err),
      host: {
        platform: process.platform,
        arch: process.arch,
        node: process.version,
        totalMemMb: Math.round(os.totalmem() / (1024 * 1024))
      },
      download: {
        path: dl.path,
        bytes: dl.bytes,
        expectedBytes: SPIKE_17_EXPECTED_BYTES,
        downloadedThisRun: dl.downloaded,
        downloadMs,
        complete: downloadComplete,
        bytesMatchExpected
      },
      generations,
      rssMbBaseline: rssBaselineMb,
      rssMbPeak: peakRssMb,
      totalMs: Date.now() - startedAt
    };
  }
}
